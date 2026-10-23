param([string]$Runtime = "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies")
$ErrorActionPreference = 'Stop'
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$python = Join-Path $Runtime 'python/python.exe'
$node = Join-Path $Runtime 'node/bin/node.exe'
if (-not (Test-Path (Join-Path $PSScriptRoot 'node_modules'))) {
    New-Item -ItemType Junction -Path (Join-Path $PSScriptRoot 'node_modules') -Target (Join-Path $Runtime 'node/node_modules') | Out-Null
}
$env:PYTHONIOENCODING = 'utf-8'
& $python (Join-Path $PSScriptRoot 'build_data.py')
if ($LASTEXITCODE) { throw 'Source adapter failed' }
& $node (Join-Path $PSScriptRoot 'build_workbook.mjs')
if ($LASTEXITCODE) { throw 'Workbook authoring failed' }
& (Join-Path $PSScriptRoot 'finalize.ps1') -Root $root
& $python (Join-Path $PSScriptRoot 'validate.py')
if ($LASTEXITCODE) { throw 'Final validation failed' }
