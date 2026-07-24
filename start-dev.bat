@echo off
setlocal

cd /d "%~dp0"

if not exist "package.json" (
  echo [FlowDesk] package.json was not found in the repository root.
  echo Run this launcher from the FlowDesk repository.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [FlowDesk] npm was not found on PATH.
  echo Install Node.js with npm, then run this launcher again.
  pause
  exit /b 1
)

if not exist "node_modules\.bin\serve.cmd" (
  echo [FlowDesk] Local dependencies are missing or incomplete.
  echo Run: npm ci
  pause
  exit /b 1
)

echo [FlowDesk] Starting the development server from:
echo %CD%
call npm run dev
set "EXIT_CODE=%ERRORLEVEL%"

if not "%EXIT_CODE%"=="0" (
  echo.
  echo [FlowDesk] The development server stopped with exit code %EXIT_CODE%.
  pause
  exit /b %EXIT_CODE%
)

endlocal
