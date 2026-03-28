#!/usr/bin/env node
const path = require("path");
const fs = require("fs");
const { ENGINE_PROFILES, getWorkspaceRoot } = require("./lib/profile-resolution");
const { ensureDir } = require("./lib/utils");

const requested = (process.argv[2] || "").trim().toLowerCase();

if (!ENGINE_PROFILES.includes(requested)) {
  process.stderr.write(
    `Usage: node scripts/setup-profile.js <${ENGINE_PROFILES.join("|")}>\n`
  );
  process.exit(1);
}

const workspace = getWorkspaceRoot();
const stateDir = path.join(workspace, ".game-dev");
const stateFile = path.join(stateDir, "profile.json");

ensureDir(stateDir);
fs.writeFileSync(
  stateFile,
  JSON.stringify(
    {
      active_profile: requested,
      updated_at: new Date().toISOString(),
    },
    null,
    2
  ),
  "utf8"
);

process.stdout.write(
  JSON.stringify(
    {
      ok: true,
      active_profile: requested,
      state_file: stateFile,
      note: "Set the GAME_DEV_PROFILE environment variable in your harness to make hooks consume this profile automatically.",
    },
    null,
    2
  )
);
