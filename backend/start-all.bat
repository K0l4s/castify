@echo off
echo ====================================
echo   Starting Full Castify Stack
echo ====================================

echo.
echo Building and starting all services...
docker-compose up --build

pause