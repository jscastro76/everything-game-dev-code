#!/usr/bin/env node
const path = require("path");
const { eventTargetFile, readEvent, result } = require("../lib/utils");
const { findGeneratedArtifactRule } = require("../lib/generated-artifacts");

const repoRoot = path.resolve(__dirname, "..", "..");

(async function main() {
  const event = await readEvent();
  const targetFile = eventTargetFile(event);

  let rule = null;
  let relPath = "";
  if (targetFile) {
    const absolute = path.resolve(event.cwd || repoRoot, targetFile);
    relPath = path.relative(repoRoot, absolute).split(path.sep).join("/");
    if (relPath && !relPath.startsWith("..")) {
      rule = findGeneratedArtifactRule(relPath);
    }
  }

  if (!rule) {
    result({
      ok: true,
      title: "Generated file guard",
      message: "Target is not a generated artifact.",
      tags: ["generated-artifacts", "workflow"],
    });
    return;
  }

  result({
    ok: true,
    status: "blocked",
    severity: "error",
    block: true,
    title: "Generated file guard",
    message: `${relPath} is generated from ${rule.source}. Edit the source, then run '${rule.sync}' instead of editing this file.`,
    tags: ["generated-artifacts", "workflow"],
    data: { file: relPath, source: rule.source, sync: rule.sync },
  });
})().catch((error) => {
  result({
    ok: false,
    status: "error",
    title: "Generated file guard",
    message: String(error && error.message ? error.message : error),
    severity: "error",
    tags: ["generated-artifacts", "workflow"],
  });
});
