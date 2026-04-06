from google.adk.agents import LlmAgent
from google.adk.tools import AgentTool
from search.agent import root_agent as search_agent
from workspace.agent import root_agent as workspace_agent

root_agent = LlmAgent(
    name="productivity_orchestrator",
    model="gemini-2.5-flash",
    description="Primary orchestrator that coordinates sub-agents.",
    instruction="""
    You are a productivity orchestrator. When a user gives you a task:

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
    tools=[AgentTool(search_agent)],
    sub_agents=[workspace_agent]
)
