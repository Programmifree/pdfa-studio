@echo off
rem Build the deploy/ folder for programmifree.com/web/app/pdfa/
robocopy prototype deploy /MIR /XD test out tools node_modules /XF server.js README.md s2.pdf
echo.
echo Deploy folder ready (upload the whole deploy\ folder to programmifree.com/web/app/pdfa/).
dir /b deploy
