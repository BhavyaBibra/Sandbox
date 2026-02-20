export interface Template {
    id: string;
    title: string;
    description: string;
    code: string;
}

export const STARTER_TEMPLATES: Template[] = [
    {
        id: 'array-traversal',
        title: 'Two Pointers (Array)',
        description: 'Demonstrates scanning a sequence from both ends towards the center.',
        code: `def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]: return False
        left += 1
        right -= 1
    return True

is_palindrome("racecar")`
    },
    {
        id: 'sliding-window',
        title: 'Sliding Window',
        description: 'Finds the maximum sum of a contiguous subarray of size k.',
        code: `def max_subarray_sum(arr, k):
    n = len(arr)
    if n < k: return -1
    
    window_sum = sum(arr[:k])
    max_sum = window_sum
    
    for i in range(n - k):
        window_sum = window_sum - arr[i] + arr[i + k]
        max_sum = max(max_sum, window_sum)
        
    return max_sum

arr = [1, 4, 2, 10, 2, 3, 1, 0, 20]
k = 4
max_subarray_sum(arr, k)`
    },
    {
        id: 'recursion',
        title: 'Recursion (Fibonacci)',
        description: 'Classic recursive approach showing the call stack buildup.',
        code: `def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

fib(4)`
    },
    {
        id: 'tree-traversal',
        title: 'Tree Traversal (BST)',
        description: 'Constructs a Binary Search Tree and performs an in-order traversal.',
        code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def insert(root, val):
    if not root: return TreeNode(val)
    if val < root.val: root.left = insert(root.left, val)
    else: root.right = insert(root.right, val)
    return root

def inorder(root, result):
    if root:
        inorder(root.left, result)
        result.append(root.val)
        inorder(root.right, result)

# Build BST
root = None
for val in [5, 3, 7, 2, 4, 6, 8]:
    root = insert(root, val)

# Traverse
result = []
inorder(root, result)`
    }
];

export const BENCHMARK_SUITE: Template[] = [
    {
        id: 'bench-two-sum',
        title: 'Two Sum (Hash Map)',
        description: 'Optimal O(n) solution using a dictionary.',
        code: `def two_sum(nums, target):
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []

two_sum([2, 7, 11, 15], 9)`
    },
    {
        id: 'bench-longest-substring',
        title: 'Longest Substring',
        description: 'Optimal sliding window with set for character tracking.',
        code: `def length_of_longest_substring(s):
    char_set = set()
    left = 0
    max_len = 0
    
    for right in range(len(s)):
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
        char_set.add(s[right])
        max_len = max(max_len, right - left + 1)
        
    return max_len

length_of_longest_substring("abcabcbb")`
    },
    {
        id: 'bench-reverse-ll',
        title: 'Reverse Linked List',
        description: 'Iterative pointer manipulation to reverse a singly linked list.',
        code: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverseList(head):
    prev = None
    curr = head
    while curr:
        next_temp = curr.next
        curr.next = prev
        prev = curr
        curr = next_temp
    return prev

head = ListNode(1, ListNode(2, ListNode(3, ListNode(4, ListNode(5)))))
reverseList(head)`
    },
    {
        id: 'bench-bfs',
        title: 'BFS Traversal',
        description: 'Level-order traversal using a queue list.',
        code: `class TreeNode:
    def __init__(self, x):
        self.val = x
        self.left = None
        self.right = None

def levelOrder(root):
    if not root: return []
    result = []
    queue = [root]
    
    while queue:
        level_size = len(queue)
        current_level = []
        for _ in range(level_size):
            node = queue.pop(0)
            current_level.append(node.val)
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)
        result.append(current_level)
    return result

root = TreeNode(3)
root.left = TreeNode(9)
root.right = TreeNode(20)
root.right.left = TreeNode(15)
root.right.right = TreeNode(7)

levelOrder(root)`
    },
    {
        id: 'bench-coin-change',
        title: 'Coin Change (DP)',
        description: 'Dynamic programming bottom-up array approach.',
        code: `def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    
    for a in range(1, amount + 1):
        for coin in coins:
            if a - coin >= 0:
                dp[a] = min(dp[a], dp[a - coin] + 1)
                
    return dp[amount] if dp[amount] != float('inf') else -1

coin_change([1, 2, 5], 11)`
    }
];
