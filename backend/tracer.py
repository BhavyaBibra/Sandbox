import sys
import copy
import traceback
import types
import inspect

class TraceRunner:
    def __init__(self):
        self.trace_data = []
        self.max_steps = 1000
        self.step_count = 0
        self.object_registry = {}  # Map id(obj) -> stable_id string
        self.current_trace_objects = {} # Map stable_id -> serialized_value (per step)

    def get_object_id(self, obj):
        if id(obj) not in self.object_registry:
            type_name = type(obj).__name__
            count = len([k for k in self.object_registry.values() if k.startswith(type_name)]) + 1
            self.object_registry[id(obj)] = f"{type_name}_{count}"
        return self.object_registry[id(obj)]

    def is_eligible(self, obj):
        """Determine if an object should be serialized and sent to the frontend."""
        # Whitelist primitives
        if isinstance(obj, (int, float, bool, str, type(None))):
            return True
            
        # Whitelist built-in containers
        if isinstance(obj, (list, dict, set, tuple)):
            return True

        # Blacklist using inspect module
        if inspect.isfunction(obj) or inspect.ismethod(obj) or inspect.isbuiltin(obj) or \
           inspect.isclass(obj) or inspect.ismodule(obj) or inspect.isroutine(obj) or \
           inspect.iscode(obj) or callable(obj):
            return False

        # Blacklist using string repr checks (catch-all for internal/system objects)
        try:
            r = repr(obj)
            if r.startswith("<function") or r.startswith("<class") or \
               r.startswith("<module") or r.startswith("<built-in"):
                return False
        except Exception:
            return False

        # If it doesn't match blacklists, assume it's a user-defined instance or safe object
        return True

    def _detect_type(self, obj):
        if isinstance(obj, list):
            # Check for 2D Matrix (list of lists with same length)
            if obj and all(isinstance(x, list) and len(x) == len(obj[0]) for x in obj):
                return 'matrix'
            return 'list'
        
        # Check for Linked List Node
        if hasattr(obj, 'val') and hasattr(obj, 'next'):
             return 'linked_list_node'
        
        # Check for Tree Node
        if hasattr(obj, 'val') and (hasattr(obj, 'left') or hasattr(obj, 'right')):
             return 'tree_node'

        if isinstance(obj, dict):
            return 'dict'
        if isinstance(obj, set):
            return 'set'
            
        # Check for user-defined instance (not a class itself, but has __dict__)
        if hasattr(obj, '__dict__') and not inspect.isclass(obj):
            return 'instance'
        
        return 'unknown'

    def _serialize(self, obj, depth=0):
        if depth > 5: return "<max_depth_exceeded>"
        
        if isinstance(obj, (int, float, bool, str, type(None))):
             return obj

        try:
            obj_id = self.get_object_id(obj)
            
            # If already serialized in this step, return reference
            if obj_id in self.current_trace_objects:
                return {"type": "ref", "id": obj_id}

            obj_type = self._detect_type(obj)
            
            serialized_value = None

            if obj_type == 'list' or obj_type == 'matrix':
                 # Serialize content recursively
                 content = [self._serialize(x, depth + 1) for x in obj[:20]] + (["<truncated>"] if len(obj) > 20 else [])
                 serialized_value = {"type": obj_type, "id": obj_id, "value": content}

            elif obj_type == 'dict':
                 content = {str(k): self._serialize(v, depth + 1) for k, v in list(obj.items())[:20]}
                 serialized_value = {"type": "dict", "id": obj_id, "value": content}
            
            elif obj_type == 'set':
                 content = [self._serialize(x, depth + 1) for x in list(obj)[:20]]
                 serialized_value = {"type": "set", "id": obj_id, "value": content}

            elif obj_type == 'linked_list_node':
                 # Serialize Node fields
                 content = {
                     "val": self._serialize(getattr(obj, 'val'), depth + 1),
                     "next": self._serialize(getattr(obj, 'next'), depth + 1)
                 }
                 serialized_value = {"type": "linked_list_node", "id": obj_id, "value": content}
            
            elif obj_type == 'tree_node':
                 content = {
                     "val": self._serialize(getattr(obj, 'val'), depth + 1),
                     "left": self._serialize(getattr(obj, 'left', None), depth + 1),
                     "right": self._serialize(getattr(obj, 'right', None), depth + 1)
                 }
                 serialized_value = {"type": "tree_node", "id": obj_id, "value": content}
                 
            elif obj_type == 'instance':
                 # Serialize user-defined object instance
                 content = {str(k): self._serialize(v, depth + 1) for k, v in vars(obj).items() if not k.startswith('__')}
                 serialized_value = {
                     "type": "instance", 
                     "id": obj_id, 
                     "class_name": type(obj).__name__, 
                     "value": content
                 }
            
            else:
                 return repr(obj) # Fallback for unknown objects

            # Register the object for this step
            self.current_trace_objects[obj_id] = serialized_value
            return {"type": "ref", "id": obj_id}

        except Exception:
            return "<unserializable>"

    def trace(self, frame, event, arg):
        try:
            if self.step_count >= self.max_steps:
                raise RuntimeError("Step limit exceeded")
            
            if event == 'call':
                return self.trace

            if event not in ['line', 'return', 'exception']:
                 return self.trace
            
            if 'tracer.py' in frame.f_code.co_filename: 
                 return self.trace

            self.step_count += 1
            
            # Reset current step objects
            self.current_trace_objects = {}

            # Stack Capture
            stack = []
            current = frame
            while current:
                 fname = current.f_code.co_filename
                 if current.f_code.co_name == 'run' and 'tracer.py' in fname:
                     break
                 
                 stack_frame = {
                     "name": current.f_code.co_name,
                     "line": current.f_lineno,
                     "locals": {k: self._serialize(v) for k, v in current.f_locals.items() if not k.startswith('__') and self.is_eligible(v)}
                 }
                 stack.append(stack_frame)
                 current = current.f_back
            
            trace_item = {
                "line": frame.f_lineno,
                "event": event,
                "func_name": frame.f_code.co_name,
                "stack": stack,
                "objects": self.current_trace_objects.copy() # Snapshot of objects
            }
            
            if event == 'exception':
                exc_type, exc_value, exc_traceback = arg
                
                # Filter out expected or internal Python exceptions that aren't user crashes
                # These are commonly raised and caught internally by Python's own code
                if exc_type in (StopIteration, GeneratorExit, KeyboardInterrupt, SystemExit,
                                AttributeError, TypeError, KeyError, ValueError, NameError):
                    return self.trace
                    
                trace_item["exception"] = f"{exc_type.__name__}: {str(exc_value)}"
                
            self.trace_data.append(trace_item)
            return self.trace
        except Exception as e:
            return self.trace

    def run(self, code):
        self.crashed = False
        self.crash_message = None
        try:
            namespace = {}
            compiled_code = compile(code, "<string>", "exec")
            sys.settrace(self.trace)
            exec(compiled_code, namespace)
        except Exception as e:
            self.crashed = True
            self.crash_message = str(e)
        finally:
            sys.settrace(None)
        
        # If execution succeeded (no uncaught exception), 
        # strip any spurious exception fields from trace steps
        # (these were caught exceptions from internal Python operations)
        if not self.crashed:
            for step in self.trace_data:
                if "exception" in step:
                    del step["exception"]
        
        return self.trace_data
