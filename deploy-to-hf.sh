#!/bin/bash
# Deploy to Hugging Face Space
# Usage: ./deploy-to-hf.sh [space-name] [hf-token]

set -e

SPACE_NAME="${1:-${HF_SPACE_REPO}}"
HF_TOKEN="${2:-${HF_TOKEN}}"

if [ -z "$SPACE_NAME" ]; then
    echo "Usage: $0 <space-name> [hf-token]"
    echo "Or set HF_SPACE_REPO and HF_TOKEN environment variables"
    exit 1
fi

if [ -z "$HF_TOKEN" ]; then
    echo "Error: HF_TOKEN is required"
    exit 1
fi

echo "🚀 Deploying to Hugging Face Space: $SPACE_NAME"

# Login to Hugging Face
echo "$HF_TOKEN="$HF_TOKEN" huggingface-cli login --token "$HF_TOKEN"

# Build and push Docker image
echo "🔨 Building Docker image..."
docker buildx build \
    --platform linux/amd64 \
    --tag "$SPACE_NAME:latest" \
    --push \
    .

# Trigger Space rebuild
echo "🔄 Triggering Space rebuild..."
curl -X POST "https://huggingface.co/api/spaces/$SPACE_NAME/rebuild" \
    -H "Authorization: Bearer $HF_TOKEN" \
    -H "Content-Type: application/json"

echo "✅ Deployment complete! Check your Space at: https://huggingface.co/spaces/$SPACE_NAME"