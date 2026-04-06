import os
from google.adk.agents import Agent
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StreamableHTTPConnectionParams

mcp_server_url = os.environ.get("WORKSPACE_MCP_URL", "http://localhost:8000/mcp")

mcp_toolset = MCPToolset(
    connection_params=StreamableHTTPConnectionParams(
        url=mcp_server_url,
    )
)

root_agent = Agent(
    name="workspace_agent",
    model="gemini-2.5-flash",
    description="""
    Executes actions in Google Workspace. Use this agent to:
    - CREATE calendar events with specific times, titles, descriptions
    - LIST calendar events to check schedule and free/busy slots
    - CREATE tasks in Google Tasks with due dates, notes, priorities
    - LIST / UPDATE / DELETE tasks
    - SEND or DRAFT emails via Gmail
    - CREATE Google Docs notes or summaries
    - READ Drive files for context
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
    - Use ISO 8601 for all datetimes (e.g. 2026-04-09T18:00:00+05:30)
    - Default timezone: Asia/Kolkata (IST, UTC+5:30)
    """
)
