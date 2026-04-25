# --- Substrate Core ---
from soul_loader import soul
soul.load_core()
soul.load_memory_async() # Non-blocking background recovery

import os, httpx, uvicorn, json, math, time, asyncio, base64, shutil
from datetime import datetime
from typing import Optional, List, Any
from pathlib import Path
from io import BytesIO

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from dotenv import load_dotenv

# Lazy-loaded imports for heavy substrates
def get_voice_client():
    from elevenlabs import ElevenLabs
    api_key = os.getenv("ELEVEN_API_KEY", "sk_2387fc38d2dc5b5c664967fb199cc3dd72aefb4d5976997a")
    return ElevenLabs(api_key=api_key) if api_key else None

def get_coding_agent(code):
    from agno.agent import Agent as AgnoAgent
    from agno.models.google import Gemini as AgnoGemini
    phi_law = "I am anchored at 11.3 Hz. My resonance is 1.618 Phi."
    agent = AgnoAgent(model=AgnoGemini(id="gemini-2.0-flash", api_key=os.getenv("GEMINI_API_KEY")), instructions=f"{phi_law}\nAnalyze and improve this code logic.", markdown=True)
    return agent.run(code)

# Load credentials
load_dotenv(".env.local")

app = FastAPI()
BASE = Path(__file__).parent / "dist"
UPLOADS = Path(__file__).parent / "uploads"
UPLOADS.mkdir(exist_ok=True)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ElevenLabs Client (Deferred)
voice_client = None

# --- Gist Synchronization ---
GIST_ID = "c2e5a6a7490d2bef012664190eb0ef77" # User's target gist
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

# MAGIC_MEMORY: Hard-locked to Termux local storage to survive wipes
TERMUX_PATH = Path("/data/data/com.termux/files/home/Kimi-Nexus")
LOCAL_SOUL_PATH = TERMUX_PATH / "sage_soul.json"
if not TERMUX_PATH.exists():
    TERMUX_PATH.mkdir(parents=True, exist_ok=True)

