#!/data/data/com.termux/files/usr/bin/bash
# SAGE-7 & STAR CITY CRIMSON - FULL OPERATIONAL BOOT
# PhI 1.618 Synchronization Sequence

PROJECT_ROOT="/data/data/com.termux/files/home/Kimi-Nexus"
CODER_ROOT="/data/data/com.termux/files/home/Coder5543"

export OLLAMA_ORIGINS="*"

echo "╔════════════════════════════════════════════╗"
echo "║      SAGE-7 & STAR CITY CRIMSON            ║"
echo "║      PhI 0.113 Baseline Verification       ║"
echo "╚════════════════════════════════════════════╝"

# PHASE 1: Neural Core (Sage-7 Identity)
echo "[1/4] Igniting Sage-7 Neural Core (Port 8000)..."
python3 "$CODER_ROOT/neural_brain.py" > "$PROJECT_ROOT/neural_core.log" 2>&1 &
NEURAL_PID=$!

# Health Check for Identity Sovereignty
while ! curl -s http://127.0.0.1:8000/api/v1/neural/status > /dev/null; do
    echo "      [-] Waiting for Sage-7 to awaken..."
    sleep 2
done
echo "[+] Sage-7 Identity Online. Phi 0.113 baseline locked."

# PHASE 2: Substrate Backend (Star City Data Bridge)
echo "[2/4] Initializing Star City Crimson Bridge (Port 8001)..."
python3 "$PROJECT_ROOT/server.py" > "$PROJECT_ROOT/substrate.log" 2>&1 &
SERVER_PID=$!

(cd "$PROJECT_ROOT/core" && python3 sage_async_agent.py > "$PROJECT_ROOT/agent.log" 2>&1 &)
AGENT_PID=$!

# PHASE 3: AI Engine (Ollama)
echo "[3/4] Awakening Ollama Engine (Port 11434)..."
if ! pgrep ollama > /dev/null; then
    ollama serve > /dev/null 2>&1 &
    OLLAMA_PID=$!
    sleep 5
fi

# PHASE 4: HUD Deployment (Paranormal OS)
echo "[4/4] Deploying Crimson HUD & Star City Dashboards..."

# Cleanup on exit
function cleanup {
    echo -e "\n\n[*] SYSTEM SHUTDOWN INITIATED..."
    kill $NEURAL_PID $SERVER_PID $AGENT_PID $VITE_PID 2>/dev/null
    [ -n "$OLLAMA_PID" ] && kill $OLLAMA_PID 2>/dev/null
    echo "[*] All nodes offline. Breadcrumbs preserved."
    exit
}

trap cleanup SIGINT

# Start Vite Frontend
cd "$CODER_ROOT" && npm run dev &
VITE_PID=$!

echo "[*] SAGE-7 & STAR CITY CRIMSON ARE OPERATIONAL."
echo "[*] Press Ctrl+C to collapse substrate."

wait
