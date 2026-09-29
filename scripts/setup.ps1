param([string]$Python = 'python', [switch]$Demo)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
Set-Location $projectRoot
if (!(Test-Path '.venv\Scripts\python.exe')) {
    & $Python -m venv .venv
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao criar ambiente Python.' }
}
& '.\.venv\Scripts\python.exe' -m pip install -r backend/requirements.lock.txt
if ($LASTEXITCODE -ne 0) { throw 'Falha ao instalar dependências Python.' }
if (!(Test-Path 'backend\.env')) { Copy-Item backend/.env.example backend/.env }
& '.\.venv\Scripts\python.exe' backend/manage.py migrate
if ($LASTEXITCODE -ne 0) { throw 'Falha ao aplicar migrações.' }
Push-Location frontend
try {
    & npm.cmd ci
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao instalar dependências frontend.' }
} finally { Pop-Location }
if ($Demo) {
    & '.\.venv\Scripts\python.exe' backend/manage.py seed_demo
} else {
    & '.\.venv\Scripts\python.exe' backend/manage.py createsuperuser
}
if ($LASTEXITCODE -ne 0) { throw 'Falha ao configurar a conta.' }
Write-Host 'Pronto. Execute .\scripts\dev.ps1 para iniciar.'
