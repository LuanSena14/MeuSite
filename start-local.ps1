param(
  [int]$Port = 8001,
  [switch]$KillPort
)

$ErrorActionPreference = 'Stop'

$repoRoot = $PSScriptRoot
$backendDir = Join-Path $repoRoot 'backend'
$venvPython = Join-Path $repoRoot '.venv\Scripts\python.exe'

if (-not (Test-Path $backendDir)) {
  Write-Error "Pasta backend nao encontrada em: $backendDir"
}

if (Test-Path $venvPython) {
  $pythonExe = $venvPython
} else {
  $pythonExe = 'python'
}

$portListeners = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($portListeners) {
  $pids = $portListeners | Select-Object -ExpandProperty OwningProcess -Unique
  if ($KillPort) {
    foreach ($pid in $pids) {
      try {
        Stop-Process -Id $pid -Force -ErrorAction Stop
        Write-Host "Processo PID $pid finalizado para liberar porta $Port."
      } catch {
        Write-Warning "Nao foi possivel finalizar PID ${pid}: $($_.Exception.Message)"
      }
    }
  } else {
    Write-Warning "Porta $Port ja esta em uso por PID(s): $($pids -join ', ')"
    Write-Host "Use: .\start-local.ps1 -Port $Port -KillPort"
    exit 1
  }
}

$hasDatabaseUrlEnv = -not [string]::IsNullOrWhiteSpace($env:DATABASE_URL)
$hasBackendDotEnv = Test-Path (Join-Path $backendDir '.env')
$hasRootDotEnv = Test-Path (Join-Path $repoRoot '.env')

if (-not $hasDatabaseUrlEnv -and -not $hasBackendDotEnv -and -not $hasRootDotEnv) {
  Write-Warning 'DATABASE_URL nao detectada no ambiente e nenhum .env encontrado (raiz/backend).'
  Write-Warning 'Se o backend falhar, configure DATABASE_URL antes de rodar.'
}

Push-Location $backendDir
try {
  Write-Host "Subindo backend em http://127.0.0.1:$Port ..."
  & $pythonExe -m uvicorn main:app --reload --host 127.0.0.1 --port $Port
} finally {
  Pop-Location
}
