# Netlify Deployment Troubleshooting

## Issue: Page Not Found (404 Error)

If you're seeing a "Page not found" error after deploying to Netlify, this is usually caused by missing redirects configuration.

### ⚡ QUICK FIX (Most Common Solution)

The `netlify.toml` file needs proper redirects for Next.js routing. Ensure your `netlify.toml` includes:

```toml
# Redirects for Next.js routing
[[redirects]]
  from = "/*"
  to = "/.netlify/functions/___netlify-handler"
  status = 200

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/___netlify-handler"
  status = 200
```

After updating `netlify.toml`:
1. Commit and push the changes
2. Go to Netlify dashboard → **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

### Solution 1: Clear Cache and Redeploy

1. Go to your Netlify dashboard
2. Click on **Site settings** → **Build & deploy**
3. Scroll down to **Build settings**
4. Click **Clear cache and retry deploy**
5. Or trigger a new deploy: **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

### Solution 2: Verify Build Settings

Make sure your Netlify build settings match:

```
Build command: npm run build
Publish directory: .next
Node version: 20
```

### Solution 3: Check Environment Variables

Ensure these environment variables are set in Netlify:

**Required:**
- `NEXT_PUBLIC_CHAIN_ID` = `1952`
- `NEXT_PUBLIC_RPC_URL` = `https://testrpc.xlayer.tech/terigon`

**Contract Addresses (if not in code):**
- `NEXT_PUBLIC_AGENT_REGISTRY`
- `NEXT_PUBLIC_SKILLS_REGISTRY`
- `NEXT_PUBLIC_PAYMENT_ROUTER`
- `NEXT_PUBLIC_LEADERBOARD`
- `NEXT_PUBLIC_TEST_USDC`

### Solution 4: Verify Plugin Installation

1. Go to **Site settings** → **Build & deploy** → **Build plugins**
2. Ensure `@netlify/plugin-nextjs` is listed
3. If not, it should be auto-installed from `netlify.toml`

### Solution 5: Check Deploy Logs

1. Go to **Deploys** tab
2. Click on the latest deploy
3. Check the deploy log for errors
4. Look for:
   - Build errors
   - Missing dependencies
   - Environment variable issues

### Solution 6: Manual Plugin Installation

If the plugin isn't auto-installing, you can add it manually:

```bash
npm install --save-dev @netlify/plugin-nextjs
```

Then commit and push:
```bash
git add package.json package-lock.json
git commit -m "Add Netlify Next.js plugin"
git push origin main
```

### Solution 7: Verify netlify.toml

Ensure your `netlify.toml` file is in the root directory and contains:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "20"
```

### Solution 8: Check for Build Errors

Common build errors:

**TypeScript errors:**
- Fix all TypeScript errors locally first
- Run `npm run build` locally to verify

**Missing dependencies:**
- Ensure all dependencies are in `package.json`
- Run `npm install` to verify

**Environment variables:**
- Check that all required env vars are set
- Verify variable names (case-sensitive)

### Solution 9: Force Redeploy

Sometimes Netlify needs a fresh deploy:

1. Make a small change (add a comment to a file)
2. Commit and push
3. Wait for automatic deploy

Or use Netlify CLI:
```bash
netlify deploy --prod --build
```

### Solution 10: Check Next.js Version Compatibility

Ensure you're using a compatible Next.js version:

```json
{
  "dependencies": {
    "next": "16.2.3"
  }
}
```

The `@netlify/plugin-nextjs` supports Next.js 12, 13, 14, 15, and 16.

## Common Issues and Solutions

### Issue: API Routes Return 404

**Solution:** API routes are automatically converted to Netlify Functions. No additional configuration needed.

### Issue: Images Not Loading

**Solution:** Ensure `next.config.ts` has:
```typescript
images: {
  unoptimized: true,
}
```

### Issue: Environment Variables Not Working

**Solution:**
1. Verify variables are set in Netlify dashboard
2. Public variables must start with `NEXT_PUBLIC_`
3. Redeploy after adding new variables

### Issue: Build Timeout

**Solution:**
1. Upgrade to paid Netlify plan for longer build times
2. Optimize dependencies
3. Remove unused packages

## Verification Checklist

After deploying, verify:

- [ ] Home page loads (`/`)
- [ ] Dashboard page loads (`/dashboard`)
- [ ] Marketplace page loads (`/marketplace`)
- [ ] API routes work (`/api/agent/telemetry`)
- [ ] Wallet connection works
- [ ] Images load correctly
- [ ] No console errors

## Getting Help

If issues persist:

1. Check [Netlify Support Forums](https://answers.netlify.com/)
2. Review [Next.js on Netlify Docs](https://docs.netlify.com/frameworks/next-js/overview/)
3. Check [Netlify Status](https://www.netlifystatus.com/)
4. Contact Netlify Support (paid plans)

## Useful Commands

```bash
# Check Netlify status
netlify status

# View deploy logs
netlify logs

# Open site in browser
netlify open

# Deploy manually
netlify deploy --prod

# Link to existing site
netlify link
```

## Debug Mode

Enable debug logging in Netlify:

1. Add to `netlify.toml`:
```toml
[build.environment]
  DEBUG = "*"
```

2. Redeploy and check logs for detailed output

---

**Most Common Fix:** Clear cache and redeploy! 🔄
