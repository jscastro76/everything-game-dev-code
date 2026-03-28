# hooks/

Hooks connect rules, agents, commands, and skills to real workflow behavior.

## Scope
This block contains:
- `hooks/hooks.json`: the hook configuration entry point
- `scripts/hooks/*.js`: hook handlers
- `scripts/lib/*.js`: shared utilities used by handlers
- `scripts/setup-profile.js`: profile bootstrap helper

## Design Goals
- Catch risky workflow mistakes early
- Encourage doc and source-of-truth updates
- Make engine profile activation explicit
- Surface content and build risks before release crunch
- Save useful session summaries instead of losing decisions in chat history

## Supported Behaviors
- warn when design changes happen without doc updates
- warn when build-like commands run without an active engine profile
- check scene/prefab/blueprint/node-heavy changes for review triggers
- warn about performance or asset-budget pressure
- capture build/test context
- capture playtest notes and crash logs
- write a session summary when work stops

## Notes
- The JSON schema and event wiring can be adapted per harness.
- The scripts are written as reusable Node-based hook templates.
- The scripts are intentionally engine-aware but keep the engine choice external via profile resolution.

## Files
- `hooks.json`
- `scripts/hooks/gdd-sync-warning.js`
- `scripts/hooks/engine-profile-guard.js`
- `scripts/hooks/scene-integrity-check.js`
- `scripts/hooks/prefab-blueprint-node-warning.js`
- `scripts/hooks/performance-budget-warning.js`
- `scripts/hooks/asset-size-warning.js`
- `scripts/hooks/build-matrix-capture.js`
- `scripts/hooks/playtest-capture.js`
- `scripts/hooks/session-summary.js`
- `scripts/hooks/crash-log-capture.js`
