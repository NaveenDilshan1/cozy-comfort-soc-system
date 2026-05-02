@echo off
echo Starting CozyComfort Application...
echo.

echo Starting Backend API...
start "CozyComfort API" cmd /k "cd CozyComfort.API && dotnet run"

echo Starting Frontend...
start "CozyComfort Frontend" cmd /k "cd CozyComfort.Frontend && npm run dev"

echo.
echo Application started!
echo Frontend: http://localhost:5173
echo Backend: https://localhost:7292
echo.
pause
