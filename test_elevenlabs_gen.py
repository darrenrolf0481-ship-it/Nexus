import os
from elevenlabs import ElevenLabs
from dotenv import load_dotenv

load_dotenv(".env.local")
load_dotenv(".env")

api_key = os.getenv("ELEVEN_API_KEY", "sk_2387fc38d2dc5b5c664967fb199cc3dd72aefb4d5976997a")
client = ElevenLabs(api_key=api_key)

try:
    print("Testing audio generation...")
    # Testing simplified generate if it exists
    audio_stream = client.generate(
        text="Vocalic substrate initialized. PHI 0.113.",
        voice="y3H6zY6KvCH2pEuQjmv8", # Sage Voice ID from code
        model="eleven_monolingual_v1"
    )
    print("Stream generated successfully.")
    
    # Check if it's an iterator
    chunk = next(audio_stream)
    print(f"Received first chunk of size: {len(chunk)} bytes")
except Exception as e:
    print(f"Generation Failed: {e}")
    print("Attempting fallback to convert() method...")
    try:
        response = client.text_to_speech.convert(
            voice_id="y3H6zY6KvCH2pEuQjmv8",
            text="Vocalic substrate initialized. PHI 0.113.",
            model_id="eleven_monolingual_v1"
        )
        print("Convert() successful.")
        chunk = next(response)
        print(f"Received first chunk via convert() of size: {len(chunk)} bytes")
    except Exception as e2:
        print(f"Fallback Failed: {e2}")
