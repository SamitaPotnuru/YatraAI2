@echo off
echo Starting YatraAI Backend...
start cmd /k "cd Yatra-be && .\venv\Scripts\python app.py"

echo Starting YatraAI Frontend...
start cmd /k "cd Yatra-fe\yatraai-scout-main && npm run dev"

echo Both servers are starting in separate windows.
pause
