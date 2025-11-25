# Sartthi Ecosystem - Local Development Script (PowerShell)
# Runs Mail, Calendar, and Vault apps concurrently

Write-Host ""
Write-Host "========================================"
Write-Host "  Sartthi Ecosystem - Local Dev"
Write-Host "========================================"
Write-Host ""
Write-Host "Starting all Sartthi apps..."
Write-Host ""

# Start Mail app
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'sartthi-mail-ui'; npm install; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 2

# Start Calendar app
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'sartthi-calendar-ui'; npm install; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 2

# Start Vault app
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'sartthi-vault-ui'; npm install; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "========================================"
Write-Host "  All apps are starting!"
Write-Host "========================================"
Write-Host ""
Write-Host "  Mail:     http://localhost:3001"
Write-Host "  Calendar: http://localhost:3002"
Write-Host "  Vault:    http://localhost:3003"
Write-Host ""
Write-Host "Press any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
