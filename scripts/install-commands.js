#!/usr/bin/env node
/**
 * Copies all scaffold commands into .claude/commands/ so Claude Code
 * exposes them as slash commands (e.g. /plan, /gdd, /tdd).
 *
 * Run from the scaffold root:
 *   node scripts/install-commands.js
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const src = path.join(root, "commands");
const dest = path.join(root, ".claude", "commands");

// Ensure destination exists
if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest, { recursive: true });
}

const files = fs.readdirSync(src).filter(
  (f) => f.endsWith(".md") && f !== "README.md"
);

let copied = 0;
for (const file of files) {
  fs.copyFileSync(path.join(src, file), path.join(dest, file));
  copied++;
}

console.log(`✓ Installed ${copied} commands to .claude/commands/`);
console.log(`  Restart Claude Code to pick up the new slash commands.`);
