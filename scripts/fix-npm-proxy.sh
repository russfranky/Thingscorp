#!/usr/bin/env bash
set -euo pipefail

# This script normalizes npm proxy settings so installs do not fail with 403s
# when a transparent proxy blocks the registry. It can either clear proxy
# settings or configure them from PROXY_URL, then verifies registry reachability.

REGISTRY_URL=${NPM_REGISTRY:-"https://registry.npmjs.org/"}
PROXY_URL=${PROXY_URL:-""}

echo "[fix-npm-proxy] Using registry: ${REGISTRY_URL}" >&2

# Clear environment vars that npm treats as config overrides
unset npm_config_http_proxy npm_config_https_proxy http_proxy https_proxy HTTP_PROXY HTTPS_PROXY

# Reset proxy config in npmrc
npm config delete proxy >/dev/null 2>&1 || true
npm config delete https-proxy >/dev/null 2>&1 || true

if [[ -n "$PROXY_URL" ]]; then
  echo "[fix-npm-proxy] Applying proxy ${PROXY_URL}" >&2
  npm config set proxy "${PROXY_URL}" >/dev/null
  npm config set https-proxy "${PROXY_URL}" >/dev/null
else
  echo "[fix-npm-proxy] No PROXY_URL provided; leaving proxy unset" >&2
fi

npm config set registry "${REGISTRY_URL}" >/dev/null
npm config set strict-ssl true >/dev/null

# Show resulting npm config (filtered)
CONFIG_SUMMARY=$(npm config list | sed -n '/; proxy/,$p' | sed 's/^;//')
echo "[fix-npm-proxy] npm config summary:\n${CONFIG_SUMMARY}" >&2

echo "[fix-npm-proxy] Checking reachability…" >&2
CURL_CMD=(curl -I "${REGISTRY_URL%@*}/@types/node")
if [[ -n "$PROXY_URL" ]]; then
  CURL_CMD+=(--proxy "$PROXY_URL")
fi

if "${CURL_CMD[@]}"; then
  echo "[fix-npm-proxy] Registry reachable. You can retry: npm install --progress=false" >&2
else
  echo "[fix-npm-proxy] Registry not reachable. Please verify proxy access or allowlist the registry." >&2
  exit 1
fi
