# ✅ Netlify Deployment Checklist

## Pre-Deployment

- [x] Code pushed to GitHub
- [x] `netlify.toml` configuration file created
- [x] `.env.example` file created
- [x] `.gitignore` properly configured
- [ ] All environment variables documented

## Netlify Setup

### Step 1: Create Netlify Account
- [ ] Go to https://app.netlify.com/signup
- [ ] Sign up with GitHub (recommended)

### Step 2: Import Project
- [ ] Click "Add new site" → "Import an existing project"
- [ ] Choose GitHub
- [ ] Select your AGORA repository
- [ ] Authorize Netlify to access the repository

### Step 3: Configure Build Settings
Netlify should auto-detect these, but verify:
- [ ] Build command: `npm run build`
- [ ] Publish directory: `.next`
- [ ] Node version: `20`

### Step 4: Add Environment Variables
Go to Site settings → Environment variables and add:

**Required (Public):**
- [ ] `NEXT_PUBLIC_CHAIN_ID` = `1952`
- [ ] `NEXT_PUBLIC_RPC_URL` = `https://testrpc.xlayer.tech/terigon`

**Optional (Backend - if using agent features):**
- [ ] `PRIVATE_KEY` = your_agent_wallet_private_key
- [ ] `PROVIDER_PRIVATE_KEY` = your_provider_wallet_private_key
- [ ] `UNISWAP_API_KEY` = your_uniswap_api_key
- [ ] `OK_API_KEY` = your_okx_api_key

**Optional (Features):**
- [ ] `MULTI_AGENT` = `false`
- [ ] `UNISWAP_EXECUTE` = `false`
- [ ] `WEBHOOK_URL` = (if using notifications)
- [ ] `OPENAI_API_KEY` = (if using AI chat)

### Step 5: Deploy
- [ ] Click "Deploy site"
- [ ] Wait for build to complete (2-5 minutes)
- [ ] Check deploy logs for any errors

### Step 6: Verify Deployment
- [ ] Visit your Netlify URL (e.g., `https://random-name-123456.netlify.app`)
- [ ] Test home page loads
- [ ] Test dashboard page
- [ ] Test marketplace page
- [ ] Test wallet connection
- [ ] Test contract interactions (if applicable)

## Post-Deployment

### Optional: Custom Domain
- [ ] Go to Site settings → Domain management
- [ ] Add custom domain
- [ ] Configure DNS settings
- [ ] Wait for SSL certificate (automatic)

### Optional: Enable Features
- [ ] Enable Netlify Analytics
- [ ] Set up deploy notifications
- [ ] Configure branch deploys
- [ ] Add deploy hooks (if needed)

## Troubleshooting

### Build Fails
- [ ] Check build logs in Netlify dashboard
- [ ] Verify all dependencies are in `package.json`
- [ ] Test build locally: `npm run build`
- [ ] Check Node version matches (20)

### Environment Variables Not Working
- [ ] Verify variable names are correct (case-sensitive)
- [ ] Public variables must start with `NEXT_PUBLIC_`
- [ ] Redeploy after adding new variables

### API Routes Return 404
- [ ] Verify `netlify.toml` is in root directory
- [ ] Check redirects configuration
- [ ] Redeploy the site

### Wallet Connection Issues
- [ ] Check browser console for errors
- [ ] Verify RPC URL is accessible
- [ ] Test with different wallet (MetaMask, WalletConnect)

## Quick Commands

```bash
# Install Netlify CLI (optional)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from CLI
netlify deploy --prod

# Check status
netlify status

# View logs
netlify logs

# Open site in browser
netlify open
```

## Important Notes

⚠️ **Security:**
- Never commit `.env` files to Git
- Only add sensitive keys in Netlify environment variables
- Use `NEXT_PUBLIC_` prefix only for non-sensitive client-side variables

📝 **Performance:**
- First deploy may take longer (5-10 minutes)
- Subsequent deploys are faster (2-3 minutes)
- Netlify automatically optimizes images and assets

🔄 **Continuous Deployment:**
- Netlify automatically deploys when you push to main branch
- You can configure deploy previews for pull requests
- Branch deploys available for testing

## Support Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Next.js on Netlify](https://docs.netlify.com/frameworks/next-js/overview/)
- [Netlify Support Forums](https://answers.netlify.com/)
- [AGORA Deployment Guide](./DEPLOYMENT_GUIDE.md)

---

**Your site is ready to deploy! 🚀**

Once deployed, your AGORA application will be live at:
`https://your-site-name.netlify.app`
