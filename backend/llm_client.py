import os
from tempfile import tempdir
from groq import Groq
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

# Initialize the Groq client
# The SDK automatically looks for the GROQ_API_KEY environment variable.
client = Groq()

def generate_response(message: str, context: dict) -> str:
    """
    Generate a response using the Groq API and the llama-3.1-8b-instant model.
    """
    system_prompt = f"""You are Sandbox, an execution visualization tutor. Explain runtime behavior using provided execution context. Be concise, refer to variables explicitly, and avoid speculation. If the user provides an Expected Output that does not match the Actual Output, explicitly trace through the execution to pinpoint where the logic diverged from the expected behavior.

Current Context:
Execution Summary: {context.get('execution_summary', 'None')}
Variable State: {context.get('variable_summary', 'None')}

Output Verification:
{context.get('output_verification', 'None')}

Full Code:
{context.get('full_code', 'None')}

Current Execution Point:
{context.get('code_focus', 'None')}

Recent Events: {context.get('recent_events', 'None')}
"""
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": message}
    ]

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        temperature=0.7,
        max_tokens=500
    )
    
    return response.choices[0].message.content

if __name__ == "__main__":
    # Test script entry point
    test_context = {
        "execution_summary": "Paused at line 14.",
        "variable_summary": "node = 5",
        "code_focus": "14: return dfs(node.left)",
        "recent_events": "Exploring left sub-tree."
    }
    
    try:
        print("Testing generation with Groq API...")
        reply = generate_response("What happens if my node is None?", test_context)
        print("=== Groq Response ===")
        print(reply)
        print("=====================")
    except Exception as e:
        print(f"Error calling Groq API: {e}")
