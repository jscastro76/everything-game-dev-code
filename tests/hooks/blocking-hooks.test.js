#!/usr/bin/env node
// End-to-end: drives scripts/hooks/claude-adapter.js the way Claude Code does and
// asserts which tool calls are denied. Blocks must stay limited to deterministic
// violations; everything else is a warning or silence.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { generatedArtifactRules, findGeneratedArtifactRule } = require('../../scripts/lib/generated-artifacts');
const { loadEngines } = require('../../scripts/lib/engines');
const { loadHarnesses } = require('../../scripts/lib/harnesses');

const repoRoot = path.resolve(__dirname, '..', '..');
const adapter = path.join(repoRoot, 'scripts', 'hooks', 'claude-adapter.js');

function runAdapter(phase, event, env = {}) {
  const child = spawnSync(process.execPath, [adapter, phase], {
    cwd: repoRoot,
    input: JSON.stringify(event),
    encoding: 'utf8',
    env: { ...process.env, GAME_DEV_PROFILE: '', GAME_DEV_HOOKS_WARN_ONLY: '', WORKSPACE_ROOT: repoRoot, ...env },
  });
  assert.strictEqual(child.status, 0, 'The adapter must always exit 0.');
  return child.stdout ? JSON.parse(child.stdout) : {};
}

function edit(filePath) {
  return { tool_name: 'Edit', cwd: repoRoot, tool_input: { file_path: filePath, old_string: 'a', new_string: 'b' } };
}

function denied(output) {
  const specific = output.hookSpecificOutput;
  return Boolean(specific && specific.hookEventName === 'PreToolUse' && specific.permissionDecision === 'deny');
}

// --- generated file guard --------------------------------------------------------
const generatedSamples = [
  '.claude/commands/gdd.md',
  'STRUCTURE-TREE.txt',
  'docs/structure-overview.md',
  'docs/orchestration/dependency-graph.md',
  '.cursor/hooks.json',
  'mcp-configs/generated/mcp.json',
];
for (const rel of generatedSamples) {
  assert.ok(fs.existsSync(path.join(repoRoot, rel)), `Sample generated file '${rel}' must exist.`);
  const relative = runAdapter('PreToolUse', edit(rel));
  assert.ok(denied(relative), `Editing generated file '${rel}' must be denied.`);
  assert.match(relative.hookSpecificOutput.permissionDecisionReason, /npm run sync:/);
  assert.ok(denied(runAdapter('PreToolUse', edit(path.join(repoRoot, rel)))), `Absolute path to '${rel}' must be denied.`);
}

const handWritten = [
  'commands/gdd.md',
  'hooks/hooks.json',
  '.claude/commands/README.md',
  '.claude/settings.json',
  'mcp-configs/mcp-servers.json',
  'README.md',
  '../outside-the-scaffold/.claude/commands/gdd.md',
];
for (const rel of handWritten) {
  assert.ok(!denied(runAdapter('PreToolUse', edit(rel))), `Editing source file '${rel}' must not be denied.`);
}

// Every command wrapper and MCP config the registries declare is covered.
const commandNames = fs.readdirSync(path.join(repoRoot, 'commands')).filter((f) => f.endsWith('.md') && f !== 'README.md');
for (const harness of loadHarnesses()) {
  if (harness.commands) {
    for (const name of commandNames) {
      assert.ok(findGeneratedArtifactRule(`${harness.commands.dir}/${name}`), `Wrapper ${harness.commands.dir}/${name} is not guarded.`);
    }
    if (harness.commands.registry) {
      assert.ok(findGeneratedArtifactRule(harness.commands.registry), `${harness.commands.registry} is not guarded.`);
    }
  }
  if (harness.mcp) {
    assert.ok(findGeneratedArtifactRule(harness.mcp.path), `${harness.mcp.path} is not guarded.`);
  }
}
// No stale exact entries.
for (const rule of generatedArtifactRules()) {
  if (rule.exact) {
    assert.ok(fs.existsSync(path.join(repoRoot, rule.exact)), `Guarded file '${rule.exact}' does not exist.`);
  }
}

// --- engine profile guard --------------------------------------------------------
const seenSuffixes = new Map();
for (const engine of loadEngines()) {
  for (const suffix of engine.exclusiveFileSuffixes || []) {
    assert.strictEqual(suffix, suffix.toLowerCase(), `Suffix '${suffix}' must be lowercase.`);
    assert.ok(!seenSuffixes.has(suffix), `Suffix '${suffix}' is claimed by ${seenSuffixes.get(suffix)} and ${engine.id}.`);
    seenSuffixes.set(suffix, engine.id);
  }
}

const godotScene = '/work/game/scenes/Main.tscn';
assert.ok(denied(runAdapter('PreToolUse', edit(godotScene), { GAME_DEV_PROFILE: 'unity' })), 'A Godot scene under the unity profile must be denied.');
assert.ok(!denied(runAdapter('PreToolUse', edit(godotScene), { GAME_DEV_PROFILE: 'godot' })), 'A Godot scene under the godot profile is fine.');

// No profile: still only a warning.
const noProfile = runAdapter('PreToolUse', edit(godotScene), { WORKSPACE_ROOT: path.join(repoRoot, 'tests') });
assert.ok(!denied(noProfile), 'A missing profile warns, it does not block.');
assert.match(noProfile.systemMessage || '', /Engine profile guard/);

// Fuzzy markers never block: a generic assets/ path in a Godot project is not Unity.
assert.ok(!denied(runAdapter('PreToolUse', edit('/work/game/assets/player.png'), { GAME_DEV_PROFILE: 'godot' })), 'Fuzzy path markers must not block.');
// Web has no exclusive file types.
assert.ok(!denied(runAdapter('PreToolUse', edit('/work/game/index.html'), { GAME_DEV_PROFILE: 'unity' })), 'index.html must not block.');

// --- escape hatch and phase limits -----------------------------------------------
const warnOnly = runAdapter('PreToolUse', edit('STRUCTURE-TREE.txt'), { GAME_DEV_HOOKS_WARN_ONLY: '1' });
assert.ok(!denied(warnOnly), 'GAME_DEV_HOOKS_WARN_ONLY=1 must downgrade blocks.');
assert.match(warnOnly.systemMessage || '', /Generated file guard/);

assert.ok(!denied(runAdapter('PostToolUse', edit('STRUCTURE-TREE.txt'))), 'Only PreToolUse can deny.');
assert.ok(!denied(runAdapter('PreToolUse', { tool_name: 'Bash', cwd: repoRoot, tool_input: { command: 'npm run sync:structure' } })), 'Running a sync command must not be denied.');

console.log('PASS hooks/blocking-hooks.test.js');
