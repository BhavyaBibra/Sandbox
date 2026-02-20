import sys
import os
import json
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from context_packager import package_chat_context

def test_context_packaging():
    code = """def dfs(node):
    if not node:
        return
    visited.add(node)
    for child in node.children:
        dfs(child)
"""
    snapshot = {
        "line": 4,
        "func_name": "dfs",
        "stack": [
            {"line": 10, "name": "<module>", "locals": {}},
            {"line": 4, "name": "dfs", "locals": {"node": "Node(1)", "visited": "{Node(1)}", "child": "Node(2)"}}
        ]
    }
    
    annotations = [
        {"type": "insight", "message": "Starting DFS traversal."},
        {"type": "insight", "message": "Visiting root node 1."},
        {"type": "insight", "message": "Adding node 1 to visited set."}
    ]
    
    context = package_chat_context(code, snapshot, annotations)
    
    print("=== Example Context Output ===")
    print(json.dumps(context, indent=2))
    print("="*30)
    
    # Assertions
    assert "Paused at line 4 in function 'dfs'" in context["execution_summary"]
    assert "node = Node(1)" in context["variable_summary"]
    assert "visited.add(node)" in context["code_focus"]
    assert "Adding node 1 to visited set" in context["recent_events"]
    
    total_len = sum(len(str(v)) for v in context.values())
    assert total_len < 1500, f"Context too large! {total_len} chars"

if __name__ == "__main__":
    test_context_packaging()
