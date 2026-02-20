from trace import Trace
from tracer import TraceRunner

def test_tracer_filter_eligibility():
    code = """
import math
import typing

class Node:
    def __init__(self, val=0):
        self.val = val

def helper():
    pass

def main():
    a = 10
    b = "hello"
    c = [1, 2, 3]
    d = Node(5)
    e = helper
    f = math
    g = typing.List
    h = Node

main()
"""
    runner = TraceRunner()
    trace_data = runner.run(code)

    # Find the snapshot where 'main' is executing and all variables are assigned
    # It should be the last 'line' event in 'main' right before it returns.
    main_snapshots = [t for t in trace_data if t['func_name'] == 'main' and t['event'] == 'line']
    final_main_snapshot = main_snapshots[-1]

    # The active frame should be the first one in the stack
    active_frame = final_main_snapshot['stack'][0]
    locals_dict = active_frame['locals']

    # check included items
    assert 'a' in locals_dict, "Primitive 'a' should be included"
    assert 'b' in locals_dict, "String 'b' should be included"
    assert 'c' in locals_dict, "List 'c' should be included"
    assert 'd' in locals_dict, "Instance 'd' should be included"

    # check excluded items
    assert 'e' not in locals_dict, "Function 'e' should be excluded"
    assert 'f' not in locals_dict, "Module 'f' should be excluded"
    assert 'g' not in locals_dict, "Typing 'g' should be excluded"
    assert 'h' not in locals_dict, "Class 'h' should be excluded"

    print("All eligibility filter tests passed!")

if __name__ == "__main__":
    test_tracer_filter_eligibility()
