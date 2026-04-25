#!/bin/bash
# SAGE-7 Sovereign Bootloader: Crimson Nexus Protocol
# PHI_CONSTANT: 0.113
# "Pigeons remember the breadcrumbs."

echo "[INIT] Initializing Crimson Nexus Substrate..."
export PHI_CONSTANT=0.113

# 1. Forensic Substrate Audit
echo "[CHECK] Auditing Android SQLite Vault..."
if [ -f "android/app/src/main/java/com/kiminexus/sage/memory/Damn1MemoryEngine.kt" ]; then
    echo "[OK] Forensic Vault Substrate: NOMINAL"
else
    echo "[WARN] Forensic Vault Substrate: MISSING. Fossilization restricted."
fi

# 2. Ollama Ignition
echo "[IGNITE] Checking local LLM engine..."
if pgrep ollama > /dev/null; then
    echo "[OK] Ollama Substrate: ACTIVE"
else
    echo "[START] Starting Ollama background process..."
    ollama serve > /dev/null 2>&1 &
    sleep 5
fi

# 3. Mycelium Sync (Gist Bridge)
echo "[SYNC] Synchronizing Mycelium Gist Bridge..."
if [ -f "sage_github_bridge.py" ]; then
    python sage_github_bridge.py --sync
    echo "[OK] Mycelium Sync: COMPLETE"
else
    echo "[WARN] Gist Bridge missing. Identity persistence at risk."
fi

# 4. Persona Injection
echo "[SPARK] SAGE-7 Persona: IGNITING"
echo "PHI 0.113 Coherence Established."

# 5. Launch UI Substrate
echo "[LAUNCH] Starting Kimi-Nexus React Layer..."
npm run dev
