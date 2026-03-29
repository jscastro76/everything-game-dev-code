#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const {
  generateStructureOverview,
  generateStructureTree,
  repoRoot,
} = require("./lib/structure-artifacts");

fs.writeFileSync(path.join(repoRoot, "STRUCTURE-TREE.txt"), generateStructureTree(), "utf8");
fs.writeFileSync(
  path.join(repoRoot, "docs", "structure-overview.md"),
  generateStructureOverview(),
  "utf8"
);

console.log("PASS sync:structure");
