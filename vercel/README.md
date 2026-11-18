# Starter Agent for Slack (Bolt for JavaScript and Vercel AI SDK)

A minimal starter template for building AI-powered Slack agents with [Bolt for JavaScript](https://docs.slack.dev/tools/bolt-js/) and [Vercel AI SDK](https://ai-sdk.dev/) using models from [Vercel AI Gateway](https://vercel.com/docs/ai-gateway). Works with the [Slack MCP Server](https://github.com/slackapi/slack-mcp-server) to search messages, read channels, send messages, and manage canvases — all from within your agent.

## App Overview

The starter agent interacts with users through four entry points:

- **App Home** — Displays a welcome message with instructions on how to interact.
- **Direct Messages** — Users message the agent directly. It responds in-thread, maintaining context across follow-ups.
- **Channel @mentions** — Mention the agent in any channel to get a response without leaving the conversation.
- **Assistant Panel** — Users click _Add Agent_ in Slack, select the agent, and pick from suggested prompts or type a message.

The template also includes one example tool (emoji reactions). Add your own tools to customize it for your use case.

### Slack MCP Server

When connected to the [Slack MCP Server](https://github.com/slackapi/slack-mcp-server), the agent can search messages and files, read channel history and threads, send and schedule messages, and create and update canvases. When deployed to Vercel with OAuth (HTTP mode), the agent automatically connects to the Slack MCP Server using the user's token.

## Setup

Before getting started, make sure you have a development workspace where you have permissions to install apps.

### Developer Program

Join the [Slack Developer Program](https://api.slack.com/developer-program) for exclusive access to sandbox environments for building and testing your apps, tooling, and resources created to help you build and grow.

### Claude Code, Codex, Cursor, and Other Coding Agents

Install the [Slack MCP and Skills Plugin](https://docs.slack.dev/ai/slack-skills-plugin/) so your coding agent can create, run, and deploy Slack apps, look up Web API methods and scopes, and build Block Kit without guessing.

#### Claude Code

Run this in a Claude Code session:

```
/plugin marketplace add slackapi/slack-skills-plugin
/plugin install slack@slack
```

**Enable auto-updates**: `/plugin` > Marketplaces > `slack` > Enable auto-update.

#### Codex

Run this in your terminal:

```sh
codex plugin marketplace add slackapi/slack-skills-plugin
codex plugin add slack@slack
```

#### Cursor

Run this in a Cursor Agent chat:

```
/add-plugin slack
```

#### Other agents

Install the skills with `npx skills`, using your [agent's identifier](https://github.com/vercel-labs/skills#supported-agents):

```sh
npx skills add slackapi/slack-skills-plugin -y -a <agent>

# For example, OpenCode
npx skills add slackapi/slack-skills-plugin -y -a opencode
```

### Create the Slack app

<details><summary><strong>Using Slack CLI</strong></summary>

Install the latest version of the Slack CLI for your operating system:

- [Slack CLI for macOS & Linux](https://docs.slack.dev/tools/slack-cli/guides/installing-the-slack-cli-for-mac-and-linux/)
- [Slack CLI for Windows](https://docs.slack.dev/tools/slack-cli/guides/installing-the-slack-cli-for-windows/)

You'll also need to log in if this is your first time using the Slack CLI.

```sh
slack login
```

#### Initializing the project

```sh
slack create my-starter-agent --template slack-samples/bolt-js-starter-agent --subdir vercel
cd my-starter-agent
```

</details>

<details><summary><strong>Using App Settings</strong></summary>

#### Create Your Slack App

1. Open [https://api.slack.com/apps/new](https://api.slack.com/apps/new) and choose "From an app manifest"
2. Choose the workspace you want to install the application to
3. Copy the contents of [manifest.json](./manifest.json) into the text box that says `*Paste your manifest code here*` (within the JSON tab) and click _Next_
4. Review the configuration and click _Create_
5. Click _Install to Workspace_ and _Allow_ on the screen that follows. You'll then be redirected to the App Configuration dashboard.

#### Environment Variables

Before you can run the app, you'll need to store some environment variables.

1. Rename `.env.sample` to `.env`.
2. Open your apps setting page from [this list](https://api.slack.com/apps), click _OAuth & Permissions_ in the left hand menu, then copy the _Bot User OAuth Token_ into your `.env` file under `SLACK_BOT_TOKEN`.

```sh
SLACK_BOT_TOKEN=YOUR_SLACK_BOT_TOKEN
```

3. Click _Basic Information_ from the left hand menu and follow the steps in the _App-Level Tokens_ section to create an app-level token with the `connections:write` scope. Copy that token into your `.env` as `SLACK_APP_TOKEN`.

```sh
SLACK_APP_TOKEN=YOUR_SLACK_APP_TOKEN
```

#### Initializing the project

```sh
git clone https://github.com/slack-samples/bolt-js-starter-agent.git my-starter-agent
cd my-starter-agent/vercel
```

</details>

#### Install dependencies

```sh
npm install
```

## AI Gateway Setup

This app uses Anthropic's `claude-sonnet-5.5` model through Vercel AI Gateway and the AI SDK.

1. Create an API key from the [AI Gateway API Keys page](https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai-gateway%2Fapi-keys&title=AI+Gateway+API+Keys) of your Vercel dashboard.
2. Rename `.env.sample` to `.env`.
3. Save the AI Gateway API key to `.env`:

```sh
AI_GATEWAY_API_KEY=YOUR_AI_GATEWAY_API_KEY
```

## Development

### Starting the app

<details><summary><strong>Using the Slack CLI</strong></summary>

#### Slack CLI

```sh
slack run
```

</details>

<details><summary><strong>Using the Terminal</strong></summary>

#### Terminal

```sh
npm start
```

</details>

<details><summary><strong>Deploy to Vercel</strong></summary>

#### Deploy to Vercel

This mode serves the app from [Vercel Functions](https://vercel.com/docs/functions) over HTTP instead of Socket Mode, with OAuth so the agent can connect to the Slack MCP Server with each user's token. AI Gateway authenticates with the deployment's [OIDC token](https://vercel.com/docs/ai-gateway/authentication-and-byok/oidc), so no API key is needed on Vercel.

1. Link this directory to a Vercel project:

```sh
npx vercel link
```

2. Create a private [Vercel Blob](https://vercel.com/docs/vercel-blob) store for OAuth installations, and connect it to the project when prompted:

```sh
npx vercel blob create-store my-starter-agent --access private
```

3. Create the deployed Slack app:
   - Set `socket_mode_enabled` to `false` in `manifest.json`
   - Replace `your-project.vercel.app` with your project's production domain (e.g. `my-starter-agent.vercel.app`)
   - Create the app with `slack install -E deployed`, or paste `manifest.json` at [api.slack.com/apps/new](https://api.slack.com/apps/new)

4. Add the app's values to the project's environment. Run `slack app settings` to open App Settings, then copy the **Signing Secret**, **Client ID**, and **Client Secret** from _Basic Information_. `SLACK_BOT_TOKEN` is optional, from _OAuth & Permissions_, and lets App Home and replies work before anyone completes OAuth.

```sh
npx vercel env add SLACK_SIGNING_SECRET --environment production
npx vercel env add SLACK_CLIENT_ID --environment production
npx vercel env add SLACK_CLIENT_SECRET --environment production
npx vercel env add SLACK_REDIRECT_URI --environment production
npx vercel env add SLACK_BOT_TOKEN --environment production
```

Set `SLACK_REDIRECT_URI` to `https://YOUR_PRODUCTION_DOMAIN/slack/oauth_redirect`.

5. Deploy to production:

```sh
npx vercel deploy --prod
```

6. Open `https://YOUR_PRODUCTION_DOMAIN/slack/install` to install the app to your workspace with OAuth and connect the Slack MCP Server.

</details>

### Using the App

Once the agent is running, there are several ways to interact:

**App Home** — Open the agent in Slack and click the _Home_ tab. You'll see a welcome message with instructions on how to interact.

**Direct Messages** — Open a DM with the agent. You'll see suggested prompts like _Write a Message_, _Summarize_, and _Brainstorm_ — pick one or type your own message. The agent replies in a thread. Send follow-up messages in the same thread and the agent will maintain the full conversation context.

**Channel @mentions** — Invite the agent to a channel by typing `/invite @agent-name` in the message box, then @mention it followed by your message. The agent responds in a thread so the channel stays clean. In that thread, the agent replies to follow-up messages from the person who mentioned it. Anyone else in the thread can @mention the agent to start their own conversation and the agent keeps each person's conversation separate.

**Assistant Panel** — Click _Add Agent_ in the top-right corner of Slack, select the agent from the list, then pick a suggested prompt or type a message.

### Linting

```sh
# Run Biome for linting and formatting
npm run lint

# Auto-fix lint and format issues
npm run lint:fix
```

### Testing

```sh
# Run unit tests
npm test
```

## Project Structure

### `manifest.json`

`manifest.json` is a configuration for Slack apps. With a manifest, you can create an app with a pre-defined configuration, or adjust the configuration of an existing app.

### `app.js`

`app.js` is the entry point for the application and is the file you'll run to start the server. This project aims to keep this file as thin as possible, primarily using it as a way to route inbound requests.

### `app-vercel.js`

`app-vercel.js` is an alternative entry point that runs the app over HTTP on Vercel instead of Socket Mode. This is intended for deployments that use OAuth for app distribution. See the Deploy to Vercel section under Development for setup instructions.

### `api/slack/`

The functions in `api/slack/` serve `app-vercel.js` on Vercel: `events.js` receives events and interactions, `install.js` starts the OAuth install, and `oauth_redirect.js` completes it.

### `vercel.json`

`vercel.json` rewrites `/slack/*` requests to the functions in `api/slack/`, so the request URLs in `manifest.json` stay `/slack/events`, `/slack/install`, and `/slack/oauth_redirect`.

### `/listeners`

Every incoming request is routed to a "listener". This directory groups each listener based on the Slack Platform feature used.

**`/listeners/events`** — Handles incoming events:

- `app-home-opened.js` — Publishes the App Home view, or pins suggested prompts to the agent DM Messages tab (branches on `event.tab`).
- `app-mentioned.js` — Responds to @mentions in channels.
- `message.js` — Responds to direct messages from users.

**`/listeners/actions`** — Handles interactive components:

- `feedback-buttons.js` — Handles thumbs up/down feedback on agent responses.

**`/listeners/views`** — Builds Block Kit views:

- `app-home-builder.js` — Constructs the App Home Block Kit view.
- `feedback-builder.js` — Creates the feedback button block attached to responses.

### `/agent`

The `agent.js` file defines the AI SDK `ToolLoopAgent` with a system prompt, personality, and tool configuration. Its model, `anthropic/claude-sonnet-5.5`, is called through AI Gateway.

The `deps.js` file defines the `AgentDeps` class passed to the agent at runtime, providing access to the Slack client and conversation context.

The `tools` directory contains one example tool (emoji reaction) defined using `tool()` from `ai`. Add your own tools to customize the agent for your use case.

### `/thread-context`

The `store.js` file keeps conversation history in [Vercel Runtime Cache](https://vercel.com/docs/runtime-cache), keyed by channel, thread, and user, so each person in a thread has their own conversation. This enables multi-turn conversations where the agent remembers previous context within a thread. Entries expire after 24 hours. Outside Vercel, such as with `slack run`, the store falls back to an in-memory cache.

### `/oauth`

The `installation-store.js` file keeps OAuth installations in a private Vercel Blob store. Before anyone completes OAuth, it falls back to `SLACK_BOT_TOKEN` so App Home and basic replies still work.

## Troubleshooting

### MCP Server connection error: `App is not enabled for Slack MCP server access`

If you see an error like:

```
Error: Streamable HTTP error: Error POSTing to endpoint: {"jsonrpc":"2.0","id":null,"error":{"code":-32600,"message":"App is not enabled for Slack MCP server access. Please enable it here: https://api.slack.com/apps/YOUR_APP_ID/app-assistant"}}
```

This means the Slack MCP feature has not been enabled for your app. There is no manifest property for this yet, so it must be toggled on manually:

1. Run `slack app settings` to open your app's settings page (or visit [api.slack.com/apps](https://api.slack.com/apps) and select your app)
2. Navigate to **Agents & AI Apps** in the left-side navigation
3. Toggle **Slack Model Context Protocol** on
