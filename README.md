# Send Anywhere - Text Sharing Web App

A simple web application that allows users to send text blocks across devices using short codes or shareable links. Built with Flask (Python) backend and vanilla HTML/CSS/JavaScript frontend.

## Features

- **Send text**: Enter text and get a 6-character code and shareable link
- **Receive text**: Enter code or open link to view shared text
- **Secure codes**: Randomly generated alphanumeric codes (6 characters)
- **Auto-expiry**: Text expires after 1 hour
- **Size limit**: Maximum 5 KB text size
- **Clean UI**: Modern, responsive design

## Requirements

- Python 3.7+
- pip (Python package manager)

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

1. Start the Flask server:
```bash
python app.py
```

2. Open your browser and navigate to:
```
http://localhost:5000
```

The application will be available at:
- **Send page**: `http://localhost:5000/`
- **Receive page**: `http://localhost:5000/receive`

## API Endpoints

### POST /api/send
Send text and receive a code and link.

**Request:**
```bash
curl -X POST http://localhost:5000/api/send \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, world!"}'
```

**Response:**
```json
{
  "code": "A1B2C3",
  "link": "http://localhost:5000/receive?code=A1B2C3",
  "expires_at": "2024-01-01T12:00:00"
}
```

### GET /api/receive/<code>
Retrieve text using a code.

**Request:**
```bash
curl http://localhost:5000/api/receive/A1B2C3
```

**Response:**
```json
{
  "text": "Hello, world!",
  "created_at": "2024-01-01T11:00:00",
  "expires_at": "2024-01-01T12:00:00"
}
```

**Error Response (code not found or expired):**
```json
{
  "error": "Code not found or expired"
}
```

## Usage Examples

### Example 1: Send and receive via API
```bash
# Send text
RESPONSE=$(curl -X POST http://localhost:5000/api/send \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a test message"}')

# Extract code from response (requires jq)
CODE=$(echo $RESPONSE | jq -r '.code')
echo "Code: $CODE"

# Receive text using code
curl http://localhost:5000/api/receive/$CODE
```

### Example 2: Send text via web interface
1. Open `http://localhost:5000` in your browser
2. Enter text in the textarea
3. Click "Send"
4. Copy the generated code or shareable link
5. Open the link on another device or share the code

### Example 3: Receive text via web interface
1. Open `http://localhost:5000/receive` in your browser
2. Enter the 6-character code
3. Click "Receive" to view the text
   - Or open a shareable link directly (code is auto-filled from URL)

## Security Features

- **Unguessable codes**: Generated using `secrets` module for cryptographic randomness
- **Text size limit**: Maximum 5 KB per message
- **Auto-expiry**: Messages automatically deleted after 1 hour
- **CORS enabled**: For local development (can be configured for production)

## Technical Details

- **Backend**: Flask with in-memory storage
- **Frontend**: Vanilla JavaScript, no frameworks
- **Storage**: In-memory dictionary (data is lost on server restart)
- **Code format**: 6-character alphanumeric (A-Z, a-z, 0-9)
- **Expiry**: 1 hour from creation

## Notes

- Data is stored in memory and will be lost when the server restarts
- For production use, consider using a database (Redis, PostgreSQL, etc.)
- The application is configured to run on all network interfaces (`0.0.0.0`) for local network access

## Troubleshooting

**Port already in use:**
- Change the port in `app.py` (line: `app.run(debug=True, host='0.0.0.0', port=5000)`)
- Or stop the process using port 5000

**CORS errors:**
- CORS is enabled by default. If issues persist, check firewall settings.

**Code not found:**
- Codes expire after 1 hour
- Ensure you're using the correct code
- Check that the server is running

## License

This project is provided as-is for educational purposes.

