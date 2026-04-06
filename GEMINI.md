# GEMINI.md — Multi-Agent Productivity Assistant

This project is a **Multi-Agent Productivity Assistant** built for the Gen AI Academy APAC Final Hackathon. It uses the Google Agent Development Kit (ADK) to coordinate specialized agents for research and Google Workspace automation.

## Project Vision
To provide a seamless, AI-driven interface for managing a user's digital life (Calendar, Tasks, Gmail, Docs) by coordinating specialized agents.

## Core Architecture
The project follows the canonical Google ADK structure. Each agent is a self-contained module.

- **Orchestrator Agent (`src/productivity/agents/orchestrator`)**: The primary brain. It plans tasks, delegates to sub-agents, and resolves conflicts.
- **Search Sub-Agent (`src/productivity/agents/search`)**: Gathers external context, study materials, or best practices using Google Search.
- **Workspace Sub-Agent (`src/productivity/agents/workspace`)**: The execution arm. It connects to the `workspace-mcp` server via Streamable HTTP/SSE.

## Tech Stack
- **Language**: Python 3.11+
- **Framework**: Google Agent Development Kit (ADK)
- **Protocol**: Model Context Protocol (MCP)
- **Model**: `gemini-2.5-flash`
- **MCP Server**: `workspace-mcp` (v1.3.0)

## Implementation Mandates
1.  **Docs First**: Always consult `context7` for the latest `google-adk` API surface before implementation.
2.  **ADK Structure**: Every agent must have an `__init__.py` (importing the agent) and an `agent.py` defining `root_agent`.
3.  **Conflict Resolution**: The Orchestrator must handle calendar conflicts by re-planning or suggesting alternatives.
4.  **Validation**: Every workspace action must be confirmed with resource IDs or status updates.
5.  **Standards**: Use ISO 8601 for datetimes and `Asia/Kolkata` (IST) as the default timezone.

## Canonical Project Structure
```text
/
├── src/
│   └── productivity/
│       └── agents/
│           ├── orchestrator/
│           │   ├── __init__.py
│           │   └── agent.py (LlmAgent + sub_agents)
│           ├── search/
│           │   ├── __init__.py
│           │   └── agent.py (LlmAgent + google_search)
│           └── workspace/
│               ├── __init__.py
│               └── agent.py (LlmAgent + MCPToolset)
├── GEMINI.md
└── .env (Credentials)
```

## Running the Workspace MCP Server
```bash
export GOOGLE_OAUTH_CLIENT_ID="..."
export GOOGLE_OAUTH_CLIENT_SECRET="..."
uvx workspace-mcp --tools calendar tasks gmail docs drive --transport streamable-http
```
