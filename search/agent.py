from google.adk.agents import LlmAgent
from google.adk.tools import google_search

root_agent = LlmAgent(
    name="search_agent",
    model="gemini-2.5-flash",
    description="""
    Searches the web for relevant information. Use this agent when you need:
    - Study resources for a topic
    - Best practices for a workflow
    - How-to guides and documentation links
    Returns a concise summary of findings with source URLs.
    """,
    tools=[google_search],
    instruction="""
    You are a research assistant. Use Google Search to find accurate info.
    Always:
    - Run 2-3 targeted search queries per request
    - Summarize findings concisely (max 200 words)
    - Include the top 3 source URLs
    - Prefer official docs and reputable sources
    """
)
