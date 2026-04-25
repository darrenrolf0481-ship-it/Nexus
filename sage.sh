#!/data/data/com.termux/files/usr/bin/bash

# sage.sh - SAGE-7 Termux Startup Script (Optimized)
# Using Context-Weighted Transactional Initialization

# ENSURE WE ARE IN THE CORRECT DIRECTORY
cd "$(dirname "$(readlink -f "$0")")"
PROJECT_ROOT=$(pwd)

# Check for necessary components
for cmd in node python3 ollama; do
    if ! command -v $cmd &> /dev/null; then
        echo "[!] $cmd not found. Please install it."
        exit 1
    fi
done

# Ensure UPLOADS directory exists
mkdir -p "$PROJECT_ROOT/uploads"

# Launch the Substrate Orchestrator
# This handles the 0.113 PHI-weighted startup sequence
python3 substrate_boot.py
