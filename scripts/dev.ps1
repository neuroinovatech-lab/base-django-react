param([int]$BackendPort = 8000, [int]$FrontendPort = 5173)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
Set-Location $projectRoot
if (!(Test-Path '.venv\Scripts\python.exe') -or !(Test-Path 'frontend\node_modules') -or !(Test-Path 'backend\.env')) {
    throw 'Execute .\scripts\setup.ps1 primeiro.'
}
$artifacts = Join-Path $projectRoot '.artifacts'
New-Item -ItemType Directory -Force -Path $artifacts | Out-Null
foreach ($port in @($BackendPort, $FrontendPort)) {
    $listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($listener) { throw "A porta $port já está em uso. Feche o servidor anterior." }
}
$backendProcess = $null
$frontendProcess = $null
$previousBackendUrl = $env:BACKEND_URL
$previousCsrfOrigins = $env:CSRF_TRUSTED_ORIGINS
try {
    $env:BACKEND_URL = "http://127.0.0.1:$BackendPort"
    $env:CSRF_TRUSTED_ORIGINS = "http://127.0.0.1:$FrontendPort,http://localhost:$FrontendPort"
    $backendProcess = Start-Process -FilePath (Join-Path $projectRoot '.venv\Scripts\python.exe') -ArgumentList @('manage.py', 'runserver', "127.0.0.1:$BackendPort", '--noreload') -WorkingDirectory (Join-Path $projectRoot 'backend') -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $artifacts 'backend.log') -RedirectStandardError (Join-Path $artifacts 'backend-error.log')
    $frontendProcess = Start-Process -FilePath (Get-Command node).Source -ArgumentList @('node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', $FrontendPort) -WorkingDirectory (Join-Path $projectRoot 'frontend') -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $artifacts 'frontend.log') -RedirectStandardError (Join-Path $artifacts 'frontend-error.log')
    Write-Host "Base disponível em http://127.0.0.1:$FrontendPort. Ctrl+C encerra os servidores."
    Write-Host 'Logs: .artifacts\backend-error.log e .artifacts\frontend-error.log'
    while (!$backendProcess.HasExited -and !$frontendProcess.HasExited) { Start-Sleep -Seconds 2 }
    throw 'Um servidor encerrou. Verifique os logs em .artifacts.'
} finally {
    $env:BACKEND_URL = $previousBackendUrl
    $env:CSRF_TRUSTED_ORIGINS = $previousCsrfOrigins
    if ($backendProcess -and !$backendProcess.HasExited) { Stop-Process -Id $backendProcess.Id }
    if ($frontendProcess -and !$frontendProcess.HasExited) { Stop-Process -Id $frontendProcess.Id }
}
