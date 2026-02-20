import pytest
from backend.tracer import TraceRunner
from backend.sandbox import validate_code, SecurityError

def test_tracer_simple_assignment():
    code = "x = 5"
    runner = TraceRunner()
    trace = runner.run(code)
    assert len(trace) > 0
    last_frame = trace[-1]
    assert last_frame['locals']['x'] == 5

def test_tracer_loop():
    code = """
x = 0
for i in range(3):
    x += i
"""
    runner = TraceRunner()
    trace = runner.run(code)
    assert len(trace) > 3
    final_x = trace[-1]['locals']['x']
    assert final_x == 3

def test_sandbox_banned_import():
    code = "import os"
    try:
        validate_code(code)
        assert False, "Should have raised SecurityError"
    except SecurityError:
        pass

def test_list_serialization():
    code = """
arr = [1, 2, 3]
"""
    runner = TraceRunner()
    trace = runner.run(code)
    last_frame = trace[-1]
    assert last_frame['locals']['arr'] == [1, 2, 3]
