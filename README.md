# Sandbox

**Sandbox** is an interactive, browser-based tool for visualizing Data Structures and Algorithms (DSA) execution in Python. It allows users to write code, execute it, and step through the logic line-by-line with real-time visualizations of variables, arrays, and object references.

![Sandbox Demo](demo_placeholder.gif)

## Features

- **Interactive Code Editor**: Write and edit Python code with syntax highlighting (Monaco Editor).
- **Execution Tracing**: Step-by-step execution control (Run, Step, Reset).
- **Visual Debugging**:
    - **Variables**: See current values of integers, strings, and booleans.
    - **Arrays**: Visualized as interactive, animated blocks.
    - **Pointers**: Watch indices `i`, `j`, `left`, `right` move in real-time.
- **Security**: Sandboxed execution environment blocking dangerous operations.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend**: Python, FastAPI
- **Communication**: JSON-based execution trace protocol

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.10+)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/sandbox.git
    cd sandbox
    ```

2.  **Backend Setup**:
    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    ```

3.  **Frontend Setup**:
    ```bash
    cd ../frontend
    npm install
    ```

### Running the Application

1.  **Start the Backend**:
    ```bash
    # From the sandbox/ root directory
    source backend/venv/bin/activate
    uvicorn backend.main:app --reload --port 8000
    ```

2.  **Start the Frontend**:
    ```bash
    # From the sandbox/frontend directory
    npm run dev
    ```

3.  **Access the App**:
    Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

1.  **Write Code**: Enter your Python algorithm in the left panel.
2.  **Run**: Click the "Run" button to execute and generate a trace.
3.  **Step**: Use the "Step Forward" button to watch the execution unfold.
4.  **Visualize**: Observe how arrays and variables change with each step.

## Security Note

This application executes arbitrary Python code on the backend. While `restricted execution` patterns are implemented to block common dangerous modules (`os`, `sys`, `subprocess`), it is **not** a fully isolated container. Do not expose this application to the public internet without additional security layers (e.g., Docker, gVisor).

## License

MIT

## Known Limitations (Phase 1)
- **Security**: Basic sandbox (blocked imports). Not suitable for public internet hosting without Docker.
- **Python Support**: Supports standard library primitives. Complex objects might not visualize perfectly.
- **Performance**: Large traces are sent in one go. Long loops might be slow.
- **UI**: Basic styling. Non-responsive on very small screens.

## Next Steps (Phase 2)
- Enhanced Security (Docker/gVisor).
- Richer Visualizations (Graphs, Trees, Linked Lists).
- Breakpoints and "Run to Cursor".
- Step Back / Reverse Debugging.
