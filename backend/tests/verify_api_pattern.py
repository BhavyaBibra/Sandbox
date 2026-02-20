import requests
import json

def test_pattern_api():
    url = "http://127.0.0.1:8000/run"
    
    # Test Two Pointers
    code_tp = """
def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]: return False
        left += 1
        right -= 1
    return True
"""
    try:
        resp = requests.post(url, json={"code": code_tp})
        data = resp.json()
        print(f"Two Pointers Pattern: {data.get('pattern')}")
        assert data.get('pattern') is not None
        assert data['pattern']['pattern'] == 'Two Pointers'
    except Exception as e:
        print(f"Two Pointers API Test Failed: {e}")

if __name__ == "__main__":
    test_pattern_api()
