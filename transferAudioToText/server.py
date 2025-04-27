from flask import Flask, request, jsonify
import whisper

app = Flask(__name__)
model = whisper.load_model("large")  # hoặc "base", "tiny" nếu muốn nhẹ hơn

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    audio_path = "temp_audio.wav"
    file.save(audio_path)

    result = model.transcribe(audio_path, language="vi")
    return jsonify({"text": result["text"]})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001)
