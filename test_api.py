import requests

code = """
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
"""
try:
    response = requests.post("http://localhost:8000/run", json={"code": code})
    data = response.json()
    trace = data.get("trace", [])
    print(f"Total steps: {len(trace)}")
    if trace:
        print("Keys in step 0:", trace[0].keys())
        if len(trace) > 1:
            print("Keys in step 1:", trace[1].keys())
            print("Objects in step 1:", trace[1].get('objects'))
except Exception as e:
    print("Error:", e)
