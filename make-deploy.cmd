@echo off
rem Build the deploy/ folder for programmifree.com/web/app/pdfa/
robocopy prototype deploy /MIR /XD test out tools node_modules /XF server.js README.md s2.pdf
rem Il server di Programmifree serve index.htm come documento predefinito (non index.html)
ren deploy\index.html index.htm >nul 2>&1
echo.
echo Deploy folder ready (upload the whole deploy\ folder to programmifree.com/web/app/pdfa/).
dir /b deploy
