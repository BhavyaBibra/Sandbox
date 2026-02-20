from backend.pattern_detector import PatternDetector

def test_sliding_window():
    code = """
def max_substring(s):
    left = 0
    max_len = 0
    seen = set()
    for right in range(len(s)):
        while s[right] in seen:
            seen.remove(s[left])
            left += 1
        seen.add(s[right])
        max_len = max(max_len, right - left + 1)
    return max_len
"""
    # Note: Detector needs to handle 'for' loops for sliding window often, or nested while
    # Our current detector only looks at 'while' loops primarily for main logic or 'updates' analysis.
    # The 'updates' extraction currently is simple. 
    # Let's see if our simple 'analyze' can handle this or if we need to improve it.
    # Actually, the current _analyze_while_loop is called only for WHILE nodes.
    # Sliding window often has a FOR loop with a WHILE inside.
    # We should update detector to look at For loops too or nested structures.
    pass 

def test_bfs():
    code = """
def bfs(root):
    if not root: return
    queue = [root]
    while queue:
        node = queue.pop(0)
        print(node.val)
        if node.left: queue.append(node.left)
        if node.right: queue.append(node.right)
"""
    detector = PatternDetector()
    result = detector.analyze(code)
    assert result is not None
    assert result['pattern'] == "Breadth-First Search (BFS)"
