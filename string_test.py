def longest_palindrome(s: str) -> str:
    if not s:
        return ""
    
    start = 0
    end = 0
    
    for i in range(len(s)):
        # Odd length palindrome
        left = i
        right = i
        while left >= 0 and right < len(s) and s[left] == s[right]:
            if (right - left) > (end - start):
                start = left
                end = right
            left -= 1
            right += 1
            
    return s[start:end+1]

longest_palindrome("babad")
