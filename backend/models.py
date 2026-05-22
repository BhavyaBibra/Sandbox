from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Union

class ExecutionRequest(BaseModel):
    code: str

class StackFrame(BaseModel):
    line: int
    name: str
    locals: Dict[str, Any]

class TraceStep(BaseModel):
    line: int
    event: str  # "line", "call", "return", "exception"
    func_name: str
    stack: List[StackFrame]
    objects: Optional[Dict[str, Any]] = None
    exception: Optional[str] = None

class Sequence(BaseModel):
    id: str
    value: List[Any]

class PatternSuggestion(BaseModel):
    pattern: str
    confidence: float
    tests: List[str]

class ExecutionResponse(BaseModel):
    trace: List[TraceStep]
    error: Optional[str] = None
    pattern: Optional[Dict[str, Any]] = None
    output: Optional[str] = None
    truncated: bool = False

class ChatContext(BaseModel):
    code: str
    current_line: Optional[int] = None
    locals: Dict[str, Any] = {}
    insights: List[Dict[str, Any]] = []
    pattern: Optional[str] = None

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: ChatContext

class ChatResponse(BaseModel):
    response: str

class APIChatRequest(BaseModel):
    message: str
    code: Optional[str] = None
    snapshot: Optional[Dict[str, Any]] = None
    annotations: Optional[List[Any]] = None
