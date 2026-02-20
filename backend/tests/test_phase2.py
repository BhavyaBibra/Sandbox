import pytest
from backend.tracer import TraceRunner

def test_recursion_factorial():
    code = """
def fact(n):
    if n <= 1: return 1
    return n * fact(n-1)

x = fact(3)
"""
    runner = TraceRunner()
    trace = runner.run(code)
    
    # Check max stack depth
    # fact(3) -> fact(2) -> fact(1)
    # plus module level frame
    max_depth = 0
    for step in trace:
        max_depth = max(max_depth, len(step['stack']))
    
    assert max_depth >= 4 # Module + fact(3) + fact(2) + fact(1)

def test_aliasing():
    code = """
a = [1, 2]
b = a
b.append(3)
"""
    runner = TraceRunner()
    trace = runner.run(code)
    
    # Find step where a and b exist
    last_frame = trace[-1]['stack'][0]['locals']
    
    obj_a = last_frame['a']
    obj_b = last_frame['b']
    
    assert obj_a['type'] == 'list'
    assert obj_b['type'] == 'list'
    assert obj_a['id'] == obj_b['id'] # IDs must be identical
    assert obj_a['value'] == [1, 2, 3]

def test_distinct_lists():
    code = """
a = [1]
b = [1]
"""
    runner = TraceRunner()
    trace = runner.run(code)
    
    last_frame = trace[-1]['stack'][0]['locals']
    obj_a = last_frame['a']
    obj_b = last_frame['b']
    
    assert obj_a['id'] != obj_b['id'] # IDs must be different
