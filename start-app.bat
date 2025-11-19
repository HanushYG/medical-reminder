@echo off
echo ========================================
echo Medicine Adherence Reminder - Startup
echo ========================================
echo.

echo Checking for node_modules...
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

echo.
echo Starting application...
echo Frontend will be available at: http://localhost:5174
echo Backend will be available at: http://localhost:5002
echo.
echo Press Ctrl+C to stop the servers
echo.

npm run dev
