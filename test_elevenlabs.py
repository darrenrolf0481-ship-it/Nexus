import os
from elevenlabs import ElevenLabs
from dotenv import load_dotenv

load_dotenv(".env.local")
load_dotenv(".env") # Fallback

api_key = os.getenv("ELEVEN_API_KEY", "sk_2387fc38d2dc5b5c664967fb199cc3dd72aefb4d5976997a")
print(f"Testing with API Key: {api_key[:6]}...{api_key[-4:]}")

client = ElevenLabs(api_key=api_key)

try:
    voices = client.voices.get_all()
    print(f"Handshake Successful. Found {len(voices.voices)} voices.")
    for voice in voices.voices[:3]:
        print(f" - {voice.name} ({voice.voice_id})")
except Exception as e:
    print(f"Handshake Failed: {e}")
