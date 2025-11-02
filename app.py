from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import secrets
import string
import time
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # Enable CORS for local development

# In-memory store: {code: {'text': str, 'created_at': datetime, 'expires_at': datetime}}
text_store = {}
MAX_TEXT_SIZE = 5 * 1024  # 5 KB limit
CODE_LENGTH = 6
EXPIRY_HOURS = 1

def generate_code():
    """Generate a random alphanumeric code."""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(CODE_LENGTH))

def cleanup_expired():
    """Remove expired entries from the store."""
    now = datetime.now()
    expired_codes = [
        code for code, data in text_store.items()
        if data['expires_at'] < now
    ]
    for code in expired_codes:
        del text_store[code]

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/receive')
def receive():
    return send_from_directory('.', 'receive.html')

@app.route('/api/send', methods=['POST'])
def send_text():
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        # Validate text
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        if len(text.encode('utf-8')) > MAX_TEXT_SIZE:
            return jsonify({'error': f'Text exceeds maximum size of {MAX_TEXT_SIZE} bytes'}), 400
        
        # Clean up expired entries
        cleanup_expired()
        
        # Generate unique code
        code = generate_code()
        while code in text_store:
            code = generate_code()
        
        # Store text with expiry
        now = datetime.now()
        text_store[code] = {
            'text': text,
            'created_at': now,
            'expires_at': now + timedelta(hours=EXPIRY_HOURS)
        }
        
        # Generate shareable link
        link = request.host_url.rstrip('/') + '/receive?code=' + code
        
        return jsonify({
            'code': code,
            'link': link,
            'expires_at': text_store[code]['expires_at'].isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/receive/<code>', methods=['GET'])
def receive_text(code):
    try:
        # Clean up expired entries
        cleanup_expired()
        
        if code not in text_store:
            return jsonify({'error': 'Code not found or expired'}), 404
        
        data = text_store[code]
        
        # Check if expired (double-check)
        if data['expires_at'] < datetime.now():
            del text_store[code]
            return jsonify({'error': 'Code has expired'}), 404
        
        return jsonify({
            'text': data['text'],
            'created_at': data['created_at'].isoformat(),
            'expires_at': data['expires_at'].isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

