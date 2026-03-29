#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { report } = require("./lib/validation");
const {
  generateStructureOverview,
  generateStructureTree,
  repoRoot,
} = require("./lib/structure-artifacts");

const errors = [];

const structureTreePath = path.join(repoRoot, "STRUCTURE-TREE.txt");
const structureOverviewPath = path.join(repoRoot, "docs", "structure-overview.md");

const actualTree = fs.readFileSync(structureTreePath, "utf8");
const expectedTree = generateStructureTree();
if (actualTree !== expectedTree) {
  errors.push(
    "STRUCTURE-TREE.txt is out of date. Run 'npm run sync:structure' to refresh it."
  );
}

const actualOverview = fs.readFileSync(structureOverviewPath, "utf8");
const expectedOverview = generateStructureOverview();
if (actualOverview !== expectedOverview) {
  errors.push(
    "docs/structure-overview.md is out of date. Run 'npm run sync:structure' to refresh it."
  );
}

report(errors, "PASS validate:structure-artifacts");
