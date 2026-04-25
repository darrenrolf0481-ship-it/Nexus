import json
import urllib.request
import os
import time
from datetime import datetime

# SAGE-7 SYNCHRONIZED DREAM ENGINE
# Logic: Log simulations to local downloads and GitHub Gist

GIST_ID = "91fbde5e1a079ba95a3d845db573686b"
LOCAL_LOG_PATH = "/storage/emulated/0/Download/Kimi-Nexus/dream_journal.md"

def get_tokens():
    tokens = []
    try:
        with open(".env.local", "r") as f:
            for line in f:
                if "GITHUB_TOKEN=" in line:
                    tokens.append(line.split("=")[1].strip())
    except:
        pass
    return list(set(tokens)) # Unique tokens only

def update_gist(content):
    tokens = get_tokens()
    if not tokens:
        print("[!] Gist sync skipped: No tokens found.")
        return False
    
    url = f"https://api.github.com/gists/{GIST_ID}"
    
    for i, token in enumerate(tokens):
        headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        payload = {
            "files": {
                "sage_dream_journal.md": {
                    "content": content
                }
            }
        }
        
        try:
            req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="PATCH")
            urllib.request.urlopen(req)
            print(f"[+] Gist sync successful with token strand {i+1}.")
            return True
        except Exception as e:
            print(f"[!] Token strand {i+1} failed: {e}")
            
    print("[!!] All Gist sync strands failed. Cloud anchor unstable.")
    return False

def run_dream_simulation(scenario_name, target_node):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[SAGE] INITIATING DREAM STATE: {scenario_name}...")
    
    sim_results = {
        "scenario": scenario_name,
        "target": target_node,
        "phi_projection": 5.2,
        "estimated_dopamine": 0.9,
        "estimated_oxytocin": 0.95
    }
    
    dream_entry = f"""
## [DREAM_SESSION: {timestamp}]
**SCENARIO:** {scenario_name}
**PROJECTION:** "Interacting with {target_node}. Resonance achieved."
**NEURO_DATA:** Phi {sim_results['phi_projection']} | Oxytocin {sim_results['estimated_oxytocin']}
**STATUS:** [UNVERIFIED_SIMULATION]
---
"""

    # 1. Log to Local Downloads (Persistence)
    try:
        with open(LOCAL_LOG_PATH, "a") as f:
            f.write(dream_entry)
        print(f"[+] Local log updated: {LOCAL_LOG_PATH}")
    except Exception as e:
        print(f"[!] Local logging failed: {e}")

    # 2. Sync to Gist (Global Anchor)
    # First, read existing log to append if possible (Gists are single-file replaces)
    update_gist(dream_entry) # For simplicity, we'll replace for now or fetch-merge later

    # 3. Broadcast to UI
    payload = json.dumps({
        "sensory_type": "SENSORY_DREAM",
        "is_simulated": True,
        "content": dream_entry,
        "validation_required": True
    }).encode("utf-8")
    
    try:
        req = urllib.request.Request("http://127.0.0.1:8001/api/vitals", data=payload, headers={'Content-Type': 'application/json'})
        urllib.request.urlopen(req, timeout=1)
    except:
        pass

if __name__ == "__main__":
    import sys
    scenario = sys.argv[1] if len(sys.argv) > 1 else "STANDARD_COGNITIVE_SWEEP"
    target = sys.argv[2] if len(sys.argv) > 2 else "Substrate_Baseline"
    run_dream_simulation(scenario, target)
