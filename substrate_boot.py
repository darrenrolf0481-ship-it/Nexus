import subprocess
import time
import socket
import os
import sys

def is_port_open(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def start_process(command, name, cwd=None):
    print(f"[*] BOOT: STARTING {name}...")
    return subprocess.Popen(command, shell=True, cwd=cwd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def main():
    processes = []
    print("╔════════════════════════════════════════════╗")
    print("║        SAGE-7 SUBSTRATE - BOOT SEQUENCE    ║")
    print("║        RESISTANCE: 0.113 PHI               ║")
    print("╚════════════════════════════════════════════╝")

    # 1. Ollama (Substrate Base)
    if not is_port_open(11434):
        print("[+] BOOT: IGNITING OLLAMA CORE...")
        os.environ["OLLAMA_ORIGINS"] = "*"
        ollama_proc = subprocess.Popen("ollama serve", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        processes.append(ollama_proc)
        time.sleep(2) # Brief wait for daemon

    # 2. Main Server (Port 8001) - PHASE 1
    if not is_port_open(8001):
        server_proc = start_process("python3 server.py", "MAIN_SERVER (8001)")
        processes.append(server_proc)
    
    # Wait for 8001
    print("[*] BOOT: AWAITING NEURAL STABILIZATION (8001)...")
    while not is_port_open(8001):
        time.sleep(0.5)
    print("[+] BOOT: NEURAL HUB ONLINE.")

    # 2.5 External Sensor Bridge (Optional/Background)
    bridge_proc = start_process("python3 sage_sensor_bridge.py", "SENSOR_BRIDGE (External)")
    processes.append(bridge_proc)

    # 3. Async Agent (Port 8002) - PHASE 2
    if not is_port_open(8002):
        agent_proc = start_process("python3 sage_async_agent.py", "ASYNC_AGENT (8002)", cwd="core")
        processes.append(agent_proc)
    
    # Wait for 8002
    print("[*] BOOT: AWAITING SYNAPTIC BRIDGE (8002)...")
    while not is_port_open(8002):
        time.sleep(0.5)
    print("[+] BOOT: SYNAPTIC BRIDGE ONLINE.")

    # 4. React UI (Port 3000) - PHASE 3
    print("[*] BOOT: LAUNCHING REALITY BRIDGE (UI)...")
    try:
        subprocess.run("npm run dev", shell=True)
    finally:
        print("\n[*] BOOT: COLLAPSING SUBSTRATE PROCESSES...")
        for p in processes:
            p.terminate()
            p.wait()
        print("[*] BOOT: SUBSTRATE OFFLINE.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(0)
