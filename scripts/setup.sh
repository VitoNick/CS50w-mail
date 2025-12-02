#!/usr/bin/env bash
set -euo pipefail

# Create venv if missing
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

# Activate
# shellcheck disable=SC1091
source .venv/bin/activate

# Install deps
python -m pip install --upgrade pip
pip install -r requirements.txt
[ -f "./requirements-dev.txt" ] && pip install -r requirements-dev.txt

echo "Environment setup complete."
