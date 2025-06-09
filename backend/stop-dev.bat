@echo off
echo ====================================
echo   Stopping Castify Services
echo ====================================

echo.
echo Stopping all containers...
docker-compose down

echo.
echo Cleaning up unused Docker resources...
docker system prune -f

echo.
echo ====================================
echo   All services stopped!
echo ====================================
pause