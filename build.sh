#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "=========================================="
echo " MnVisionAI: Production Build for Render  "
echo "=========================================="

echo ">>> [1/3] Preparing React Frontend SPA..."
if [ -d "frontend/dist" ] && [ -f "frontend/dist/index.html" ]; then
  echo ">>> Pre-compiled production React bundle detected in frontend/dist. Skipping NPM build."
else
  echo ">>> Building React frontend from source..."
  cd frontend
  npm install --include=optional
  npm run build
  cd ..
fi

echo ">>> [2/3] Installing Python Backend Dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ">>> [3/3] Running Automated Validation Test Suite..."
pytest

echo ">>> MnVisionAI Production Build Completed Successfully!"
