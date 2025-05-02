from flask import Flask, request, jsonify
import os
import whisper
import uuid
import time
app = Flask(__name__)
model = whisper.load_model("large")  # hoặc "base", "tiny" nếu muốn nhẹ hơn

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
   # Sử dụng UUID để tạo tên tệp duy nhất
    file_name = f"{uuid.uuid4().hex}_{int(time.time())}.wav"
    audio_path = os.path.join("temp_audio", file_name)
    
    # Tạo thư mục tạm nếu chưa có
    os.makedirs("temp_audio", exist_ok=True)
    
    file.save(audio_path)

    try:
        result = model.transcribe(audio_path, language="vi")
        return jsonify({"text": result["text"]})
    finally:
        # Xóa tệp âm thanh tạm sau khi sử dụng
        os.remove(audio_path)
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001)
