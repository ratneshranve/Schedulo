@echo off
cd /d "C:\Users\Abcom\Desktop\Schedulo\server"
echo Installing dependencies...
call node "C:\nvm4w\nodejs\node_modules\npm\bin\npm-cli.js" install
echo.
echo Running test script...
node test-api.js
pause
