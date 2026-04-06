# Multi-Agent Productivity Assistant

This project is a multi-agent productivity assistant built with the Google Agent Development Kit (ADK). It's designed to help you manage your digital life by coordinating specialized AI agents to interact with Google Workspace applications.

## About the Project

This assistant uses a multi-agent architecture:

*   **Orchestrator Agent**: The "brain" that understands your requests, creates plans, and delegates tasks.
*   **Search Agent**: Performs research using Google Search to gather information.
*   **Workspace Agent**: Connects to your Google Calendar, Tasks, Gmail, and Docs to execute tasks.

## Getting Started

### Prerequisites

*   Python 3.11+
*   `uv` package installer (`pip install uv`)
*   Google Cloud Project with OAuth 2.0 Credentials (Client ID and Secret)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Set up a virtual environment:**
    ```bash
    uv venv
    source .venv/bin/activate
    ```

3.  **Install dependencies:**
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

### Running the Assistant

1.  **Start the Workspace MCP Server:**

    This server connects the agent to Google's APIs.

    ```bash
    # Make sure to source your environment variables first
    source .env

    # Start the server
    uvx workspace-mcp --tools calendar tasks gmail docs drive --transport streamable-http
    ```

2.  **Run the main agent:**

    In a new terminal, run the main application.

    ```bash
    # Activate the virtual environment
    source .venv/bin/activate

    # Start the agent
    adk web
    ```
