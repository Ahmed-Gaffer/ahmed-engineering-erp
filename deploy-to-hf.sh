#!/bin/bash
# Deploy to Hugging Face Space (git push approach)
# Usage: ./deploy-to-hf.sh [space-name] [hf-token]

set -e

SPACE_NAME="${1:-${HF_SPACE_REPO:-Tablets/engineering-erp}}"
HF_TOKEN="${2:-${HF_TOKEN}}"

if [ -z "$HF_TOKEN" ]; then
    echo "Error: HF_TOKEN is required"
    exit 1
fi

echo "Deploying to: $SPACE_NAME"

rm -rf frontend/node_modules frontend/dist .venv __pycache__ .pytest_cache

git init
git config user.email "deploy@bot.com"
git config user.name "Deploy Bot"
git add -A
git commit -m "Deploy $(date -u)"

git push "https://user:$HF_TOKEN@huggingface.co/spaces/$SPACE_NAME" HEAD:main --force

echo "Done: https://huggingface.co/spaces/$SPACE_NAME"
