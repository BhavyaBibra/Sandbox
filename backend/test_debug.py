import inspect

class Node:
    def __init__(self, val):
        self.val = val

n = Node(1)
print(f"type: {type(n)}")
print(f"isinstance int/float/str: {isinstance(n, (int, float, bool, str, type(None)))}")
print(f"isinstance list/dict: {isinstance(n, (list, dict, set, tuple))}")
print(f"isfunction: {inspect.isfunction(n)}")
print(f"ismethod: {inspect.ismethod(n)}")
print(f"isbuiltin: {inspect.isbuiltin(n)}")
print(f"isclass: {inspect.isclass(n)}")
print(f"ismodule: {inspect.ismodule(n)}")
print(f"isroutine: {inspect.isroutine(n)}")
print(f"iscode: {inspect.iscode(n)}")
print(f"callable: {callable(n)}")
print(f"repr: {repr(n)}")
