from backend.tracer import TraceRunner
import json

def generate_matrix_test():
    runner = TraceRunner()
    code = """
def process_matrix():
    matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ]
    
    for row in range(3):
        for col in range(3):
            # Multiply element by 2
            matrix[row][col] *= 2
            
process_matrix()
    """
    trace = runner.run(code)
    
    print(f"Generated {len(trace)} trace steps.")
    print("Test ready to be visualized in the frontend.")

if __name__ == "__main__":
    generate_matrix_test()
