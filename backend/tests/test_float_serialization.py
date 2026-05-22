"""
Tests for safe float serialization in the Sandbox tracer.
Verifies:
  - float('inf') → "Infinity"
  - float('-inf') → "-Infinity"
  - float('nan') → "NaN"
  - Normal floats pass through unchanged
  - Booleans are NOT treated as floats
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from backend.tracer import TraceRunner


def test_positive_infinity():
    tracer = TraceRunner()
    result = tracer._serialize(float('inf'))
    assert result == "Infinity", f"Expected 'Infinity', got {result!r}"
    print("✅ float('inf') → 'Infinity'")


def test_negative_infinity():
    tracer = TraceRunner()
    result = tracer._serialize(float('-inf'))
    assert result == "-Infinity", f"Expected '-Infinity', got {result!r}"
    print("✅ float('-inf') → '-Infinity'")


def test_nan():
    tracer = TraceRunner()
    result = tracer._serialize(float('nan'))
    assert result == "NaN", f"Expected 'NaN', got {result!r}"
    print("✅ float('nan') → 'NaN'")


def test_normal_float():
    tracer = TraceRunner()
    result = tracer._serialize(3.14)
    assert result == 3.14, f"Expected 3.14, got {result!r}"
    print("✅ Normal float 3.14 passes through")


def test_zero_float():
    tracer = TraceRunner()
    result = tracer._serialize(0.0)
    assert result == 0.0, f"Expected 0.0, got {result!r}"
    print("✅ Float 0.0 passes through")


def test_negative_float():
    tracer = TraceRunner()
    result = tracer._serialize(-42.5)
    assert result == -42.5, f"Expected -42.5, got {result!r}"
    print("✅ Negative float passes through")


def test_bool_not_treated_as_float():
    """bool is a subclass of int — ensure it's returned as-is, not as float."""
    tracer = TraceRunner()
    assert tracer._serialize(True) is True, "True should serialize as True"
    assert tracer._serialize(False) is False, "False should serialize as False"
    print("✅ Booleans not treated as floats")


def test_inf_in_list():
    """float('inf') inside a list should serialize to 'Infinity' string."""
    tracer = TraceRunner()
    ref = tracer._serialize([float('inf'), float('-inf'), 1.0])
    full = tracer.current_trace_objects[ref['id']]
    values = full['value']
    assert values[0] == "Infinity", f"Expected 'Infinity', got {values[0]!r}"
    assert values[1] == "-Infinity", f"Expected '-Infinity', got {values[1]!r}"
    assert values[2] == 1.0, f"Expected 1.0, got {values[2]!r}"
    print("✅ Special floats inside list serialize correctly")


def test_inf_in_dict():
    """float('inf') inside a dict should serialize to 'Infinity' string."""
    tracer = TraceRunner()
    ref = tracer._serialize({'min_cost': float('inf'), 'max_val': float('-inf')})
    full = tracer.current_trace_objects[ref['id']]
    values = full['value']
    assert values['min_cost'] == "Infinity", f"Expected 'Infinity', got {values['min_cost']!r}"
    assert values['max_val'] == "-Infinity", f"Expected '-Infinity', got {values['max_val']!r}"
    print("✅ Special floats inside dict serialize correctly")


def test_inf_in_trace():
    """Run code using float('inf') and verify trace doesn't crash."""
    tracer = TraceRunner()
    code = """
dp = [float('inf')] * 5
dp[0] = 0
"""
    tracer.run(code)
    assert not tracer.crashed, f"Tracer crashed: {tracer.crash_message}"
    assert len(tracer.trace_data) > 0, "Trace should have steps"
    print("✅ Code with float('inf') traces without crash")


if __name__ == '__main__':
    tests = [
        test_positive_infinity,
        test_negative_infinity,
        test_nan,
        test_normal_float,
        test_zero_float,
        test_negative_float,
        test_bool_not_treated_as_float,
        test_inf_in_list,
        test_inf_in_dict,
        test_inf_in_trace,
    ]

    passed = failed = 0
    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            print(f"❌ {test.__name__}: {e}")
            failed += 1

    print(f"\n{'='*40}")
    print(f"Results: {passed} passed, {failed} failed, {passed + failed} total")
    if failed == 0:
        print("All tests passed! ✅")
    else:
        sys.exit(1)
