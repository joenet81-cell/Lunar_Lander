@echo off
cd /d "%~dp0"
echo Iniciando Lunar Lander...
start "" http://localhost:5173
npm run dev
