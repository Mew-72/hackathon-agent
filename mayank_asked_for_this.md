# Understanding the MCP Connection Issue

Hi Mayank! It's completely normal to find these things confusing when you're learning. Let's break down exactly what went wrong and how we figured it out together.

## The Problem in Simple Terms
Imagine you're trying to call a friend on a regular phone line, but they are expecting a walkie-talkie signal. Even though you are both trying to communicate, the way you are sending messages (the protocol) doesn't match, so the call fails.

In our code:
- Your `workspace-mcp` server (the friend) was started with instructions to expect **Streamable HTTP** (the walkie-talkie).
- But your Python code in `workspace/agent.py` (you calling) was trying to connect using **Server-Sent Events or SSE** (the regular phone line).

Because the agent was sending an SSE-style request, the server didn't understand it properly and rejected the connection, giving the error `"Bad Request: Missing session ID"`.

## Step-by-Step Breakdown: How We Fixed It

Here is the exact thought process and the steps I took to diagnose and solve the issue:

### Step 1: Read the Existing Code
First, I looked at the code in `workspace/agent.py` to see how it was trying to connect. 
- I saw it was using `SseConnectionParams(url="http://localhost:8000/mcp")`.
- "SSE" stands for Server-Sent Events, which is one specific way to keep an ongoing connection open between a client and a server.

### Step 2: Consult the Documentation
Next, I needed to check the official documentation for both the `workspace-mcp` server and the `google-adk` (the tool we use to build the agent) to see if this was correct.
- I queried the `context7` server (our documentation tool) about `workspace-mcp`.
- The docs revealed that the server can be started with different "transports" (ways of communicating). The instructions in your `GEMINI.md` specifically said to run the server with `--transport streamable-http`.
- The docs also showed that `streamablehttp` is a distinct connection type, separate from standard SSE or Stdio.

### Step 3: Test the Server (Trial and Error)
To confirm my suspicion, I manually sent test requests to the server (running on port 8000) using a command-line tool called `curl`.
- I tried sending standard SSE requests to `/mcp` and `/sse`. 
- The server kept responding with `"Bad Request: Missing session ID"` or `"Not Found"`, proving that it wasn't expecting a standard SSE connection on that URL.

### Step 4: Find the Correct Connection Method in ADK
Since we knew the server wanted `streamable-http` and not `sse`, I needed to find out how to tell our Python agent to use `streamable-http`.
- I checked what connection parameters were available inside the Google ADK library (`google.adk.tools.mcp_tool.mcp_session_manager`).
- I found a class named `StreamableHTTPConnectionParams`. This was the exact missing piece! It's specifically designed to talk to servers using the Streamable HTTP transport.

### Step 5: Apply the Fix
Finally, I updated `workspace/agent.py`:
- I removed the import for `SseConnectionParams`.
- I imported `StreamableHTTPConnectionParams` instead.
- I changed the connection setup to use `StreamableHTTPConnectionParams(url=mcp_server_url)`.

By making this small change, the agent and the server are now using the exact same "language" to communicate, and the error is resolved!

---

# Understanding the Environment Variables Issue

Later, you encountered another error: `"OAuth client credentials not found"`. 
You tried to fix it by running `source .env`, but it still didn't work. Here's why that happened.

## The Problem in Simple Terms
Imagine you wrote a secret passcode on a sticky note and stuck it to your own computer monitor. Then, you expected your coworker (who is sitting at a different desk) to use that passcode. They can't see your sticky note! 

In our computer environment:
- **Your terminal** (the one where you ran `source .env`) was your desk.
- **The `workspace-mcp` server process** was your coworker at a different desk. 
- **The variables** in your `.env` file didn't have the `export` keyword, so they were treated like personal sticky notes (local shell variables) rather than company-wide memos (environment variables) that any child process could see.

## Step-by-Step Breakdown: How We Fixed It

### Step 1: Read the Error Message
The error explicitly said: `OAuth client secrets file not found ... and no environment variables set. Please either: 1. Set environment variables: GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET`. 

### Step 2: Check the Running Server's Environment
I needed to see if the server process actually had access to those variables. I ran a command (`ps aux`) to find the server process ID, and then tried to peek at its internal environment. It came up empty for `GOOGLE_OAUTH`. This proved the server was entirely unaware of your credentials.

### Step 3: Inspect the `.env` File
I looked at your `.env` file to see how the variables were defined. I saw this:
```bash
GOOGLE_OAUTH_CLIENT_ID="..."
GOOGLE_OAUTH_CLIENT_SECRET="..."
```
In Bash, running `source .env` with these lines simply creates *shell variables*. Shell variables are temporary and are not passed down to new programs (like `uvx workspace-mcp`). 

### Step 4: Fix the `.env` File
To make these variables "public" to any program launched from that terminal, they need to be exported. I updated your `.env` file to add `export` to the beginning of every line:
```bash
export GOOGLE_OAUTH_CLIENT_ID="..."
export GOOGLE_OAUTH_CLIENT_SECRET="..."
```

### Step 5: Instruct You on the Restart Process
Even with the `.env` file fixed, the server wouldn't magically pick them up because it was already running in the background (at its own desk). 

To fix it completely, you needed to:
1. Go to the exact terminal where the server was running.
2. Stop the server (`Ctrl+C`).
3. Run `source .env` again (now that the `export` keywords are there, they become true environment variables).
4. Start the server again. 

When the server started this time, it inherited the environment variables from the terminal and was able to successfully authenticate!