import requests
import json

code = """
def test():
    my_dict = {"apple": 1}
    my_set = {10}
test()
"""

res = requests.post("http://localhost:8000/run", json={"code": code})
print(json.dumps(res.json(), indent=2))
