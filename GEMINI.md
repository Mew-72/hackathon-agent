# GEMINI.md — Multi-Agent Productivity Assistant

This document serves as the central guide for the **Multi-Agent Productivity Assistant**, a project developed for the Gen AI Academy APAC Final Hackathon. It outlines the project's vision, architecture, and setup instructions.

## 1. Project Vision

To create a seamless, AI-driven assistant that helps users manage their digital life across Google Workspace (Calendar, Tasks, Gmail, Docs) by intelligently coordinating specialized agents.

## 2. Core Architecture

The project is built on the Google Agent Development Kit (ADK) and orchestrates a team of specialized agents to handle different aspects of a user's request.

### Agent Roles

*   **Orchestrator Agent (`orchestrator/`)**: The primary brain of the operation. It receives user requests, breaks them down into smaller tasks, and delegates them to the appropriate sub-agents. It is responsible for planning, conflict resolution (e.g., calendar scheduling), and synthesizing the final response.

*   **Search Sub-Agent (`search/`)**: The research specialist. This agent uses Google Search to gather external context, find best practices, or look up any information needed to fulfill a user's request.

*   **Workspace Sub-Agent (`workspace/`)**: The execution arm for all Google Workspace actions. This agent connects to the `workspace-mcp` server to interact with Google APIs for Calendar, Tasks, Gmail, Docs, and Drive.

### Tech Stack

*   **Language**: Python 3.11+
*   **Framework**: Google Agent Development Kit (ADK)
*   **Protocol**: Model Context Protocol (MCP) for agent-to-tool communication.
*   **Model**: `gemini-2.5-flash`
*   **MCP Server**: `workspace-mcp` (v1.3.0)

## 3. Getting Started

Follow these steps to set up and run the project.

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd <repository-name>
```

### Step 2: Set Up the Python Environment

It is recommended to use a virtual environment.

```bash
# Install uv (if you don't have it)
pip install uv

# Create a virtual environment
uv venv

# Activate the virtual environment
source .venv/bin/activate
```

### Step 3: Install Dependencies

```bash
uv pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

The `workspace-mcp` server requires Google OAuth credentials.

1.  **Create a `.env` file** in the root of the project.
2.  **Add your credentials** to the `.env` file. You can get these from the Google Cloud Console.
3.  **Make sure to export the variables.**

    ```bash
    # .env
    export GOOGLE_OAUTH_CLIENT_ID="YOUR_CLIENT_ID.apps.googleusercontent.com"
    export GOOGLE_OAUTH_CLIENT_SECRET="YOUR_CLIENT_SECRET"
    export OAUTHLIB_INSECURE_TRANSPORT=1
    ```

### Step 5: Run the Workspace MCP Server

The MCP server acts as a bridge between the Workspace agent and the Google APIs.

```bash
# Source the environment variables
source .env

# Run the MCP server
uvx workspace-mcp --tools calendar tasks gmail docs drive --transport streamable-http
```

### Step 6: Run the Agent

In a separate terminal, run the main application:

```bash
# Make sure your virtual environment is activated
source .venv/bin/activate

# Run the main agent
python main.py
```

## 4. Project Structure

The project follows a modular structure, with each agent in its own directory.

```text
/
├── orchestrator/      # Orchestrator Agent
│   ├── __init__.py
│   └── agent.py
├── search/            # Search Sub-Agent
│   ├── __init__.py
│   └── agent.py
├── workspace/         # Workspace Sub-Agent
│   ├── __init__.py
│   └── agent.py
├── .env               # Credentials (not committed)
├── .gitignore         # Git ignore file
├── GEMINI.md          # This file
├── main.py            # Main application entry point
├── pyproject.toml     # Project metadata and dependencies
└── requirements.txt   # Project dependencies
```

## 5. Development Guidelines

*   **Docs First**: Always consult `context7` for the latest `google-adk` API surface before implementation.
*   **ADK Structure**: Every agent must have an `__init__.py` (importing the agent) and an `agent.py` defining the `root_agent`.
*   **Conflict Resolution**: The Orchestrator must handle calendar conflicts by re-planning or suggesting alternatives.
*   **Validation**: Every workspace action must be confirmed with resource IDs or status updates.
*   **Standards**: Use ISO 8601 for datetimes and `Asia/Kolkata` (IST) as the default timezone.