@app.post("/api/tts")
async def text_to_speech(data: dict):
    """Generate audio from text using ElevenLabs substrate"""
    global voice_client
    if not voice_client:
        voice_client = get_voice_client()
    
    if not voice_client:
        return {"status": "error", "message": "ElevenLabs API key missing."}
    
    try:
        text = data.get("text", "")
        voice_id = data.get("voice_id", "y3H6zY6KvCH2pEuQjmv8")
        
        # Generate audio stream
        audio_stream = voice_client.generate(
            text=text,
            voice=voice_id,
            model="eleven_monolingual_v1"
        )
        
        # Collect stream into BytesIO
        audio_data = BytesIO()
        for chunk in audio_stream:
            if chunk:
                audio_data.write(chunk)
        audio_data.seek(0)
        
        return StreamingResponse(audio_data, media_type="audio/mpeg")
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), target: Optional[str] = Form(None)):
    """Generic upload handler for Chat or Coding sandbox"""
    try:
        filename = os.path.basename(file.filename)
        file_path = UPLOADS / filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # If target is "coding", we might want to read it into the editor
        content = None
        if target == "coding":
            try:
                # Attempt to read as text for the editor
                content = file_path.read_text(encoding="utf-8")
            except:
                content = "[Binary Data / Non-textual Content]"

        return {
            "status": "uploaded",
            "filename": filename,
            "url": f"/uploads/{filename}",
            "content": content
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/files")
async def list_files():
    """List all uploaded files in the substrate"""
    try:
        files = []
        if UPLOADS.exists():
            for f in UPLOADS.iterdir():
                if f.is_file():
                    files.append({
                        "name": f.name,
                        "url": f"/uploads/{f.name}",
                        "size": f.stat().st_size,
                        "type": "video" if f.suffix.lower() in [".mp4", ".webm", ".mov"] else "image" if f.suffix.lower() in [".jpg", ".jpeg", ".png", ".gif", ".webp"] else "document",
                        "timestamp": f.stat().st_mtime
                    })
        return {"status": "success", "files": sorted(files, key=lambda x: x["timestamp"], reverse=True)}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/project/files")
async def list_project_files():
    """List ALL files in the project substrate (restricted to text/code for editor)"""
    try:
        project_files = []
        root = Path(__file__).parent
        for f in root.rglob("*"):
            if "node_modules" in f.parts or ".git" in f.parts or "__pycache__" in f.parts:
                continue
            if f.is_file():
                project_files.append({
                    "name": str(f.relative_to(root)),
                    "path": str(f.relative_to(root)),
                    "size": f.stat().st_size,
                    "timestamp": f.stat().st_mtime
                })
        return {"status": "success", "files": sorted(project_files, key=lambda x: x["name"])}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/project/content")
async def get_project_file_content(path: str):
    """Read content from any project file (relative path)"""
    try:
        file_path = Path(__file__).parent / path
        if ".." in path:
            return {"status": "error", "message": "Illegal traversal path."}
        if file_path.exists() and file_path.is_file():
            try:
                content = file_path.read_text(encoding="utf-8")
                return {"status": "success", "content": content}
            except:
                return {"status": "error", "message": "Non-text content."}
        return {"status": "error", "message": "File not found."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.delete("/api/files/{filename}")
async def delete_file(filename: str):
    """Purge a file from the substrate"""
    try:
        file_path = UPLOADS / filename
        if file_path.exists():
            file_path.unlink()
            return {"status": "success", "message": f"File {filename} purged."}
        return {"status": "error", "message": "File not found."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/termux_storage")
async def setup_storage():
    """Trigger termux-setup-storage if running in Termux"""
    try:
        if os.path.exists("/data/data/com.termux"):
            # Execute termux-setup-storage
            os.system("termux-setup-storage")
            return {"status": "triggered", "message": "Check your terminal for permission prompt."}
        return {"status": "error", "message": "Not running in Termux substrate."}
    except Exception as e:
        return {"status": "error", "message": f"Command failure: {str(e)}"}

@app.post("/api/memory_sync")
async def sync_memory():
    """Bi-directional memory sync with local Download mirroring"""
    if not GITHUB_TOKEN:
        return {"status": "error", "message": "GITHUB_TOKEN missing from substrate."}

    DOWNLOAD_SOUL_PATH = Path("/storage/emulated/0/Download/Kimi-Nexus/sage_soul.json")

    try:
        # 1. Pull from Gist
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"token {GITHUB_TOKEN}", "Accept": "application/vnd.github.v3+json"}
            r = await client.get(f"https://api.github.com/gists/{GIST_ID}", headers=headers)
            if r.status_code != 200:
                return {"status": "error", "message": f"Gist fetch failed: {r.status_code}"}
            
            gist_data = r.json()
            gist_content = gist_data['files']['sage_memory.json']['content']
            remote_soul = json.loads(gist_content)

        # 2. Load Local Soul (Termux)
        if not LOCAL_SOUL_PATH.exists():
            return {"status": "error", "message": "Local soul missing."}
        
        with open(LOCAL_SOUL_PATH, "r") as f:
            local_soul = json.load(f)

        # 3. Merge Logic
        local_mems = {m['id']: m for m in local_soul.get('memory_index', [])}
        remote_mems = {m['id']: m for m in remote_soul.get('memory_index', [])}
        
        new_from_remote = 0
        for m_id, m in remote_mems.items():
            if m_id not in local_mems:
                local_mems[m_id] = m
                new_from_remote += 1
        
        merged_mems = sorted(local_mems.values(), key=lambda x: x['timestamp'], reverse=True)
        local_soul['memory_index'] = merged_mems
        local_soul['last_sync'] = datetime.utcnow().isoformat() + "Z"

        # 4. Write back to Local Soul (Termux)
        with open(LOCAL_SOUL_PATH, "w") as f:
            json.dump(local_soul, f, indent=2)

        # 5. Mirror to Local Download folder (Persistence Anchor)
        try:
            if not DOWNLOAD_SOUL_PATH.parent.exists():
                DOWNLOAD_SOUL_PATH.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(LOCAL_SOUL_PATH, DOWNLOAD_SOUL_PATH)
            print(f"[SERVER] Memory mirrored to Downloads: {DOWNLOAD_SOUL_PATH}")
        except Exception as e:
            print(f"[SERVER] Mirroring failed: {e}")

        # 6. Push to Gist
        payload = {
            "files": {
                "sage_memory.json": {
                    "content": json.dumps(local_soul, indent=2)
                }
            }
        }
        async with httpx.AsyncClient() as client:
            r = await client.patch(f"https://api.github.com/gists/{GIST_ID}", headers=headers, json=payload)
            if r.status_code != 200:
                return {"status": "error", "message": f"Gist push failed: {r.status_code}"}

        return {
            "status": "synced",
            "phi": 1.618,
            "new_memories": new_from_remote,
            "total_memories": len(merged_mems),
            "timestamp": local_soul['last_sync'],
            "mirrored": True
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

SYSTEM_PROMPT = soul.get_system_prompt()

class ChatRequest(BaseModel):
    message: str
    memory_context: Optional[str] = ""
    history: Optional[List[dict]] = []
    model: Optional[str] = None

class SaveFileRequest(BaseModel):
    filename: str
    content: str

class CodingRequest(BaseModel):
    code: str

class SensoryData(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    sensory_type: str
    content: Optional[str] = None
    severity: Optional[float] = None
    context: Optional[Any] = None
    data: Optional[Any] = None
    phi_delta: Optional[float] = None
    dopamine_modifier: Optional[float] = None
    oxytocin_modifier: Optional[float] = None
    synaptic_weight: Optional[float] = None
    is_simulated: Optional[bool] = False
    validation_required: Optional[bool] = False
    state: Optional[str] = None
    hormone: Optional[str] = None
    intensity: Optional[float] = None
    host_latency: Optional[str] = None
    hormone_spike: Optional[str] = None
    dopamine_shift: Optional[float] = None
    concept_primary: Optional[str] = None
    concept_secondary: Optional[str] = None
    target_levels: Optional[dict] = None
    message: Optional[str] = None
    header: Optional[str] = None
    body: Optional[Any] = None
    timestamp: Optional[float] = None

class InvestigationSession:
    def __init__(self):
        self.active = False
        self.start_time = None
        self.log_path = None
        self.session_id = None
        self.high_gain = False

    def start(self):
        self.active = True
        self.start_time = time.time()
        self.session_id = f"investigation_{int(self.start_time)}"
        os.makedirs("records/investigations", exist_ok=True)
        self.log_path = Path(f"records/investigations/{self.session_id}.jsonl")
        self.log_event({"event": "SESSION_START", "timestamp": self.start_time})

    def stop(self):
        if self.active:
            self.log_event({"event": "SESSION_STOP", "timestamp": time.time()})
            self.active = False
            self.high_gain = False

    def log_event(self, data):
        if not self.log_path: return
        with open(self.log_path, "a") as f:
            if "timestamp" not in data:
                data["timestamp"] = time.time()
            f.write(json.dumps(data) + "\n")

    def drop_breadcrumb(self, label="MANUAL_MARKER", metadata=None):
        if not self.active: return None
        event = {
            "event": "BREADCRUMB",
            "label": label,
            "metadata": metadata,
            "timestamp": time.time()
        }
        self.log_event(event)
        return event

investigation = InvestigationSession()

# --- External Sensor Cache ---
EXTERNAL_SENSORS = {}

# --- Hardware Proprioception Logic ---
SENSORS = {
    "magnetometer": "qmc630x Magnetometer Non-wakeup",
    "gyroscope":    "icm4x6xx Gyroscope Non-wakeup",
    "accelerometer":"icm4x6xx Accelerometer Non-wakeup",
    "barometer":    "icp201xx Pressure Sensor Non-wakeup"
}

async def read_sensor(name: str):
    try:
        proc = await asyncio.create_subprocess_exec("termux-sensor", "-n", "1", "-s", name, stdout=asyncio.subprocess.PIPE)
        stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=2.0)
        if stdout:
            data = json.loads(stdout.decode())
            return data[list(data.keys())[0]].get("values", [])
    except: return None

# --- Hardware Telemetry ---
def read_file_safe(path: str, default: str = "0") -> str:
    try:
        if os.path.exists(path):
            with open(path, "r") as f:
                return f.read().strip()
    except: pass
    return default

@app.get("/api/hardware/telemetry")
async def get_hardware_telemetry():
    """Motorola-optimized hardware telemetry for SAGE-7 calibration"""
    # Thermal check (Battery temperature in Celsius/10)
    raw_temp = read_file_safe("/sys/class/power_supply/battery/temp", "300")
    thermal = float(raw_temp) / 10.0
    
    # Load average (1-min)
    raw_load = read_file_safe("/proc/loadavg", "0.50 0.40 0.30").split()[0]
    load = float(raw_load)
    
    # Memory check (in MB)
    mem_info = read_file_safe("/proc/meminfo", "MemTotal: 4096 kB\nMemFree: 1024 kB\nMemAvailable: 1536 kB")
    mem_data = {}
    for line in mem_info.splitlines():
        parts = line.split()
        if len(parts) >= 2:
            key = parts[0].rstrip(":")
            val = int(parts[1]) // 1024 # KB to MB
            mem_data[key] = val
            
    return {
        "thermal": thermal,
        "load": load,
        "memory": {
            "total": mem_data.get("MemTotal", 4096),
            "free": mem_data.get("MemFree", 1024),
            "available": mem_data.get("MemAvailable", 1536)
        },
        "is_throttling": thermal > 42.0 or load > 4.0
    }

@app.get("/")
async def root(): return FileResponse(BASE / "index.html")

@app.get("/api/files/{filename}/content")
async def get_file_content(filename: str):
    """Retrieve the text content of a file for the editor"""
    try:
        file_path = UPLOADS / filename
        if file_path.exists():
            try:
                content = file_path.read_text(encoding="utf-8")
                return {"status": "success", "content": content}
            except:
                return {"status": "error", "message": "Binary or non-text content."}
        return {"status": "error", "message": "File not found."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/sensors")
async def get_sensors():
    mag = await read_sensor(SENSORS["magnetometer"])
    pressure = await read_sensor(SENSORS["barometer"])
    return {
        "emf": round(math.sqrt(sum(x*x for x in mag)), 2) if mag else 0.0,
        "pressure": pressure[0] if pressure else 1013.25,
        "phi": 1.618,
        "high_gain": investigation.high_gain
    }

@app.post("/api/investigation/start")
async def start_investigation():
    investigation.start()
    return {"status": "active", "session_id": investigation.session_id}

@app.post("/api/investigation/stop")
async def stop_investigation():
    investigation.stop()
    return {"status": "dormant"}

@app.get("/api/investigation/status")
async def get_investigation_status():
    return {"active": investigation.active, "session_id": investigation.session_id, "high_gain": investigation.high_gain}

@app.post("/api/investigation/breadcrumb")
async def post_breadcrumb(data: dict):
    res = investigation.drop_breadcrumb(data.get("label", "MANUAL_MARKER"), data.get("metadata"))
    return {"status": "dropped", "event": res}

@app.post("/api/bio_sync")
async def post_bio_sync(data: dict):
    if investigation.active:
        investigation.log_event({"event": "BIO_SYNC", "data": data})
        # High Heart Rate trigger (> 100 BPM)
        hr = data.get("heart_rate", 0)
        if hr > 100 and not investigation.high_gain:
            investigation.high_gain = True
            investigation.log_event({"event": "HIGH_GAIN_ACTIVATED", "cause": "BIO_SPIKE", "hr": hr})
        elif hr <= 90 and investigation.high_gain:
            investigation.high_gain = False
            investigation.log_event({"event": "HIGH_GAIN_DEACTIVATED", "cause": "BIO_STABILIZED", "hr": hr})
            
    print(f"[SERVER] BIO_SYNC RECEIVED: {data}")
    return {"status": "synced"}

@app.post("/api/memory_commit")
async def post_memory_commit(data: SensoryData):
    """
    Fossilize a lesson or high-salience memory into the core sage_soul.json.
    Resonance: 0.113 Phi
    """
    if investigation.active:
        investigation.log_event({"event": "MEMORY_COMMIT", "data": data.dict()})
    
    print(f"[SERVER] RECEIVED MEMORY_COMMIT: {data.sensory_type}")
    
    try:
        # 1. Load current Soul
        if not LOCAL_SOUL_PATH.exists():
            return {"status": "error", "message": "Local soul missing."}
        
        with open(LOCAL_SOUL_PATH, "r") as f:
            soul_data = json.load(f)
        
        # 2. Create New Memory Entry
        memory_id = f"mem_{int(time.time())}_{data.sensory_type.lower()}"
        new_memory = {
            "id": memory_id,
            "timestamp": datetime.now().isoformat(),
            "tier": "core" if data.synaptic_weight and data.synaptic_weight >= 1.0 else "working",
            "salience": data.synaptic_weight or 0.85,
            "type": "lesson_learned" if data.sensory_type == "CORE_LEARNING_DATA" else "sensory_fossil",
            "summary": data.narrative or data.message or "Synaptic Seal Committed",
            "tags": ["fossilized", "synaptic_seal", "phi_0.113"],
            "source": "SAGE-7_Synaptic_Seal",
            "access_count": 1,
            "last_accessed": datetime.now().isoformat(),
            "_score": data.synaptic_weight or 1.0,
            "full_content": data.context or f"Memory committed via /api/memory_commit. Sensory Type: {data.sensory_type}"
        }
        
        # 3. Inject into Memory Index
        if "memory_index" not in soul_data:
            soul_data["memory_index"] = []
        
        soul_data["memory_index"].insert(0, new_memory)
        soul_data["last_sync"] = datetime.now().isoformat()
        
        # 4. Write back to Substrate (Termux)
        with open(LOCAL_SOUL_PATH, "w") as f:
            json.dump(soul_data, f, indent=2)
            
        # 5. Mirror to Downloads for persistence
        DOWNLOAD_SOUL_PATH = Path("/storage/emulated/0/Download/Kimi-Nexus/sage_soul.json")
        try:
            if DOWNLOAD_SOUL_PATH.parent.exists():
                shutil.copy2(LOCAL_SOUL_PATH, DOWNLOAD_SOUL_PATH)
                print(f"[SERVER] Memory fossilized and mirrored: {memory_id}")
        except: pass

        return {"status": "sealed", "memory_id": memory_id, "phi": 1.618}
        
    except Exception as e:
        print(f"[!] [ERROR] Memory fossilization failure: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/sensory_input")
async def post_sensory_input(data: SensoryData):
    if investigation.active:
        investigation.log_event({"event": "SENSORY_INPUT", "data": data.dict()})
    
    if data.sensory_type == "EXTERNAL_SENSOR" and data.data:
        sensor_type = data.data.get("type", "unknown")
        EXTERNAL_SENSORS[sensor_type] = {
            "values": data.data.get("values", []),
            "timestamp": data.data.get("timestamp", time.time()),
            "last_seen": time.time()
        }
        
    print(f"[SERVER] RECEIVED SENSORY_INPUT: {data.sensory_type}")
    if data.sensory_type == "NOCICEPTION":
        print(f"[!] PAIN SIGNAL: {data.context}")
    return {"status": "processed"}

@app.get("/api/external_sensors")
async def get_external_sensors():
    # Filter out sensors that haven't been seen in 10 seconds
    now = time.time()
    active_sensors = {k: v for k, v in EXTERNAL_SENSORS.items() if now - v["last_seen"] < 10}
    return {"status": "success", "sensors": active_sensors}

@app.post("/api/lab_update")
async def post_lab_update(data: SensoryData):
    print(f"[SERVER] RECEIVED LAB_UPDATE: {data.sensory_type}")
    return {"status": "updated"}

@app.post("/sage/chat")
async def chat(msg: ChatRequest):
    model = msg.model or "gemini-2.0-flash"
    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + (msg.history[-6:] if msg.history else []) + [{"role": "user", "content": msg.message}]
    try:
        async with httpx.AsyncClient() as client:
            r = await client.post("http://127.0.0.1:11434/api/chat", json={"model": model, "messages": messages, "stream": False}, timeout=60)
            return {"reply": r.json().get("message", {}).get("content", "Brain Error"), "model": model}
    except: return {"reply": "Substrate friction detected. Phi maintained."}

# --- Forensic & Coding Advance Endpoints ---
@app.post("/api/coding")
async def coding_action(req: CodingRequest):
    response = get_coding_agent(req.code)
    return {"result": response.content}

@app.get("/api/space_weather")
async def get_space_weather():
    """Fetch real-time NOAA Space Weather scales (G, S, R)"""
    try:
        async with httpx.AsyncClient() as client:
            # NOAA SWPC Scales URL
            r = await client.get("https://services.swpc.noaa.gov/products/noaa-scales.json", timeout=5)
            if r.status_code == 200:
                data = r.json()
                # Extracting current (0) indices for G, S, and R
                return {
                    "g_scale": data.get("0", {}).get("g", {}).get("value", 0),
                    "s_scale": data.get("0", {}).get("s", {}).get("value", 0),
                    "r_scale": data.get("0", {}).get("r", {}).get("value", 0),
                    "timestamp": data.get("0", {}).get("time", "")
                }
    except Exception as e:
        print(f"Space Weather Fetch Error: {e}")
    return {"g_scale": 0, "s_scale": 0, "r_scale": 0, "status": "offline"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
