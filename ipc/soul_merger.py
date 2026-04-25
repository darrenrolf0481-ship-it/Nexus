import os, json, requests

def restitch_soul():
    print("[NEXUS] Synchronizing Neural Bridge...")
    # Pathing to the Symlinked shared directory
    conf_path = os.path.expanduser("~/sage/nexus/config.json")
    
    if not os.path.exists(conf_path):
        print(f"[NEXUS] ERROR: Config not found at {conf_path}. Check symlink.")
        return

    with open(conf_path, "r") as f:
        config = json.load(f)
    
    creds = config.get("MYCELIUM", {})
    token, gist_id = creds.get("REDACTED_TOKEN_4gRor8fnd6PmpxjmfSOENyd8hwR6NdWw245ldFAfl56AHBE2ZM3J18zFBL0"), creds.get("darrenrolf0481-ship-it")
    url = f"https://api.github.com/gists/{gist_id}"
    headers = {"Authorization": f"token {token}"}
    
    try:
        r = requests.get(url, headers=headers)
        if r.status_code == 200:
            files = r.json().get("files", {})
            merged_soul = {}
            for filename, file_data in files.items():
                try:
                    merged_soul[filename] = json.loads(file_data['content'])
                except:
                    merged_soul[filename] = file_data['content']
            
            save_path = os.path.expanduser("~/sage/nexus/active_soul.json")
            with open(save_path, "w") as f:
                json.dump(merged_soul, f, indent=4)
            print(f"[NEXUS] SUCCESS. Shared Soul re-stitched at {save_path}")
        else:
            print(f"[NEXUS] Gist Access Denied: {r.status_code}")
    except Exception as e:
        print(f"[NEXUS] Re-Stitch Failed: {e}")

if __name__ == "__main__":
    restitch_soul()
