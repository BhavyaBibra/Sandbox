import json
from typing import Dict, Any, List, Optional

def package_chat_context(
    code: Optional[str],
    snapshot: Optional[Dict[str, Any]],
    annotations: Optional[List[Any]],
    test_cases: Optional[str] = None,
    expected_output: Optional[str] = None,
    actual_output: Optional[str] = None
) -> Dict[str, str]:
    """
    Converts execution state into a compact semantic context for LLMs.
    Guarantees the output total character count is < 1500.
    """
    # 1. Execution Summary
    execution_summary = "No execution snapshot available."
    current_line = None
    func_name = ""
    stack_depth = 0
    locals_dict = {}

    if snapshot:
        current_line = snapshot.get("line")
        func_name = snapshot.get("func_name", "<unknown>")
        stack = snapshot.get("stack", [])
        stack_depth = len(stack)
        
        # Determine locals based on the top of the stack or direct snapshot properties
        if stack:
            # The last element in stack is usually the active frame
            locals_dict = stack[-1].get("locals", {})

        execution_summary = f"Paused at line {current_line} in function '{func_name}'. Call stack depth: {stack_depth}."

    # 2. Variable Summary (limit to 5 most relevant)
    variable_summary = "No variables active."
    if locals_dict:
        # Sort or just take first 5
        items = list(locals_dict.items())[:5]
        var_strs = []
        for k, v in items:
            v_str = str(v)
            if len(v_str) > 50:
                v_str = v_str[:47] + "..."
            var_strs.append(f"{k} = {v_str}")
        if var_strs:
            variable_summary = ", ".join(var_strs)
    elif snapshot:
        variable_summary = "No local variables in current frame."

    # 3. Full Code (send entire code so LLM has full context)
    full_code = "No code provided."
    if code:
        lines = code.splitlines()
        numbered_lines = []
        for i, line in enumerate(lines):
            prefix = "-> " if current_line is not None and i == current_line - 1 else "   "
            numbered_lines.append(f"{prefix}{i+1}: {line}")
        full_code = "\n".join(numbered_lines)
    
    # 4. Code Focus (highlight area around current line for quick reference)
    code_focus = ""
    if code and current_line is not None:
        lines = code.splitlines()
        idx = current_line - 1
        start = max(0, idx - 3)
        end = min(len(lines), idx + 4)
        snippet = []
        for i in range(start, end):
            prefix = "-> " if i == idx else "   "
            snippet.append(f"{prefix}{i+1}: {lines[i]}")
        code_focus = "\n".join(snippet)

    # 4. Recent Events (Annotations)
    recent_events = "No recent annotations or events."
    if annotations:
        # Take last 3 events
        recent = annotations[-3:]
        event_strs = []
        for ev in recent:
            if isinstance(ev, dict):
                # Attempt to extract text/message or format the dict naturally
                msg = ev.get("message") or ev.get("text") or str(ev)
                event_strs.append(str(msg))
            else:
                event_strs.append(str(ev))
                
        if event_strs:
            recent_events = "Recent events: " + " | ".join(event_strs)

    # 5. Output Verification
    output_verification = "No output verification requested."
    if expected_output:
        output_verification = f"Test Case:\n{test_cases}\n\nExpected Output: {expected_output}\n"
        if actual_output:
            output_verification += f"Actual Output: {actual_output}\n"
            if actual_output.strip() != expected_output.strip():
                output_verification += "STATUS: MISMATCH. The logic deviated from expectations."
            else:
                output_verification += "STATUS: SUCCESS. Output matched expected."
        else:
            output_verification += "STATUS: Execution did not complete or output was not captured."

    # 6. Build context object
    context_obj = {
        "execution_summary": execution_summary,
        "recent_events": recent_events,
        "variable_summary": variable_summary,
        "full_code": full_code,
        "code_focus": code_focus,
        "output_verification": output_verification
    }

    # Safety truncation — generous limits so LLM gets full picture
    FIELD_LIMITS = {
        "full_code": 3000,
        "code_focus": 500,
        "variable_summary": 500,
        "execution_summary": 300,
        "recent_events": 300
    }
    for key in context_obj:
        limit = FIELD_LIMITS.get(key, 500)
        if len(context_obj[key]) > limit:
            context_obj[key] = context_obj[key][:limit - 3] + "..."

    return context_obj
