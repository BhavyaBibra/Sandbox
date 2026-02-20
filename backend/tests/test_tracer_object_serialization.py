from trace import Trace
from tracer import TraceRunner

def test_tracer_object_serialization():
    code = """
class Node:
    def __init__(self, val):
        self.val = val

def main():
    n = Node(1)
    pass

main()
"""
    runner = TraceRunner()
    trace_data = runner.run(code)

    # Find the snapshot where 'main' is executing and all variables are assigned
    main_snapshots = [t for t in trace_data if t['func_name'] == 'main' and t['event'] == 'line']
    final_main_snapshot = main_snapshots[-1]

    # The active frame should be the first one in the stack
    active_frame = final_main_snapshot['stack'][0]
    locals_dict = active_frame['locals']

    assert 'n' in locals_dict, "'n' should be in locals"
    n_val = locals_dict['n']
    
    # It must be a reference, NOT a string like "<Node object at ...>"
    assert isinstance(n_val, dict), "Serialized instance should be a dictionary reference"
    assert n_val.get("type") == "ref", "Instance should be serialized as a reference"
    
    obj_id = n_val.get("id")
    assert obj_id is not None
    
    # Check the objects registry for the actual instance data
    objects_registry = final_main_snapshot['objects']
    assert obj_id in objects_registry, "Object reference must exist in objects registry"
    
    registered_obj = objects_registry[obj_id]
    assert registered_obj["type"] == "instance", "Object should be registered as 'instance'"
    assert registered_obj["class_name"] == "Node", "Class name should be 'Node'"
    assert registered_obj["value"]["val"] == 1, "Instance dictionary should contain val=1"

    # Also verify it handles nested refs (Node -> Node)
    code2 = """
class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

def main():
    a = Node(1)
    b = Node(2)
    a.next = b
    pass

main()
"""
    runner2 = TraceRunner()
    trace_data2 = runner2.run(code2)
    final_main_snapshot2 = [t for t in trace_data2 if t['func_name'] == 'main' and t['event'] == 'line'][-1]
    
    locals_dict2 = final_main_snapshot2['stack'][0]['locals']
    objects_registry2 = final_main_snapshot2['objects']
    
    a_ref = locals_dict2['a']
    b_ref = locals_dict2['b']
    
    assert a_ref["type"] == "ref" and b_ref["type"] == "ref"
    
    a_obj = objects_registry2[a_ref["id"]]
    assert a_obj["type"] == "linked_list_node" # Because it has 'val' and 'next', it's correctly detected as a linked_list_node!
    
    # And check that a.next is a reference to b
    assert a_obj["value"]["next"]["type"] == "ref"
    assert a_obj["value"]["next"]["id"] == b_ref["id"]
    
    print("All object serialization tests passed!")

if __name__ == "__main__":
    test_tracer_object_serialization()
