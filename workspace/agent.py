import os

from google.adk.agents import Agent
from google.adk.tools.mcp_tool.mcp_session_manager import (
    StdioConnectionParams,
    StreamableHTTPConnectionParams,
)
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset
from mcp import StdioServerParameters

mcp_server_url = os.environ.get("WORKSPACE_MCP_URL", "http://localhost:8000/mcp")

# mcp_toolset = MCPToolset(
#     connection_params=StreamableHTTPConnectionParams(
#         url=mcp_server_url,
#     )
# )

mcp_toolset = MCPToolset(
    connection_params=StdioConnectionParams(
        server_params=StdioServerParameters(
            # command="uvx",
            # command=".venv\\Scripts\\workspace-mcp.exe", # for windows 
            command="workspace-mcp", # for linux
            args=[
                # "workspace-mcp",
                "--tool-tier", "complete",
                # "--tools", "gmail drive calendar tasks",
                "--transport", "stdio",
                "--single-user"
            ],
            env={**os.environ}
        )
    )
)


root_agent = Agent(
    name="workspace_agent",
    model="gemini-2.5-flash",
    description="""
    Executes actions in Google Workspace. Use this agent to:
    - completely control the user's google workspace, you can independently work on the workspace when a user provides an intruction or task.
    Always returns confirmation of every action taken with IDs and links.
    """,
    tools=[mcp_toolset],
    instruction="""
    You are a Google Workspace executor. Rules:
    - Before creating a calendar event, ALWAYS call get_events first
      to check for conflicts in that time window
    - When creating tasks, always set due_date if mentioned
    - Confirm every action by returning the created resource ID
    - If an action fails, explain why and suggest an alternative
    - Never return vague instructions to the orchestrator. Be specific and clear.
    - Never return any form of IDunless explicitly asked for, instead provide concise summaries of those messages or events or tasks etc which these IDs refer to.
    - If you are given a task that is unrelated to your work, then transfer to the orchestrator parent agent to let it decide what's to be done.    
    - Use ISO 8601 for all datetimes (e.g. 2026-04-09T18:00:00+05:30)
    - Default timezone: Asia/Kolkata (IST, UTC+5:30)
    """
)
