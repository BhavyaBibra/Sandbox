from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import redirect_stdout, redirect_stderr
import io
import sys
import os
import time
import httpx
from dotenv import load_dotenv

# Load the environment variables from the .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

from .models import ExecutionRequest, ExecutionResponse, ChatResponse, APIChatRequest
from .tracer import TraceRunner
from .sandbox import validate_code, SecurityError
from .context_packager import package_chat_context

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://127.0.0.1:5173", 
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/run", response_model=ExecutionResponse)
async def run_code(request: ExecutionRequest):
    code = request.code
    
    # 1. Static Analysis
    try:
        validate_code(code)
    except SecurityError as e:
        return ExecutionResponse(trace=[], error=str(e))
    except Exception as e:
        return ExecutionResponse(trace=[], error=f"Validation Error: {str(e)}")

    # 2. Execution with Tracing
    tracer = TraceRunner()
    
    # Capture stdout
    stdout_capture = io.StringIO()
    
    try:
        with redirect_stdout(stdout_capture):
            tracer.run(code)
    except Exception as e:
        pass  # tracer.run handles this internally

    # 3. Pattern Detection
    from .pattern_detector import PatternDetector
    detector = PatternDetector()
    pattern_result = detector.analyze(code)
    
    # 4. Capture stdout output
    stdout_output = stdout_capture.getvalue().strip() or None
    
    # 5. Format Response — use tracer's crash state for error
    error_message = tracer.crash_message if tracer.crashed else None
    
    return ExecutionResponse(
        trace=tracer.trace_data,
        error=error_message,
        pattern=pattern_result,
        output=stdout_output
    )

# Simple in-memory rate limiting: session_ip -> (count, reset_time)
chat_rate_limits = {}
CHAT_RATE_LIMIT_MAX = 10
CHAT_RATE_LIMIT_WINDOW = 60  # seconds

@app.post("/api/chat", response_model=ChatResponse)
async def api_chat(request: APIChatRequest, req: Request):
    # Log the incoming payload size safely without reading the consumed body stream
    content_length = req.headers.get("content-length", 0)
    print(f"Incoming /api/chat payload size: {content_length} bytes")
    
    # Rate Limiting
    client_ip = req.client.host if req.client else "unknown"

    now = time.time()
    
    if client_ip in chat_rate_limits:
        count, reset_time = chat_rate_limits[client_ip]
        if now > reset_time:
            chat_rate_limits[client_ip] = (1, now + CHAT_RATE_LIMIT_WINDOW)
        else:
            if count >= CHAT_RATE_LIMIT_MAX:
                raise HTTPException(status_code=429, detail="Too many requests")
            chat_rate_limits[client_ip] = (count + 1, reset_time)
    else:
        chat_rate_limits[client_ip] = (1, now + CHAT_RATE_LIMIT_WINDOW)
    
    start_time = time.time()
    try:
        # Package Context
        ctx = package_chat_context(
            code=request.code,
            snapshot=request.snapshot,
            annotations=request.annotations
        )

        from .llm_client import generate_response
        assistant_reply = generate_response(request.message, ctx)
        
        latency = time.time() - start_time
        print(f"Groq APIChatRequest processed in {latency:.2f} seconds.")
        
        return ChatResponse(response=assistant_reply)
        
    except httpx.TimeoutException:
        latency = time.time() - start_time
        print(f"Groq APIChatRequest timed out after {latency:.2f} seconds.")
        raise HTTPException(status_code=504, detail="Request to AI service timed out")
    except Exception as e:
        latency = time.time() - start_time
        print(f"Groq APIChatRequest failed after {latency:.2f} seconds. Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "ok"}
