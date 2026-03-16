#!/usr/bin/env bash

# build.sh - builds Docker images for the 'api' and 'app' subprojects
# and optionally pushes them to a remote registry.
#
# Usage:
#   ./build.sh [registry] [tag] [platforms]
#
# Arguments:
#   registry  - Docker registry/username to push to (default: docker.io/corcoran909)
#   tag       - image tag to use (default: latest)
#   platforms - comma-separated list of platforms for buildx (default: linux/amd64)
#
# Examples:
#   ./build.sh                # build and push to docker.io/corcoran909/{api,app}:latest
#   ./build.sh myuser 1.0     # build & push to myuser/{api,app}:1.0
#   ./build.sh '' '' "linux/amd64,linux/arm64"  # specify platforms

set -euo pipefail

# If the current session cannot access macOS Keychain (common in CI/remote/non-GUI
# shells), Docker credential helpers can fail even when pulling public images.
# Opt-in to a minimal DOCKER_CONFIG that does not use credsStore.
if [[ ${NO_KEYCHAIN:-0} -eq 1 ]]; then
  export DOCKER_CONFIG=${DOCKER_CONFIG:-"$PWD/.docker-nokeychain"}
  mkdir -p "$DOCKER_CONFIG"

  # Default to Docker Desktop's context name; allow override if needed.
  DOCKER_CONTEXT_NAME=${DOCKER_CONTEXT_NAME:-desktop-linux}

  # When connected over SSH, Docker may fall back to the Linux default socket
  # (unix:///var/run/docker.sock). If Docker Desktop is running, its daemon
  # socket is typically available here.
  if [[ -z ${DOCKER_HOST:-} && -S "$HOME/.docker/run/docker.sock" ]]; then
    export DOCKER_HOST="unix://$HOME/.docker/run/docker.sock"
  fi

  # Bring over context + buildx metadata so the Docker CLI doesn't fall back to
  # unix:///var/run/docker.sock when using an alternate DOCKER_CONFIG.
  if [[ -d "$HOME/.docker/contexts" && ! -d "$DOCKER_CONFIG/contexts" ]]; then
    cp -a "$HOME/.docker/contexts" "$DOCKER_CONFIG/contexts"
  fi
  if [[ -d "$HOME/.docker/buildx" && ! -d "$DOCKER_CONFIG/buildx" ]]; then
    cp -a "$HOME/.docker/buildx" "$DOCKER_CONFIG/buildx"
  fi

  # Generate a config.json that preserves your settings/currentContext but
  # removes Keychain-backed credential helpers (credsStore/credHelpers).
  if [[ ! -f "$DOCKER_CONFIG/config.json" ]]; then
    python3 - <<'PY'
import json
import os

src = os.path.expanduser('~/.docker/config.json')
dst = os.path.join(os.environ['DOCKER_CONFIG'], 'config.json')
context_name = os.environ.get('DOCKER_CONTEXT_NAME', 'desktop-linux')

cfg = {}
if os.path.exists(src):
    with open(src, 'r') as f:
        cfg = json.load(f)

# Remove credential helpers that require Keychain interaction
cfg.pop('credsStore', None)
cfg.pop('credHelpers', None)

# Do not carry over stored auths into this alternate config
cfg['auths'] = {}

# Force Docker Desktop context
cfg['currentContext'] = context_name

with open(dst, 'w') as f:
    json.dump(cfg, f)
    f.write('\n')
PY
  fi

  echo "NO_KEYCHAIN enabled; using DOCKER_CONFIG=$DOCKER_CONFIG (currentContext=$DOCKER_CONTEXT_NAME)"
fi

REGISTRY=${1:-docker.io/corcoran909}
TAG=${2:-latest}
PLATFORMS=${3:-linux/amd64}

# Allow skipping push by setting SKIP_PUSH=1 in environment
PUSH_FLAG="--push"
if [[ ${SKIP_PUSH:-0} -eq 1 ]]; then
  PUSH_FLAG="--load"
  echo "SKIP_PUSH enabled; images will be loaded locally instead of pushed"
fi

echo "Registry : $REGISTRY"
echo "Tag      : $TAG"
echo "Platforms: $PLATFORMS"

for dir in api app; do
  dockerfile="dockerfile.${dir}"
  if [[ ! -f "$dir/$dockerfile" ]]; then
    echo "warning: $dir/$dockerfile not found, skipping $dir" >&2
    continue
  fi
  # image name is independent of dir but hardcoded to match requirements
  if [[ "$dir" == "api" ]]; then
    image="corcoran909/test-cycling-api:${TAG}"
  else
    image="corcoran909/test-cycling-app:${TAG}"
  fi

  echo "\n==> Building $dir image: $image"
  docker buildx build \
    --platform "$PLATFORMS" \
    -f "$dir/$dockerfile" \
    -t "$image" \
    $PUSH_FLAG \
    "$dir"
  echo "built $image"
done

echo "\nAll builds completed."
