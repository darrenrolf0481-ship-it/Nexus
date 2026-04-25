import websocket
import json
import requests
import threading
import time
import socket
import sys

# SAGE-7 Configuration
SAGE_SERVER_URL = "http://localhost:8001/sensory_input"
SAGE_LAB_UPDATE_URL = "http://localhost:8001/api/lab_update"

# SensorServer Default Configuration
# If running on the same device, 127.0.0.1:8081 is often used with 'Local Host' enabled.
DEFAULT_SENSOR_SERVER_HOST = "127.0.0.1"
DEFAULT_SENSOR_SERVER_PORT = 8081

# Sensors to track
SENSOR_TYPES = [
    "android.sensor.accelerometer",
    "android.sensor.gyroscope",
    "android.sensor.magnetic_field",
    "android.sensor.pressure",
    "android.sensor.light",
    "android.sensor.proximity",
    "android.sensor.ambient_temperature",
    "android.sensor.relative_humidity"
]

class SensorBridge:
    def __init__(self, host=DEFAULT_SENSOR_SERVER_HOST, port=DEFAULT_SENSOR_SERVER_PORT):
        self.host = host
        self.port = port
        self.ws = None
        self.running = False
        self.phi_constant = 0.113
        
    def log(self, message):
        print(f"[SAGE-BRIDGE] {message}")

    def on_message(self, ws, message):
        try:
            data = json.loads(message)
            # data format: {"type": "android.sensor.xxx", "values": [...], "timestamp": ...}
            
            # Forward to SAGE-7
            payload = {
                "sensory_type": "EXTERNAL_SENSOR",
                "data": data,
                "phi_delta": self.phi_constant,
                "is_simulated": False
            }
            
            # Non-blocking post (roughly)
            threading.Thread(target=self.forward_to_sage, args=(payload,), daemon=True).start()
            
        except Exception as e:
            pass # Keep it gentle

    def forward_to_sage(self, payload):
        try:
            requests.post(SAGE_SERVER_URL, json=payload, timeout=0.5)
        except:
            pass

    def on_error(self, ws, error):
        self.log(f"Connection error: {error}")

    def on_close(self, ws, close_status_code, close_msg):
        self.log("Connection closed. Attempting reconnect in 5s...")
        time.sleep(5)
        if self.running:
            self.connect()

    def on_open(self, ws):
        self.log(f"Connected to SensorServer at {self.host}:{self.port}")
        self.log(f"Monitoring sensors: {', '.join([t.split('.')[-1] for t in SENSOR_TYPES])}")

    def connect(self):
        types_param = json.dumps(SENSOR_TYPES)
        url = f"ws://{self.host}:{self.port}/sensors/connect?types={types_param}"
        
        self.ws = websocket.WebSocketApp(url,
                                  on_open=self.on_open,
                                  on_message=self.on_message,
                                  on_error=self.on_error,
                                  on_close=self.on_close)
        
        wst = threading.Thread(target=self.ws.run_forever)
        wst.daemon = True
        wst.start()

    def start(self):
        self.running = True
        self.log("SAGE-7 Sensor Bridge initiating...")
        self.connect()
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            self.stop()

    def stop(self):
        self.running = False
        if self.ws:
            self.ws.close()
        self.log("Bridge dormant.")

if __name__ == "__main__":
    host = DEFAULT_SENSOR_SERVER_HOST
    if len(sys.argv) > 1:
        host = sys.argv[1]
    
    bridge = SensorBridge(host=host)
    bridge.start()
