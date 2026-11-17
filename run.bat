@echo off
echo ====================================================
echo Starting Expense Tracker App (Django + React)
echo ====================================================

echo [1/2] Starting Django REST Backend on http://127.0.0.1:8000/ ...
start "Expense Tracker Backend" cmd /k "cd backend && python manage.py runserver 127.0.0.1:8000"

echo [2/2] Starting Vite React Frontend on http://127.0.0.1:5173/ ...
start "Expense Tracker Frontend" cmd /k "cd frontend && npm.cmd run dev -- --host 127.0.0.1 --port 5173"

timeout /t 3 /nobreak >nul
echo Opening Expense Tracker in your browser...
start http://127.0.0.1:5173/

echo ====================================================
echo Application is up and running!
echo Frontend: http://127.0.0.1:5173/
echo Backend:  http://127.0.0.1:8000/
echo Demo Login: kirthick / password123
echo ====================================================
