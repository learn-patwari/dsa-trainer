@echo off
rem Starts the DSA Trainer and opens it in your browser.
rem Double-click this, or use the "DSA Trainer" shortcut on your desktop.
title DSA Trainer
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\start.ps1" %*

if errorlevel 1 (
  echo.
  pause
)
