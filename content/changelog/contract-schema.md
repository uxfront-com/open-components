---
title: A schema for contracts
description: Every contract now follows a published JSON Schema, so you, your editor and your agents can validate one before relying on it.
date: 2026-10-04
category: Contracts
link:
  label: Read about contracts
  to: /docs/getting-started/introduction#for-agents
---

Contracts give agents every requirement for a component in one YAML file, so a field that's missing or misspelled leads them astray without a word. They now all follow one published [JSON Schema](/schemas/contract.json){external=""}, which catches those mistakes before anyone relies on the contract.

## New

- Every contract names the schema on its first line, so editors that use the YAML language server check it as you type.
- The schema covers components and conventions alike, so you can validate the contracts you write for your own components too.
- We validate every contract on this site against it on every change, so the ones we publish always pass.
