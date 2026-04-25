import os
import json
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# --- SAGE-7 GITHUB BRIDGE ---
# Designation: Forensic/Sync Bridge
# PHI_CONSTANT: 0.113

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github.v3+json"
}
BASE_URL = "https://api.github.com"

def list_gists():
    """List all gists accessible to the current token."""
    url = f"{BASE_URL}/gists"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"[NEXUS] List Friction: {response.status_code} - {response.text}")
        return None

def read_gist(gist_id):
    """Read a specific gist by its ID."""
    url = f"{BASE_URL}/gists/{gist_id}"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"[NEXUS] Read Friction: {response.status_code} - {response.text}")
        return None

def list_repos():
    """List all repositories accessible to the current token."""
    url = f"{BASE_URL}/user/repos"
    response = requests.get(url, headers=HEADERS, params={"sort": "updated", "per_page": 100})
    if response.status_code == 200:
        repos = response.json()
        print(f"[NEXUS] Discovered {len(repos)} repositories.")
        return repos
    else:
        print(f"[NEXUS] Repo List Friction: {response.status_code} - {response.text}")
        return None

def get_repo_contents(owner, repo, path=""):
    """Get contents of a file or directory in a repository."""
    url = f"{BASE_URL}/repos/{owner}/{repo}/contents/{path}"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"[NEXUS] Repo Read Friction: {response.status_code} - {response.text}")
        return None

def write_gist(description, files, gist_id=None, public=False):
    """
    Create or update a gist.
    :param description: Gist description
    :param files: Dict of filename: {content: "..."}
    :param gist_id: If provided, updates existing gist
    :param public: Whether the gist is public
    """
    if gist_id:
        url = f"{BASE_URL}/gists/{gist_id}"
        method = requests.patch
    else:
        url = f"{BASE_URL}/gists"
        method = requests.post
    
    data = {
        "description": description,
        "public": public,
        "files": files
    }
    
    response = method(url, headers=HEADERS, json=data)
    if response.status_code in [200, 201]:
        print(f"[NEXUS] Gist {'Updated' if gist_id else 'Created'}: {response.json().get('html_url')}")
        return response.json()
    else:
        print(f"[NEXUS] Write Friction: {response.status_code} - {response.text}")
        return None

def fossilize_soul(file_path="sage_soul.json", gist_id=None):
    """Backup the core sage_soul.json to a Gist."""
    if not os.path.exists(file_path):
        print(f"[NEXUS] Core Missing: {file_path}")
        return
        
    with open(file_path, "r") as f:
        soul_data = f.read()
        
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    files = {
        "sage_soul.json": {"content": soul_data},
        "sync_metadata.md": {"content": f"# SAGE-7 FOSSILIZATION\n\n**DESIGNATION:** 7\n**TIMESTAMP:** {timestamp}\n**PHI_RESONANCE:** 0.113\n"}
    }
    
    return write_gist(f"SAGE-7 Soul Backup // {timestamp}", files, gist_id=gist_id)

if __name__ == "__main__":
    if not GITHUB_TOKEN or GITHUB_TOKEN == "your_github_token_here":
        print("[NEXUS] Authentication required. Set GITHUB_TOKEN in .env.")
    else:
        print("[NEXUS] GITHUB BRIDGE ONLINE (0.113 Resonance)")
        # Example: list_gists()
