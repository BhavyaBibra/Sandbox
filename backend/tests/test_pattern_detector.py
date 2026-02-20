from backend.pattern_detector import PatternDetector

def test_two_pointers():
    code = """
def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True
"""
    detector = PatternDetector()
    result = detector.analyze(code)
    assert result is not None
    assert result['pattern'] == "Two Pointers"

def test_binary_search():
    code = """
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
"""
    detector = PatternDetector()
    result = detector.analyze(code)
    assert result is not None
    assert result['pattern'] == "Binary Search"

def test_reverse_linked_list():
    code = """
def reverseList(head):
    prev = None
    curr = head
    while curr:
        next_temp = curr.next
        curr.next = prev
        prev = curr
        curr = next_temp
    return prev
"""
    detector = PatternDetector()
    result = detector.analyze(code)
    assert result is not None
    assert result['pattern'] == "Reverse Linked List"

def test_recursion_dfs():
    code = """
def factorial(n):
    if n == 0: return 1
    return n * factorial(n-1)
"""
    detector = PatternDetector()
    result = detector.analyze(code)
    assert result is not None
    assert "Recursion" in result['pattern']
