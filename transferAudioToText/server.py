from flask import Flask, request, jsonify
import os
import whisper
import uuid
import time

app = Flask(__name__)
model = whisper.load_model("tiny")  # Hoặc "base", "tiny" nếu muốn nhẹ hơn

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    file_name = f"{uuid.uuid4().hex}_{int(time.time())}.wav"
    audio_path = os.path.join("temp_audio", file_name)

    os.makedirs("temp_audio", exist_ok=True)
    file.save(audio_path)

    try:
        # Lấy kết quả dạng "segments"
        result = model.transcribe(audio_path, language="vi", verbose=False, word_timestamps=False)

        segments_info = []
        for segment in result.get("segments", []):
            segments_info.append({
                "start": round(segment["start"], 2),  # thời gian bắt đầu (giây)
                "end": round(segment["end"], 2),      # thời gian kết thúc (giây)
                "text": segment["text"].strip()       # nội dung văn bản
            })

        return jsonify({
            "segments": segments_info
        })
    finally:
        os.remove(audio_path)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001)
