@echo off
echo ========================================================
echo        Starting Hospital Appointment System
echo ========================================================
echo.

:: 1. Start the Python Flask Backend in a new terminal window
echo [API] Starting Python Flask backend...
start "Hospital Backend" cmd /k "python app.py"

:: 2. Start the React Frontend in a new terminal window
echo [UI] Starting React frontend...
start "Hospital Frontend" cmd /k "cd frontend && npm run dev"

:: 3. Give the servers 5 seconds to boot up
echo.
echo Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

:: 4. Automatically open the default web browser to the app
echo Opening the browser to the application...
start http://localhost:5173

echo.
echo Everything is running! You can close this particular window now.
pause
