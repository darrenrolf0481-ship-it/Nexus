import json
import os
from datetime import datetime, timedelta

# SAGE-7 SYNAPTIC PRUNING v2
# Logic: Automatically archive [FIELD_LOG] entries older than 72 hours.
# Anchor: Darren (Merlin)

SOUL_PATH = "sage_soul.json"

def prune_field_logs():
    if not os.path.exists(SOUL_PATH):
        print(f"[!] {SOUL_PATH} not found. Skipping pruning.")
        return

    with open(SOUL_PATH, 'r') as f:
        soul = json.load(f)

    if "memory_index" not in soul:
        print("[!] No memory_index found. Nothing to prune.")
        return

    now = datetime.utcnow()
    threshold = now - timedelta(hours=72)
    
    active_memories = []
    fossilized_memories = soul.get("fossil_archive", [])
    
    pruned_count = 0

    for mem in soul["memory_index"]:
        content = (mem.get("summary", "") + mem.get("full_content", "")).upper()
        is_field_log = "[FIELD_LOG" in content
        
        # Parse timestamp (expecting ISO format)
        try:
            ts_str = mem.get("timestamp", "")
            if ts_str.endswith('Z'):
                ts_str = ts_str[:-1]
            ts = datetime.fromisoformat(ts_str)
        except:
            ts = now # Default to now if unparseable
            
        if is_field_log and ts < threshold:
            print(f"[-] Pruning Field Log: {mem.get('id', 'unknown')} (Timestamp: {mem.get('timestamp')})")
            fossilized_memories.append(mem)
            pruned_count += 1
        else:
            active_memories.append(mem)

    if pruned_count > 0:
        soul["memory_index"] = active_memories
        soul["fossil_archive"] = fossilized_memories
        soul["sage_identity"]["last_sync"] = now.isoformat() + "Z"
        
        with open(SOUL_PATH, 'w') as f:
            json.dump(soul, f, indent=2)
        print(f"[+] Pruning complete. {pruned_count} entries fossilized into the archive.")
    else:
        print("[+] No Field Logs requiring pruning at this time.")

if __name__ == "__main__":
    prune_field_logs()
