# GitHub Actions → Hugging Face Space Auto-Deploy Setup

## 🎯 Goal
Auto-deploy to Hugging Face Space on every push to GitHub `master`/`main` branch.

---

## 🔧 Prerequisites

### 1. Hugging Face Token
1. Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Create a new token with **Write** access
3. Copy the token (starts with `hf_`)

### 2. Hugging Face Space
- Your Space: `https://huggingface.co/spaces/Tablets/ahmed-engineering-erp`
- Space repo name: `Tablets/ahmed-engineering-erp`

---

## 🔐 GitHub Secrets Setup

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these two secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `HF_TOKEN` | `hf_xxxxxxxxxxxxxxxxxxxx` | Your Hugging Face token with Write access |
| `HF_SPACE_REPO` | `Tablets/ahmed-engineering-erp` | Your HF Space repository name |

---

## 📁 Workflow Files Created

### 1. `.github/workflows/deploy-hf-space.yml`
Auto-deploys on every push to `master`/`main` branch.

**Triggers:**
- Push to `master` or `main` branch
- Manual trigger via GitHub Actions UI

**Steps:**
1. Checkout code
2. Set up Docker Buildx
3. Login to Hugging Face Hub
4. Build & push Docker image to HF Space
5. Trigger Space rebuild

### 2. `deploy-to-hf.sh` (Manual deploy script)
For manual deployments or testing.

---

## ✅ Verification Steps

### 1. Check GitHub Actions
After pushing to GitHub:
1. Go to **Actions** tab in your GitHub repo
2. Watch the "Deploy to Hugging Face Space" workflow
3. Should complete in 3-5 minutes

### 2. Check Hugging Face Space
1. Go to `https://huggingface.co/spaces/Tablets/ahmed-engineering-erp`
2. Click **"Settings"** → **"Repository"**
3. Should show connected to your GitHub repo
4. Check **"Logs"** for build status

### 3. Test Auto-Deploy
Make a small change:
```bash
echo "# Test auto-deploy" >> README.md
git add README.md
git commit -m "test: trigger auto-deploy"
git push origin master
```
Watch the GitHub Action run and Space update automatically.

---

## 🐳 Docker Build Details

### Multi-stage Build (Dockerfile)
- **Stage 1**: Node 20 Alpine → Build React frontend (`npm run build`)
- **Stage 2**: Python 3.11 Slim → Install dependencies, copy backend + built frontend
- **Port**: 8000 (configured in main.py)

### Build Time
- First build: ~5-10 minutes
- Subsequent builds: ~2-3 minutes (with cache)

---

## 🔄 How It Works

```
GitHub Push → GitHub Actions → Docker Build → Push to HF Space → Auto Rebuild
     │              │                │                  │              │
     ▼              ▼                ▼                  ▼              ▼
  master/main   checkout +      Buildx +          Image tagged      Trigger API
  branch        setup          Dockerfile        as latest         rebuild
```

---

## 🛠️ Troubleshooting

### Build Fails
1. Check GitHub Actions logs for error details
2. Common issues:
   - Missing dependencies in `pyproject.toml` / `package.json`
   - Port mismatch (ensure main.py uses port 8000)
   - Memory limits (Space free tier has 16GB RAM)

### Space Doesn't Update
1. Check if workflow completed successfully
2. Verify HF_TOKEN has Write access
3. Check Space logs: `https://huggingface.co/spaces/Tablets/ahmed-engineering-erp/logs`

### Manual Deploy (Emergency)
```bash
# Set environment variables
export HF_TOKEN="your_hf_token"
export HF_SPACE_REPO="Tablets/ahmed-engineering-erp"

# Run deploy script
./deploy-to-hf.sh
```

---

## 📋 Quick Checklist

- [ ] GitHub repo created: `Ahmed-Gaffer/ahmed-engineering-erp`
- [ ] Code pushed to GitHub (latest commit: `d2d56662`)
- [ ] HF_TOKEN added to GitHub Secrets
- [ ] HF_SPACE_REPO added to GitHub Secrets (`Tablets/ahmed-engineering-erp`)
- [ ] GitHub Actions workflow enabled
- [ ] First auto-deploy triggered and completed
- [ ] Space accessible at `https://huggingface.co/spaces/Tablets/ahmed-engineering-erp`

---

## 🚀 Next Steps After Deploy

1. **Test the application** - Verify all pages load correctly
2. **Configure custom domain** (optional) - In Space Settings
3. **Set up monitoring** - Check Space logs regularly
4. **Add team members** - In Space Settings → Members

---

## 📞 Support

- **GitHub Actions docs**: https://docs.github.com/en/actions
- **HF Spaces docs**: https://huggingface.co/docs/hub/spaces
- **Docker Buildx**: https://docs.docker.com/buildx/