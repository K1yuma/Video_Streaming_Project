@echo off
title StreamFlow - All-in-One Starter
echo ==========================================
echo    STREAMFLOW PROJECT STARTER
echo ==========================================

:: 1. Khoi dong MediaMTX
echo [1/3] Dang khoi dong MediaMTX...
start "MediaMTX Server" cmd /k "cd mediamtx && mediamtx.exe"

:: 2. Khoi dong Backend (Spring Boot)
echo [2/3] Dang khoi dong Backend (Spring Boot)...
start "Backend Server" cmd /k "cd backend && mvnw spring-boot:run"

:: 3. Khoi dong Frontend (React)
echo [3/4] Dang khoi dong Frontend (React)...
start "Frontend (Vite)" cmd /k "cd frontend\video-streaming-app && npm run dev"

:: 4. Khoi dong Cloudflare Tunnel (Public Link)
echo [4/4] Dang khoi dong Cloudflare Tunnel...
start "Cloudflare Tunnel" cmd /k "npx cloudflared tunnel --url http://localhost:5173"

echo ==========================================
echo TAT CA DICH VU DANG DUOC KHOI DONG!
echo - MediaMTX: http://localhost:8889
echo - Backend: http://localhost:8080
echo - Frontend: http://localhost:5173
echo - Public Link: (Xem trong cua so Cloudflare Tunnel)
echo ==========================================
pause
