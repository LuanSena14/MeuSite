param(
  [int]$Port = 8080
)

$ErrorActionPreference = 'Stop'

$repoRoot = $PSScriptRoot
$frontendDir = Join-Path $repoRoot 'FrontEnd'

if (-not (Test-Path $frontendDir)) {
  Write-Error "Pasta FrontEnd nao encontrada em: $frontendDir"
}

Push-Location $frontendDir
try {
  Write-Host "Servindo FrontEnd em http://127.0.0.1:$Port ..."
  python -m http.server $Port
} finally {
  Pop-Location
}
