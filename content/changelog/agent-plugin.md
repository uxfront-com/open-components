---
title: The agent plugin
description: Install the standard in your agent as one plugin, with skills that build and review components rule by rule, and our MCP server.
date: 2026-10-06
category: Getting Started
link:
  label: Install the agent plugin
  to: /docs/getting-started/agent-plugin
---

Our MCP server gives your agents the standard as tools, but they still need to know when to reach for it, and its prompts only run when you start them. Our agent plugin brings the two together: skills that your agent picks up on its own whenever it builds or reviews a component, and the MCP server they read the standard from.

## New

- Install it in VS Code, GitHub Copilot, Cursor, Codex, Claude Code and any other client that supports [Agent Plugins](https://agent-plugins.org), the open format for packaging skills and MCP servers.
- Its skills build a component in your framework, review one or how a screen uses it, reporting every rule by its ID, and move your CSS variables to token paths.
- Where your client doesn't connect MCP servers, the skills read the same contracts and pages from this site.
