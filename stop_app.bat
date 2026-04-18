@echo off
echo ========================================================
echo        Stopping Hospital Appointment System
echo ========================================================
echo.

echo Forcefully stopping all running Node.js tasks (Frontend)...
taskkill /F /IM node.exe >nul 2>&1

echo Forcefully stopping all running Python tasks (Backend)...
taskkill /F /IM python.exe >nul 2>&1

echo.
echo All background servers have been successfully shut down!
echo The ports are now free.
echo.
timeout /t 3 >nul
