@echo off
setlocal
cd /d "%~dp0"
set ELECTRON_RUN_AS_NODE=
if exist "release\win-unpacked\The Chemistry Behind Everyday Life.exe" (
  start "" "release\win-unpacked\The Chemistry Behind Everyday Life.exe"
  exit /b 0
)
if exist "node_modules\electron\dist\electron.exe" (
  call npm.cmd start
  exit /b
)
echo Open README.md for the one-time development setup.
pause
