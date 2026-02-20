from backend.tracer import TraceRunner

def test_object_registry():
    runner = TraceRunner()
    code = """
x = [1, 2, 3]
y = [x, x] # Matrix / Nested List
z = {'a': 1}
    """
    trace = runner.run(code)
    
    last_step = trace[-1]
    objects = last_step['objects']
    locals_data = last_step['stack'][-1]['locals']
    
    print("Objects Registry:", objects.keys())
    print("Locals:", locals_data)

    # Verify x is a reference
    assert locals_data['x']['type'] == 'ref'
    x_id = locals_data['x']['id']
    assert x_id in objects
    assert objects[x_id]['type'] == 'list'
    assert objects[x_id]['value'] == [1, 2, 3]

    # Verify y is a matrix (list of lists)
    assert locals_data['y']['type'] == 'ref'
    y_id = locals_data['y']['id']
    assert objects[y_id]['type'] == 'matrix'
    
    print("Verification Passed!")

if __name__ == "__main__":
    try:
        test_object_registry()
    except AssertionError as e:
        print(f"Verification Failed: {e}")
        exit(1)
    except Exception as e:
        print(f"Error: {e}")
        exit(1)
