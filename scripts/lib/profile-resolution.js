#!/usr/bin/env node
const path = require("path");
const fs = require("fs");

const ENGINE_PROFILES = ["unity", "unreal", "godot"];

function getWorkspaceRoot() {
  return process.env.WORKSPACE_ROOT || process.cwd();
}

function getActiveProfile() {
  const raw = process.env.GAME_DEV_PROFILE || "";
  return raw.trim().toLowerCase();
}

function detectProfileFromPaths(text) {
  const source = String(text || "").toLowerCase();
  if (source.includes("assets/") || source.includes(".unity") || source.includes("projectsettings/")) {
    return "unity";
  }
  if (source.includes(".uproject") || source.includes("/content/") || source.includes(".uasset") || source.includes(".umap")) {
    return "unreal";
  }
  if (source.includes("project.godot") || source.includes(".tscn") || source.includes(".tres")) {
    return "godot";
  }
  return "";
}

function isValidProfile(profile) {
  return ENGINE_PROFILES.includes(profile);
}

function getProfileInfo(profile = getActiveProfile()) {
  return {
    active_profile: profile || "",
    is_engine_profile: isValidProfile(profile),
    workspace_root: getWorkspaceRoot(),
  };
}

module.exports = {
  detectProfileFromPaths,
  ENGINE_PROFILES,
  getActiveProfile,
  getProfileInfo,
  getWorkspaceRoot,
  isValidProfile,
};
