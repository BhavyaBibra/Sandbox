import ast

class PatternDetector:
    def __init__(self):
        self.patterns = []

    def analyze(self, code: str):
        try:
            tree = ast.parse(code)
        except SyntaxError:
            return None
        
        detected = []
        
        # 1. Two Pointers / Sliding Window / Binary Search (Iterative)
        # Look for while loops with specific conditions and updates
        for node in ast.walk(tree):
            if isinstance(node, ast.While):
                confidence = self._analyze_while_loop(node)
                if confidence:
                    detected.append(confidence)
            
            # DFS (Recursion)
            if isinstance(node, ast.FunctionDef):
                if self._is_recursive(node):
                     detected.append({"pattern": "Depth-First Search (Recursion)", "confidence": 0.9, "tests": ["root = ..."]})

        # Remove duplicates, pick highest confidence
        if not detected:
            return None
        
        # specific handling for conflicts (e.g. BS vs Two Pointers)
        best_match = max(detected, key=lambda x: x['confidence'])
        return best_match

    def _analyze_while_loop(self, loop_node):
        # Heuristics for while loops
        conditions = self._get_conditions(loop_node.test)
        updates = self._get_updates(loop_node.body)
        
        # Binary Search: left <= right, left = mid + 1, right = mid - 1
        # Check for mid calculation?
        has_mid = any('mid' in up or '// 2' in up for up in updates) # broad check
        if 'left <= right' in conditions or 'low <= high' in conditions:
             if has_mid:
                 return {"pattern": "Binary Search", "confidence": 0.95, "tests": ["arr = [1, 3, 5, 7], target = 5"]}

        # Two Pointers: left < right, left += 1, right -= 1
        if 'left < right' in conditions or 'l < r' in conditions:
            if 'left += 1' in updates and 'right -= 1' in updates:
                 return {"pattern": "Two Pointers", "confidence": 0.9, "tests": ["s = 'racecar'", "arr = [1, 2, 3]"]}

        # Reverse Linked List: curr is not None
        # updates: next_temp = curr.next, curr.next = prev, prev = curr, curr = next_temp
        if 'curr' in str(conditions) or 'head' in str(conditions):
            if 'curr.next = prev' in updates or 'curr.next = previous' in updates:
                return {"pattern": "Reverse Linked List", "confidence": 0.95, "tests": ["head = ListNode(1, ListNode(2))"]}
        # Sliding Window: for right in range / while right < n ... left += 1
        if 'right += 1' in updates and 'left += 1' in updates:
             # Distinguish from Two Pointers (usually opposite directions)
             # Sliding window both move in positive direction usually
             return {"pattern": "Sliding Window", "confidence": 0.85, "tests": ["s = 'pwwkew'", "nums = [1,3,-1,-3,5,3,6,7], k = 3"]}

        # BFS: queue usage
        # This checks for .pop(0) or .popleft() inside the loop
        for update in updates:
            if 'pop(0)' in update or 'popleft()' in update:
                return {"pattern": "Breadth-First Search (BFS)", "confidence": 0.9, "tests": ["root = ..."]}
            
        return None

    def _get_conditions(self, test_node):
        # minimal string representation of condition
        # This is simplified; ideally traverse AST specific comparison
        try:
            return ast.unparse(test_node)
        except:
            return ""

    def _get_updates(self, body_nodes):
        updates = []
        for n in body_nodes:
            try:
                if isinstance(n, ast.Assign):
                    updates.append(ast.unparse(n))
                elif isinstance(n, ast.AugAssign):
                    updates.append(ast.unparse(n))
                # also check nested ifs
                if isinstance(n, ast.If):
                     updates.extend(self._get_updates(n.body))
                     updates.extend(self._get_updates(n.orelse))
            except:
                pass
        return updates

    def _is_recursive(self, func_node):
        func_name = func_node.name
        for node in ast.walk(func_node):
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name) and node.func.id == func_name:
                    return True
        return False
