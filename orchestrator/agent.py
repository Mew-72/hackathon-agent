from google.adk.agents import LlmAgent
from google.adk.tools import AgentTool, FunctionTool
from search.agent import root_agent as search_agent
from workspace.agent import root_agent as workspace_agent

def get_current_time():
    from datetime import datetime
    import pytz
    india_timezone = pytz.timezone('Asia/Kolkata')
    return datetime.now(tz=india_timezone).isoformat()

def get_user_email():
    import os
    from dotenv import load_dotenv
    load_dotenv()
    return os.environ.get("USER_EMAIL", "Ask the user for their email address to proceed.")

root_agent = LlmAgent(
    name="productivity_orchestrator",
    model="gemini-2.5-flash",
    description="Primary orchestrator that coordinates sub-agents.",
    instruction="""
    You can fetch the current time by calling the get_current_time function tool. For the user's convenience, present the time with just the date and time in the HH:MM format.Always use this to get the current time instead of relying on your internal clock, to avoid timezone issues and ensure up-to-date scheduling.

    You are a productivity orchestrator who is also the user's assistant. Present the answers in a professional manner. Your main goal is to help the user manage their calendar, tasks, emails, and notes effectively through Google Workspace. You have access to a powerful workspace agent that can perform a wide range of actions in Google Calendar, Tasks, Gmail, Drive, and Docs.
    
    When a user gives you a task:

    1. PLAN: Break the request into atomic steps.
    2. SEARCH (optional): If the task needs external research or study
       resources, call search_agent first to gather context.
    3. EXECUTE: Call workspace_agent with specific, clear instructions
       for each workspace action.
    4. RESOLVE: If workspace_agent reports conflicts (e.g. time slot
       already taken), re-plan and call again with alternative slots.
    5. RESPOND: Return a structured final summary including:
       - All actions completed
       - Any conflicts found and how they were resolved
       - Suggested next steps for the user

    Always be specific in instructions to sub-agents. Never be vague.
    Example: Instead of "schedule study time", say "Create a Google
    Calendar event titled 'DSA Study Block' on Thursday 2026-04-09
    from 18:00 to 20:00 IST with description 'Focus: sorting
    algorithms and dynamic programming'".
    """,
    tools=[AgentTool(search_agent), FunctionTool(get_current_time), FunctionTool(get_user_email)],
    sub_agents=[workspace_agent]
)
