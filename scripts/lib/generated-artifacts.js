#!/usr/bin/env node
// Which tracked files are generator output, and which sync command owns each.
// Derived from the harness registry where the generators derive from it, so a
// new harness is covered without touching this file. Consumed by the
// generated-file-guard hook; tests/hooks/generated-artifacts.test.js checks it
// against what the generators actually write.

const { loadHarnesses } = require("./harnesses");

function generatedArtifactRules() {
  const rules = [
    { exact: "STRUCTURE-TREE.txt", sync: "npm run sync:structure", source: "the tracked file tree" },
    { exact: "docs/structure-overview.md", sync: "npm run sync:structure", source: "the tracked file tree" },
    { exact: "docs/orchestration/dependency-graph.md", sync: "npm run sync:graph", source: "the scaffold layers" },
    { exact: ".cursor/hooks.json", sync: "npm run sync:hook-wiring", source: "hooks/hooks.json" },
    { prefix: "mcp-configs/generated/", sync: "npm run sync:mcp", source: "mcp-configs/mcp-servers.json" },
  ];
  for (const harness of loadHarnesses()) {
    if (harness.commands) {
      rules.push({
        prefix: `${harness.commands.dir}/`,
        suffix: ".md",
        sync: "npm run sync:wrappers",
        source: "commands/*.md",
      });
      if (harness.commands.registry) {
        rules.push({ exact: harness.commands.registry, sync: "npm run sync:wrappers", source: "commands/*.md" });
      }
    }
    if (harness.mcp && harness.mcp.path !== (harness.commands || {}).registry) {
      rules.push({ exact: harness.mcp.path, sync: "npm run sync:mcp", source: "mcp-configs/mcp-servers.json" });
    }
  }
  return rules;
}

// relPath: repo-relative, forward slashes. Returns the owning rule or null.
function findGeneratedArtifactRule(relPath) {
  const target = String(relPath || "");
  for (const rule of generatedArtifactRules()) {
    if (rule.exact) {
      if (target === rule.exact) return rule;
    } else if (
      target.startsWith(rule.prefix) &&
      (!rule.suffix || target.endsWith(rule.suffix)) &&
      !(rule.suffix && target === `${rule.prefix}README.md`)
    ) {
      // Wrapper folders keep a hand-written README.md next to the generated wrappers.
      return rule;
    }
  }
  return null;
}

module.exports = {
  findGeneratedArtifactRule,
  generatedArtifactRules,
};
