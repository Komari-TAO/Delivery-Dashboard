param(
  [switch]$Force
)

$ErrorActionPreference = 'Stop'

$workspaceRoot = 'C:\AI Projects\Codex_MVP'
$rawDir = Join-Path $workspaceRoot 'data\raw'
$dataPath = Join-Path $workspaceRoot 'web\data.js'
$statePath = Join-Path $workspaceRoot 'data\.dashboard_sync_state.json'
$python = 'C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'

$sourceDefinitions = @(
  @{ Name = 'Tempo worklogs'; Pattern = 'RAW_DATA_FULL_ANALYSIS_*.csv' },
  @{ Name = 'Jira PI backlog'; Pattern = 'All Jira Work Items marked PI Backlog (JIRA)_*.csv' },
  @{ Name = 'Weekly capacity'; Pattern = 'Weekly Capacity_*.csv' },
  @{ Name = 'Assignees master'; Pattern = '*Assignees*Capacit*.csv' },
  @{ Name = 'Master date'; Pattern = '*Master*Date*.csv' },
  @{ Name = 'Release cycles'; Pattern = 'Release Cycle*.csv' }
)

function Get-ExportDate {
  param([System.IO.FileInfo]$File)

  $name = $File.Name
  if ($name -match '_(\d{8})\.csv$') {
    return [datetime]::ParseExact($matches[1], 'yyyyMMdd', [Globalization.CultureInfo]::InvariantCulture)
  }
  if ($name -match '^(\d{8})_') {
    return [datetime]::ParseExact($matches[1], 'yyyyMMdd', [Globalization.CultureInfo]::InvariantCulture)
  }
  if ($name -match '_(\d{2}_[A-Za-z]{3}_\d{2})\.csv$') {
    return [datetime]::ParseExact($matches[1], 'dd_MMM_yy', [Globalization.CultureInfo]::InvariantCulture)
  }

  return $File.LastWriteTime
}

function Get-LatestRawFile {
  param(
    [string]$Name,
    [string]$Pattern
  )

  $matches = Get-ChildItem -LiteralPath $rawDir -Filter $Pattern -File
  if (-not $matches) {
    throw "No CSV files match '$Pattern' for $Name in $rawDir"
  }

  return $matches |
    Sort-Object @{ Expression = { Get-ExportDate $_ } }, @{ Expression = { $_.LastWriteTimeUtc } } |
    Select-Object -Last 1
}

function Get-SourceSnapshot {
  $sources = foreach ($definition in $sourceDefinitions) {
    $file = Get-LatestRawFile -Name $definition.Name -Pattern $definition.Pattern
    $hash = Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256
    [pscustomobject]@{
      name = $definition.Name
      pattern = $definition.Pattern
      file = $file.Name
      relativePath = "data/raw/$($file.Name)"
      length = $file.Length
      lastWriteTimeUtc = $file.LastWriteTimeUtc.ToString('o')
      sha256 = $hash.Hash
    }
  }

  return [pscustomobject]@{
    workspaceRoot = $workspaceRoot
    rawDir = $rawDir
    sources = @($sources)
  }
}

function Read-JsonFile {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    return $null
  }

  return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
}

function Read-DataSources {
  if (-not (Test-Path -LiteralPath $dataPath)) {
    return $null
  }

  $text = Get-Content -LiteralPath $dataPath -Raw
  $json = $text -replace '^window\.BI_DATA\s*=\s*', ''
  $json = $json -replace ';\s*$', ''
  return ($json | ConvertFrom-Json).meta.sources
}

