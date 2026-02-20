def test_dict_set():
    my_dict = {"apple": 1, "banana": 2}
    my_set = {10, 20, 30}
    
    # Modify dict
    my_dict["cherry"] = 3
    my_dict["apple"] = 5
    
    # Modify set
    my_set.add(40)
    my_set.remove(20)

test_dict_set()
