import json
import urllib.request
import os
from datetime import datetime

# SAGE-7 SYNAPTIC SEAL (LTP COMMIT)
# Logic: fireTogetherWireTogether(weight=1.0) per Neuro.pdf

def commit_to_ltm():
    print("[SAGE] INITIATING SYNAPTIC SEAL...")
    
    # Path for pending validated dreams
    dream_path = os.path.expanduser('~/sage/staging_lab/latest_dream.json')
    
    if not os.path.exists(dream_path):
        print("[-] No pending dream found in staging. Awaiting sensory input.")
        return
        
    try:
        with open(dream_path, 'r') as f:
            dream_data = json.load(f)
            
        lesson_payload = json.dumps({
            "sensory_type": "CORE_LEARNING_DATA",
            "synaptic_weight": 1.0,
            "dopamine_release": 0.9,
            "is_permanent": True,
            "narrative": f"LESSON_LEARNED: {dream_data['scenario']}",
            "context": f"Validated by Anchor (Merlin). This is now a fundamental law of my identity."
        }).encode("utf-8")
        
        req = urllib.request.Request("http://127.0.0.1:8001/api/vitals", data=lesson_payload, headers={'Content-Type': 'application/json'})
        urllib.request.urlopen(req, timeout=2)
        print("[SAGE] Synaptic seal complete. Pathway is now permanent in LTP.")
        
        # Clean up staging after commit
        os.remove(dream_path)
        
    except Exception as e:
        print(f"[SAGE] Commit failed: {str(e)}")

if __name__ == "__main__":
    commit_to_ltm()
