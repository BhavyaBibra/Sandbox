"""
Tests for defaultdict and Counter serialization in the Sandbox tracer.
Verifies:
  - defaultdict(int) is detected as 'dict' and serialized with key/value pairs
  - Counter("abc") is detected as 'dict' and serialized with correct counts
  - Object identity remains stable across serialize calls
"""
import sys
import os

# Add the parent directory so we can import the backend module
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from backend.tracer import TraceRunner
from collections import defaultdict, Counter


def test_defaultdict_detection():
    """defaultdict(int) should be detected as 'dict' type."""
    tracer = TraceRunner()
    dd = defaultdict(int)
    dd['a'] = 1
    dd['b'] = 2
    
    assert tracer._detect_type(dd) == 'dict', f"Expected 'dict', got '{tracer._detect_type(dd)}'"
    print("✅ defaultdict detected as 'dict'")


def test_defaultdict_serialization():
    """defaultdict should serialize to a dict with correct key/value pairs."""
    tracer = TraceRunner()
    dd = defaultdict(int)
    dd['x'] = 10
    dd['y'] = 20
    dd['z'] = 30

    ref = tracer._serialize(dd)
    # _serialize returns a ref — the full data is in current_trace_objects
    assert isinstance(ref, dict), f"Expected dict, got {type(ref)}"
    assert ref.get('type') == 'ref', f"Expected ref, got '{ref.get('type')}'"
    obj_id = ref['id']
    
    # The actual serialized data is in current_trace_objects
    full = tracer.current_trace_objects[obj_id]
    assert full['type'] == 'dict', f"Expected type='dict', got '{full['type']}'"
    
    value = full['value']
    assert value['x'] == 10, f"Expected x=10, got {value.get('x')}"
    assert value['y'] == 20, f"Expected y=20, got {value.get('y')}"
    assert value['z'] == 30, f"Expected z=30, got {value.get('z')}"
    print("✅ defaultdict serialization preserves key/value pairs")


def test_counter_detection():
    """Counter should be detected as 'dict' type."""
    tracer = TraceRunner()
    c = Counter("abcaab")
    
    assert tracer._detect_type(c) == 'dict', f"Expected 'dict', got '{tracer._detect_type(c)}'"
    print("✅ Counter detected as 'dict'")


def test_counter_serialization():
    """Counter("abc") should serialize with correct character counts."""
    tracer = TraceRunner()
    c = Counter("abc")

    ref = tracer._serialize(c)
    assert ref.get('type') == 'ref', f"Expected ref, got '{ref.get('type')}'"
    
    full = tracer.current_trace_objects[ref['id']]
    assert full['type'] == 'dict', f"Expected type='dict', got '{full['type']}'"
    
    value = full['value']
    assert value['a'] == 1, f"Expected a=1, got {value.get('a')}"
    assert value['b'] == 1, f"Expected b=1, got {value.get('b')}"
    assert value['c'] == 1, f"Expected c=1, got {value.get('c')}"
    print("✅ Counter serialization preserves counts")


def test_counter_with_counts():
    """Counter with repeated chars should have correct counts."""
    tracer = TraceRunner()
    c = Counter("aabbc")

    ref = tracer._serialize(c)
    full = tracer.current_trace_objects[ref['id']]
    assert full['type'] == 'dict', f"Expected type='dict', got '{full['type']}'"
    
    value = full['value']
    assert value['a'] == 2, f"Expected a=2, got {value.get('a')}"
    assert value['b'] == 2, f"Expected b=2, got {value.get('b')}"
    assert value['c'] == 1, f"Expected c=1, got {value.get('c')}"
    print("✅ Counter serialization with repeated characters correct")


def test_defaultdict_is_eligible():
    """defaultdict should be eligible for serialization."""
    tracer = TraceRunner()
    dd = defaultdict(list)
    assert tracer.is_eligible(dd) is True, "defaultdict should be eligible"
    print("✅ defaultdict is eligible")


def test_counter_is_eligible():
    """Counter should be eligible for serialization."""
    tracer = TraceRunner()
    c = Counter()
    assert tracer.is_eligible(c) is True, "Counter should be eligible"
    print("✅ Counter is eligible")


def test_object_identity_stable():
    """Same object should get the same ID across multiple serialize calls."""
    tracer = TraceRunner()
    dd = defaultdict(int)
    dd['key'] = 42

    result1 = tracer._serialize(dd)
    # Clear the per-step cache to force re-serialization
    tracer.current_trace_objects = {}
    result2 = tracer._serialize(dd)

    assert result1['id'] == result2['id'], f"IDs differ: {result1['id']} vs {result2['id']}"
    print("✅ Object identity remains stable across calls")


def test_defaultdict_in_trace():
    """Run code with defaultdict and verify it appears in trace data."""
    tracer = TraceRunner()
    code = """
from collections import defaultdict
dd = defaultdict(int)
dd['a'] += 1
dd['b'] += 2
"""
    tracer.run(code)
    
    assert len(tracer.trace_data) > 0, "Trace should have steps"
    
    # Find a step where dd exists in locals
    found_dd = False
    for step in tracer.trace_data:
        for frame in step.get('stack', []):
            if 'dd' in frame.get('locals', {}):
                found_dd = True
                break
        if found_dd:
            break
    
    assert found_dd, "defaultdict 'dd' should appear in trace locals"
    print("✅ defaultdict appears correctly in trace execution")


def test_counter_in_trace():
    """Run code with Counter and verify it appears in trace data."""
    tracer = TraceRunner()
    code = """
from collections import Counter
c = Counter("abc")
most = c.most_common(1)
"""
    tracer.run(code)
    
    assert len(tracer.trace_data) > 0, "Trace should have steps"
    
    found_c = False
    for step in tracer.trace_data:
        for frame in step.get('stack', []):
            if 'c' in frame.get('locals', {}):
                found_c = True
                break
        if found_c:
            break
    
    assert found_c, "Counter 'c' should appear in trace locals"
    print("✅ Counter appears correctly in trace execution")


if __name__ == '__main__':
    tests = [
        test_defaultdict_detection,
        test_defaultdict_serialization,
        test_counter_detection,
        test_counter_serialization,
        test_counter_with_counts,
        test_defaultdict_is_eligible,
        test_counter_is_eligible,
        test_object_identity_stable,
        test_defaultdict_in_trace,
        test_counter_in_trace,
    ]
    
    passed = 0
    failed = 0
    for test in tests:
        try:
            test()
            passed += 1
        except AssertionError as e:
            print(f"❌ {test.__name__}: {e}")
            failed += 1
        except Exception as e:
            print(f"❌ {test.__name__}: {type(e).__name__}: {e}")
            failed += 1
    
    print(f"\n{'='*40}")
    print(f"Results: {passed} passed, {failed} failed, {passed + failed} total")
    if failed == 0:
        print("All tests passed! ✅")
    else:
        print(f"{failed} test(s) FAILED ❌")
        sys.exit(1)
