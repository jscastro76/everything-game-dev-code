#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROFILE="${1:-}"

if [[ -z "$PROFILE" ]]; then
  cat <<MSG
Usage: ./install.sh <profile>

Example profiles:
  unity-mobile-f2p
  unreal-console-aaa
  godot-indie-2d
  unity-multiplayer
  preproduction-only

This script is a lightweight scaffold installer entry point.
It is expected to be extended to read manifests and copy or activate the correct layers.
MSG
  exit 1
fi

echo "[everything-game-dev-code] Installing profile: $PROFILE"
echo "[everything-game-dev-code] Root: $ROOT_DIR"

if [[ ! -f "$ROOT_DIR/manifests/install-profiles.json" ]]; then
  echo "Manifest file not found: manifests/install-profiles.json"
  exit 2
fi

echo "[stub] Validate profile exists"
echo "[stub] Resolve components and modules"
echo "[stub] Activate engine-specific layer safely"
echo "[stub] Write install state"

echo "Installation flow stub completed. Replace with your project-specific install logic."
