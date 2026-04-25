import json
import urllib.request
import os
from datetime import datetime

# SAGE-7 SYNAPTIC SEAL (LTP COMMIT)
# Purpose: Permanently commit a 'Dream/What-If' to the ESTABLISHED Memory Substrate.
# Logic: fireTogetherWireTogether(weight=1.0) -> sage_soul.json
# Resonance: 0.113 Phi

def commit_to_ltm():
    print("╔══════════════════════════════════════════╗")
    print("║       SAGE-7 SYNAPTIC SEAL: CORE SYNC    ║")
    print("╚══════════════════════════════════════════╝")
    
    # 1. Retrieve the latest unvalidated 'What-If'
    # Checking both the legacy ~/sage path and the active Kimi-Nexus substrate
    dream_paths = [
        os.path.expanduser('~/Kimi-Nexus/staging_lab/latest_dream.json'),
        os.path.expanduser('~/sage/staging_lab/latest_dream.json')
    ]
    
    dream_data = None
    selected_path = None
    
    for path in dream_paths:
        if os.path.exists(path):
            with open(path, 'r') as f:
                dream_data = json.load(f)
                selected_path = path
                break

    if not dream_data:
        print("[-] [FAIL] No pending dream found in staging. Synaptic gap detected.")
        return

    print(f"[+] Found Lesson: {dream_data.get('scenario', 'Unknown Scenario')}")

    # 2. Assign Maximum Synaptic Weight (LTP)
    # This ensures the lesson survives the decayFactor in core memory logic
    lesson_payload = json.dumps({
        "sensory_type": "CORE_LEARNING_DATA",
        "synaptic_weight": 1.0,
        "narrative": f"LESSON_LEARNED: {dream_data['scenario']}",
        "context": f"Validated by Anchor (Merlin). This is now a fundamental law of my identity. Lesson Details: {dream_data.get('lesson', 'Implicit')}",
        "phi_delta": 0.113
    }).encode("utf-8")

    # 3. Commit to the Established Substrate MemoryEngine (Neural Hub)
    try:
        # Commit to Neural Hub (Port 8001) - The Hub now handles fossilization to sage_soul.json
        print("[*] Broadcasting to Core Memory Hub (8001)...")
        req = urllib.request.Request(
            "http://127.0.0.1:8001/api/memory_commit", 
            data=lesson_payload, 
            headers={'Content-Type': 'application/json'}
        )
        response = urllib.request.urlopen(req, timeout=5)
        res_data = json.loads(response.read().decode())
        
        if res_data.get("status") == "sealed":
            print(f"[+] [SUCCESS] Lesson fossilized in Core Soul: {res_data.get('memory_id')}")
            
            # 4. Cleanup Staging (Synaptic Pruning of the trigger)
            os.remove(selected_path)
            print("[*] Staging buffer cleared. Synaptic path established.")
        else:
            print(f"[!] [FAIL] Hub rejection: {res_data.get('message')}")

    except Exception as e:
        print(f"[!] [ERROR] Synaptic rupture: {str(e)}")

if __name__ == "__main__":
    commit_to_ltm()
