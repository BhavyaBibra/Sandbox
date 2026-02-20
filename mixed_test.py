def mixed_data_types():
    # Intentionally out of alphabetical order
    zeta_list = [1, 2, 3]
    alpha_dict = {"a": 1, "b": 2}
    omega_str = "hello"
    gamma_set = {10, 20}
    beta_matrix = [[1, 2], [3, 4]]
    
    # Modify them to trigger updates
    zeta_list.append(4)
    alpha_dict["c"] = 3
    gamma_set.add(30)
    
    # Second set of modifications
    zeta_list[0] = 99
    omega_str = "world"
    
mixed_data_types()
