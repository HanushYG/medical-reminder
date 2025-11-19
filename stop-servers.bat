@echo off
echo ========================================
echo Stopping Medicine Adherence Reminder
echo ========================================
echo.

echo Killing processes on port 5002 (Backend)...
powershell -Command "Get-NetTCPConnection -LocalPort 5002 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }" 2>nul

echo Killing processes on port 5173 (Frontend)...
powershell -Command "Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }" 2>nul

echo Killing processes on port 5174 (Frontend Alt)...
powershell -Command "Get-NetTCPConnection -LocalPort 5174 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }" 2>nul

echo.
echo All servers stopped!
echo.
pause
