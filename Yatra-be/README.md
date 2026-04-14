# YatraAI Scout Pro — Backend

> Flask-based ML API for real-time Indian heritage landmark identification using a TensorFlow computer vision model.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Server | Flask 3.0 + Python 3.10+ |
| ML Model | TensorFlow (CNN — Indian heritage monuments) |
| Image Processing | Pillow + NumPy |
| CORS | Flask-Cors |
| Production | Gunicorn (WSGI) |

---

## Prerequisites

- **Python** 3.10 or higher — [Download](https://www.python.org/downloads/)
- **pip** (comes with Python)
- ~2 GB disk space for TensorFlow installation

> **Windows users:** Use Anaconda/Miniconda for the cleanest TensorFlow experience.

---

## 1. Clone the Repository

```bash
git clone https://github.com/AI-Mercenary/yatra-ai-backend.git
cd yatra-ai-backend
```

---

## 2. Create a Virtual Environment

```bash
# Using Python venv
python -m venv venv

# Activate on Windows
venv\Scripts\activate

# Activate on macOS/Linux
source venv/bin/activate
```

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

> **Note on TensorFlow:** If you get a TensorFlow compatibility error, use the CPU-only build:
> ```bash
> pip install tensorflow-cpu
> ```

---

## 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=any_long_random_string_here

# API Keys
GROQ_API_KEY=gsk_your_groq_key_here

# ML Model Config
LOCAL_MODEL_MIN_CONFIDENCE=0.8
```

---

## 5. Run the Development Server

```bash
python app.py
```

The backend will start on:
```
http://127.0.0.1:5001
```

You should see:
```
 * Running on http://127.0.0.1:5001
 * Debug mode: on
```

---

## 6. Verify It's Working

Open a browser or use curl:

```bash
curl http://127.0.0.1:5001/
```

To test the landmark prediction endpoint:

```bash
curl -X POST http://127.0.0.1:5001/predict \
  -F "image=@/path/to/your/monument.jpg"
```

Expected response:
```json
{
  "landmark": "Taj Mahal",
  "confidence": 0.97,
  "location": "Agra, Uttar Pradesh"
}
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/predict` | Identify landmark from image upload |

### POST `/predict`

**Request:** `multipart/form-data`
- `image` — JPEG/PNG image file of a monument

**Response:**
```json
{
  "landmark": "string",
  "confidence": 0.0–1.0,
  "location": "string"
}
```

---

## CORS Configuration

The backend is configured to accept requests from the frontend at:
- `http://localhost:8080` (Vite dev server)

If you deploy the frontend to a different domain, update the CORS origin in `yatraai/routes.py`.

---

## Running in Production (Gunicorn)

```bash
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

---

## Project Structure

```
backend/
├── app.py                  # Entry point
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (not committed)
├── .env.example            # Template for env setup
├── data/
│   └── class_names.json    # 50 Indian monument class labels
├── tfjs_model/             # TensorFlow model weights
│   ├── model.json
│   └── group1-shard*.bin
└── yatraai/
    ├── __init__.py         # Flask app factory
    ├── config.py           # Configuration loader
    ├── prediction.py       # ML inference logic
    └── routes.py           # API route definitions
```

---

## Supported Landmarks (50 Classes)

The model is trained to identify 50 Indian heritage monuments including:

- Taj Mahal, Agra
- Red Fort, Delhi
- Qutub Minar, Delhi
- India Gate, Delhi
- Hawa Mahal, Jaipur
- Mysore Palace
- Charminar, Hyderabad
- Gateway of India, Mumbai
- Konark Sun Temple, Odisha
- Meenakshi Temple, Madurai
- *(and 40 more)*

---

## Common Issues

| Problem | Fix |
|---|---|
| `ModuleNotFoundError: tensorflow` | Run `pip install tensorflow-cpu` |
| Port 5001 already in use | Kill the process: `netstat -ano \| findstr :5001` then `taskkill /PID <pid> /F` |
| `CORS` blocked by browser | Ensure frontend is on `localhost:8080` |
| Low confidence predictions | Use a clear, well-lit photo of the monument facade |
| Model not loading | Check `tfjs_model/` folder has all `.bin` shard files |

---

## License

MIT © YatraAI Team