function Get-ChangedSources {
  param(
    [object]$Current,
    [object]$Previous
  )

  $changes = New-Object System.Collections.Generic.List[string]
  if ($null -eq $Previous -or $null -eq $Previous.sources) {
    $changes.Add('No previous sync state was found.')
    return $changes
  }

  $previousByName = @{}
  foreach ($source in $Previous.sources) {
    $previousByName[$source.name] = $source
  }

  foreach ($source in $Current.sources) {
    $previous = $previousByName[$source.name]
    if ($null -eq $previous) {
      $changes.Add("$($source.name): no previous fingerprint.")
      continue
    }

    if ($source.file -ne $previous.file) {
      $changes.Add("$($source.name): selected file changed from '$($previous.file)' to '$($source.file)'.")
      continue
    }
    if ($source.sha256 -ne $previous.sha256) {
      $changes.Add("$($source.name): file contents changed.")
      continue
    }
    if ($source.length -ne $previous.length) {
      $changes.Add("$($source.name): file size changed.")
      continue
    }
    if ($source.lastWriteTimeUtc -ne $previous.lastWriteTimeUtc) {
      $changes.Add("$($source.name): file timestamp changed.")
    }
  }

  return $changes
}

function Test-DataJsMatchesCurrentSources {
  param([object]$Current)

  $dataSources = Read-DataSources
  if ($null -eq $dataSources) {
    return $false
  }

  $dataByName = @{}
  foreach ($source in $dataSources) {
    $dataByName[$source.name] = $source.file
  }

  foreach ($source in $Current.sources) {
    if (-not $dataByName.ContainsKey($source.name)) {
      return $false
    }
    if ($dataByName[$source.name] -ne $source.file) {
      return $false
    }
  }

  $dataLastWrite = (Get-Item -LiteralPath $dataPath).LastWriteTimeUtc
  foreach ($source in $Current.sources) {
    if ([datetime]::Parse($source.lastWriteTimeUtc, [Globalization.CultureInfo]::InvariantCulture).ToUniversalTime() -gt $dataLastWrite) {
      return $false
    }
  }

  return $true
}

function Write-SyncState {
  param([object]$Snapshot)

  $state = [pscustomobject]@{
    workspaceRoot = $Snapshot.workspaceRoot
    rawDir = $Snapshot.rawDir
    dataPath = $dataPath
    syncedAtUtc = (Get-Date).ToUniversalTime().ToString('o')
    sources = $Snapshot.sources
  }

  $state |
    ConvertTo-Json -Depth 6 |
    Set-Content -LiteralPath $statePath -Encoding UTF8
}

if (-not (Test-Path -LiteralPath $workspaceRoot)) {
  throw "Workspace was not found: $workspaceRoot"
}
if (-not (Test-Path -LiteralPath $rawDir)) {
  throw "Raw data directory was not found: $rawDir"
}
if (-not (Test-Path -LiteralPath $python)) {
  throw "Bundled Python runtime was not found: $python"
}

$current = Get-SourceSnapshot
$previous = Read-JsonFile -Path $statePath
$changes = Get-ChangedSources -Current $current -Previous $previous
$shouldBuild = $Force -or $changes.Count -gt 0 -or -not (Test-Path -LiteralPath $dataPath)

if (-not $Force -and $null -eq $previous -and (Test-DataJsMatchesCurrentSources -Current $current)) {
  Write-SyncState -Snapshot $current
  Write-Host 'No raw source changes detected. Initialized sync state without regenerating web\data.js.'
  exit 0
}

if (-not $shouldBuild) {
  Write-Host 'No raw source changes detected. web\data.js was not regenerated.'
  exit 0
}

if ($Force) {
  Write-Host 'Explicit sync requested. Regenerating web\data.js.'
} elseif (-not (Test-Path -LiteralPath $dataPath)) {
  Write-Host 'web\data.js is missing. Regenerating dashboard data.'
} else {
  Write-Host 'Raw source changes detected:'
  foreach ($change in $changes) {
    Write-Host " - $change"
  }
}

Push-Location $workspaceRoot
try {
  & $python 'scripts\build_web_data.py'
} finally {
  Pop-Location
}

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Write-SyncState -Snapshot (Get-SourceSnapshot)
Write-Host "Sync complete: $dataPath"
