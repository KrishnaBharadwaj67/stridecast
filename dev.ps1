# StrideCast Local Dev Launcher
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   Starting StrideCast Dev Servers    " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

$backendProcess = Start-Process python -ArgumentList "-m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -WorkingDirectory "$PSScriptRoot\backend" -PassThru
Write-Host "[OK] Backend running at http://localhost:8000 (PID: $($backendProcess.Id))" -ForegroundColor Green

Set-Location "$PSScriptRoot\frontend"
Write-Host "[OK] Frontend running at http://localhost:5173" -ForegroundColor Green
npm run dev -- --host 0.0.0.0
