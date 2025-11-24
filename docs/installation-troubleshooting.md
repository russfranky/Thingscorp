# Installation troubleshooting

This repository depends on the public npm registry. In restricted network environments the registry can return HTTP 403 responses through the proxy, which prevents `npm install` from succeeding. If you see errors like:

```
npm error code E403
npm error 403 Forbidden - GET https://registry.npmjs.org/@types%2fnode
```

follow these steps:

1. **Verify registry reachability**
   ```bash
   curl -I https://registry.npmjs.org/next
   ```
   If this returns a 403 or fails to connect, outbound access is blocked by your proxy.

2. **Check proxy variables**
   Ensure the environment variables are set correctly for your network (or unset if not required):
   ```bash
   export HTTP_PROXY=http://proxy:8080
   export HTTPS_PROXY=http://proxy:8080
   export http_proxy=http://proxy:8080
   export https_proxy=http://proxy:8080
   # Or unset them if the proxy should not be used
   unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy npm_config_http_proxy npm_config_https_proxy
   ```

3. **Configure npm registry explicitly**
   ```bash
   npm config set registry https://registry.npmjs.org/
   ```

4. **Retry installation**
   ```bash
   npm install --progress=false
   ```

If the proxy continues to return 403 responses, request registry access or add the required allowlist rule. Until registry access is restored, local installs and tests cannot run.

## Quick remediation script

Run the helper to normalize npm proxy settings and verify registry reachability:

```bash
npm run fix-npm-proxy
# or provide PROXY_URL for authenticated proxies
PROXY_URL=http://user:pass@proxy:8080 npm run fix-npm-proxy
```

If the reachability check fails, share the script output with your network admin so they can allowlist the npm registry.
