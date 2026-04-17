# 🚀 Netlify Deployment Guide for AGORA

This guide will help you deploy the AGORA application to Netlify.

## Prerequisites

1. A [Netlify account](https://app.netlify.com/signup) (free tier works)
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. Environment variables ready (see `.env.example`)

---

## Deployment Steps

### Option 1: Deploy via Netlify Dashboard (Recommended)

#### Step 1: Connect Your Repository

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize Netlify to access your repositories
5. Select your AGORA repository

#### Step 2: Configure Build Settings

Netlify should auto-detect Next.js settings, but verify:

- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Node version:** `20`

#### Step 3: Add Environment Variables

In the Netlify dashboard, go to **Site settings** → **Environment variables** and add:

**Required Variables:**
```
NEXT_PUBLIC_CHAIN_ID=1952
NEXT_PUBLIC_RPC_URL=https://testrpc.xlayer.tech/terigon
```

**Optional Variables (for backend features):**
```
PRIVATE_KEY=your_agent_wallet_private_key
PROVIDER_PRIVATE_KEY=your_provider_wallet_private_key
UNISWAP_API_KEY=your_uniswap_api_key
OK_API_KEY=your_okx_api_key
MULTI_AGENT=false
UNISWAP_EXECUTE=false
```

⚠️ **Security Note:** Never commit private keys to Git. Only add them in Netlify's environment variables.

#### Step 4: Deploy

1. Click **"Deploy site"**
2. Wait for the build to complete (usually 2-5 minutes)
3. Your site will be live at `https://random-name-123456.netlify.app`

#### Step 5: Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow the instructions to configure your DNS

---

### Option 2: Deploy via Netlify CLI

#### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### Step 2: Login to Netlify

```bash
netlify login
```

#### Step 3: Initialize Netlify Site

```bash
netlify init
```

Follow the prompts:
- Create & configure a new site
- Choose your team
- Enter a site name (or leave blank for random)

#### Step 4: Set Environment Variables

```bash
netlify env:set NEXT_PUBLIC_CHAIN_ID 1952
netlify env:set NEXT_PUBLIC_RPC_URL https://testrpc.xlayer.tech/terigon
```

Add other variables as needed.

#### Step 5: Deploy

```bash
# Deploy to production
netlify deploy --prod

# Or deploy to preview first
netlify deploy
```

---

## Post-Deployment Configuration

### 1. Update CORS Settings (if needed)

If you're calling external APIs, you may need to configure CORS headers in `netlify.toml`.

### 2. Enable Netlify Functions (for API routes)

Next.js API routes are automatically converted to Netlify Functions. No additional configuration needed!

### 3. Configure Redirects

The `netlify.toml` file already includes necessary redirects for Next.js routing.

### 4. Set up Continuous Deployment

Netlify automatically deploys when you push to your main branch. To configure:

1. Go to **Site settings** → **Build & deploy**
2. Configure branch deploys
3. Set up deploy notifications (optional)

---

## Troubleshooting

### Build Fails with "Module not found"

**Solution:** Ensure all dependencies are in `package.json`:
```bash
npm install
npm run build  # Test locally first
```

### Environment Variables Not Working

**Solution:** 
- Prefix public variables with `NEXT_PUBLIC_`
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

### API Routes Return 404

**Solution:**
- Verify `netlify.toml` is in the root directory
- Check that `@netlify/plugin-nextjs` is configured
- Redeploy the site

### Build Timeout

**Solution:**
- Upgrade to a paid Netlify plan for longer build times
- Optimize your build by removing unused dependencies
- Use `npm ci` instead of `npm install` for faster installs

### TypeScript Errors During Build

**Solution:**
```bash
# Fix locally first
npm run build

# If errors persist, you can skip type checking (not recommended)
# Add to package.json scripts:
"build": "next build --no-lint"
```

---

## Performance Optimization

### 1. Enable Netlify Edge Functions

For faster API responses, consider using Netlify Edge Functions for critical API routes.

### 2. Configure Caching

The `netlify.toml` already includes cache headers for static assets. Adjust as needed.

### 3. Enable Netlify Analytics

1. Go to **Site settings** → **Analytics**
2. Enable Netlify Analytics for detailed performance metrics

### 4. Use Netlify Image CDN

Next.js images are automatically optimized by Netlify's Image CDN.

---

## Monitoring & Maintenance

### View Deploy Logs

1. Go to **Deploys** tab in Netlify dashboard
2. Click on any deploy to view logs
3. Check for errors or warnings

### Set up Deploy Notifications

1. Go to **Site settings** → **Build & deploy** → **Deploy notifications**
2. Add notifications for:
   - Deploy started
   - Deploy succeeded
   - Deploy failed

### Monitor Site Performance

Use Netlify Analytics or integrate with:
- Google Analytics
- Vercel Analytics
- Sentry for error tracking

---

## Security Best Practices

### 1. Environment Variables

✅ **DO:**
- Use `NEXT_PUBLIC_` prefix for client-side variables
- Store sensitive keys only in Netlify environment variables
- Rotate keys regularly

❌ **DON'T:**
- Commit `.env` files to Git
- Expose private keys in client-side code
- Share environment variables publicly

### 2. API Security

- Implement rate limiting for API routes
- Validate all inputs
- Use HTTPS only (Netlify provides this automatically)

### 3. Content Security Policy

Add CSP headers in `netlify.toml` if needed:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
```

---

## Useful Netlify Commands

```bash
# Check deploy status
netlify status

# Open site in browser
netlify open

# View site logs
netlify logs

# List environment variables
netlify env:list

# Unlink site
netlify unlink

# Link to existing site
netlify link
```

---

## Additional Resources

- [Netlify Next.js Documentation](https://docs.netlify.com/frameworks/next-js/overview/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)

---

## Support

If you encounter issues:

1. Check [Netlify Support Forums](https://answers.netlify.com/)
2. Review [Next.js Discussions](https://github.com/vercel/next.js/discussions)
3. Open an issue in your repository

---

## Quick Checklist

Before deploying, ensure:

- [ ] All dependencies are in `package.json`
- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables are documented
- [ ] `.gitignore` includes `.env` and sensitive files
- [ ] `netlify.toml` is configured
- [ ] Repository is pushed to Git
- [ ] Netlify account is set up
- [ ] Environment variables are added to Netlify
- [ ] Custom domain is configured (optional)

---

**Your AGORA application is now ready for deployment! 🎉**
