# Multi-Agent Productivity Assistant

This project is a comprehensive multi-agent productivity assistant built with the Google Agent Development Kit (ADK) on the backend and a premium React frontend. It's designed to help you manage your digital life seamlessly by coordinating specialized AI agents to interact with Google Workspace applications, perform research, and provide an interactive, real-time user experience.

## System Architecture & Features

This project is structured into a powerful backend orchestration layer and a high-fidelity frontend interface.

### 🎨 Frontend Features

Built with React and Vite, the frontend delivers a seamless, high-performance, and visually stunning user experience:

*   **Premium UI/UX:** A high-fidelity, responsive, dark-themed interface with vibrant gradient backgrounds, polished component sizing, and smooth micro-animations.
*   **Real-time SSE Streaming:** Supports Server-Sent Events (SSE) for fluid, real-time message streaming from the backend ADK API server.
*   **Text-to-Speech (TTS) & Bidirectional Voice Chat:** Integrated Web Audio API enables interactive, bidirectional voice communication and Text-to-Speech (TTS) capabilities for a hands-free experience.
*   **Advanced Transparency Insights:** Real-time visualization of the AI model's "thoughts" (reasoning) and tool calls, allowing users to understand exactly how their requests are being handled step-by-step.
*   **Rich Text & Media Support:** Full Markdown rendering for structured text presentation, along with integrated file upload capabilities.
*   **Robust Session Management:** Persistent chat history allowing users to revisit past sessions. Includes chat title persistence, accurate timestamp handling (epoch conversions), and synchronized session deletion reflecting backend state.
*   **Seamless API Proxying:** Optimized network interaction layer using Vite proxy configurations to resolve CORS issues and handle fallback mechanisms gracefully.

### 🧠 Backend Orchestration (Google ADK)

The backend leverages a multi-agent setup, communicating securely through the Model Context Protocol (MCP) to manage tasks efficiently:

*   **Orchestrator Agent:** The primary "brain" of the operation. It interprets complex user requests, breaks them down into actionable sub-tasks, delegates them to specialized agents, resolves scheduling conflicts, and synthesizes the final coherent response.
*   **Workspace Agent:** The execution arm that connects directly to the `workspace-mcp` server. It safely interacts with Google Workspace APIs, handling operations across Google Calendar, Tasks, Gmail, Docs, and Drive.
*   **Search Agent:** A specialized research agent utilizing Google Search to gather up-to-date external context, search for best practices, and feed external information back to the Orchestrator.
*   **Persistent Chat Backend:** Maintains chat state and history through robust backend APIs to support the frontend's session management, ensuring no context is lost across client sessions.
*   **Powered by Gemini:** Uses the intelligent reasoning capabilities of `gemini-2.5-flash` to power all agents, data processing, and decision-making logic.

## Getting Started

### Prerequisites

*   Python 3.11+
*   Node.js and npm (for frontend development)
*   `uv` package installer (`pip install uv`)
*   Google Cloud Project with OAuth 2.0 Credentials (Client ID and Secret)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Set up the Backend virtual environment:**
    ```bash
    uv venv
    source .venv/bin/activate
    ```

3.  **Install Backend dependencies:**
    ```bash
    uv pip install -r requirements.txt
    ```

4.  **Configure your environment:**

    Create a `.env` file in the project root and add your Google OAuth credentials:

    ```bash
    export GOOGLE_OAUTH_CLIENT_ID="YOUR_CLIENT_ID.apps.googleusercontent.com"
    export GOOGLE_OAUTH_CLIENT_SECRET="YOUR_CLIENT_SECRET"
    export OAUTHLIB_INSECURE_TRANSPORT=1
    ```

### Running the Application

1.  **Start the Workspace MCP Server:**

    This server acts as the bridge connecting the AI agents to Google Workspace APIs using the Model Context Protocol.

    ```bash
    # Make sure to source your environment variables first
    source .env

    # Start the server
    uvx workspace-mcp --tools calendar tasks gmail docs drive --transport streamable-http
    ```

2.  **Run the Backend Agent:**

    In a new terminal, run the central orchestration layer.

    ```bash
    # Activate the virtual environment
    source .venv/bin/activate

    # Start the backend API agent
    adk web
    ```

3.  **Run the Frontend Development Server:**

    Navigate to the frontend directory and start the Vite development server.

    ```bash
    cd frontend
    npm install
    npm run dev
    ```
