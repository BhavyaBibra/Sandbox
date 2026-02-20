import requests
import json
import time

def test_api_chat():
    url = "http://localhost:8001/api/chat"
    payload = {
        "message": "What is happens to 'node' on this line?",
        "code": "def dfs(node):\n    if not node:\n        return\n    visited.add(node)\n    for child in node.children:\n        dfs(child)",
        "snapshot": {
            "line": 4,
            "func_name": "dfs",
            "stack": [
                {"line": 4, "name": "dfs", "locals": {"node": "Node(1)", "visited": "{Node(1)}"}}
            ]
        },
        "annotations": [
            "Starting DFS traversal.",
            "Adding node 1 to visited set."
        ]
    }
    
    headers = {
        "Content-Type": "application/json"
    }

    print(f"Sending request to {url}...")
    start = time.time()
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=12)
        print(f"Status Code: {response.status_code}")
        print("Response Body:")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")
    finally:
        print(f"Total time elapsed: {time.time() - start:.2f}s")

if __name__ == "__main__":
    test_api_chat()
