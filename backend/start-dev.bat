@echo off
echo ====================================
echo   Starting Castify Development
echo ====================================

echo.
echo [1/4] Checking Docker...
docker --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Docker is not installed or not running!
    echo Please install Docker Desktop and make sure it's running.
    pause
    exit /b 1
)

echo [2/4] Building the application...
call mvnw clean package -DskipTests
if %ERRORLEVEL% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo [3/4] Starting MongoDB and Redis...
docker-compose up -d mongodb redis

echo [4/4] Waiting for services to be ready...
timeout /t 15 /nobreak

echo.
echo ====================================
echo   Services started successfully!
echo ====================================
echo   - MongoDB: localhost:27017
echo   - Redis:   localhost:6379
echo.
echo Now you can run your Spring Boot app from IDE
echo or run: docker-compose up backend
echo.
pause