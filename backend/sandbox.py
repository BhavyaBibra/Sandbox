import ast

class SecurityError(Exception):
    pass

def validate_code(code: str):
    """
    Statically analyze code to block forbidden imports and constructs.
    """
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        raise SecurityError(f"Syntax Error: {e}")

    for node in ast.walk(tree):
        # Block imports
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            for alias in node.names:
                if alias.name in BANNED_MODULES:
                     raise SecurityError(f"Import of '{alias.name}' is forbidden.")
        
        # Block other potentially dangerous things if needed (e.g. open)
        # However, 'open' is a builtin, which is harder to block via AST unless we check Call nodes.
        # Runtime blocking via creating a restricted globals dict is better for builtins.

BANNED_MODULES = {
    'os', 'sys', 'subprocess', 'shutil', 'socket', 'requests', 'urllib', 'http', 'ftplib', 'telnetlib', 'importlib'
}
