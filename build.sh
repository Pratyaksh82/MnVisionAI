#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "=========================================="
echo " MnVisionAI: Production Build for Render  "
echo "=========================================="

echo ">>> [1/3] Building React Frontend..."
cd frontend
npm install
npm run build
cd ..

echo ">>> [2/3] Installing Python Backend Dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ">>> [3/3] Running Automated Validation Test Suite..."
pytest

echo ">>> MnVisionAI Production Build Completed Successfully!"
