import ast
from typing import Optional

def wrap_leetcode_code(code: str, test_cases: Optional[str] = None, expected_output: Optional[str] = None) -> str:
    if not test_cases or not test_cases.strip():
        return code

    try:
        tree = ast.parse(code)
    except SyntaxError:
        # If there's a syntax error, just append test cases and let execution handle the crash
        return code + "\n\n" + test_cases

    solution_class = None
    for node in tree.body:
        if isinstance(node, ast.ClassDef) and node.name == 'Solution':
            solution_class = node
            break

    if not solution_class:
        return code + "\n\n" + test_cases

    method = None
    for node in solution_class.body:
        if isinstance(node, ast.FunctionDef) and node.name != '__init__':
            method = node
            break

    if not method:
        return code + "\n\n" + test_cases

    # Extract argument names excluding 'self'
    arg_names = [arg.arg for arg in method.args.args if arg.arg != 'self']
    
    # Build the runner code
    runner = f"\n\n# --- User Test Cases ---\n{test_cases}\n\n"
    runner += f"# --- Auto-Generated Execution ---\n"
    runner += f"__sol = Solution()\n"
    
    # We pass variables matching argument names. 
    # If the user defined them in the test cases, they will be in locals()
    call_args = ", ".join([f"{arg}={arg}" for arg in arg_names])
    runner += f"__res = __sol.{method.name}({call_args})\n"
    
    if expected_output and expected_output.strip():
        runner += f"__expected = {expected_output.strip()}\n"
        runner += f"if __res != __expected:\n"
        runner += f"    print(f'\\n[Mismatch] Logic Error: Output was {{__res}}, but expected {{__expected}}')\n"
        runner += f"else:\n"
        runner += f"    print(f'\\n[Success] Output {{__res}} matched expected.')\n"
    else:
        runner += f"print(f'\\n[Output] {{__res}}')\n"

    return code + runner
