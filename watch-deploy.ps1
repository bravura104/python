# watch-deploy.ps1
# Watches the project folder for TS/TSX/JS/CSS/JSON changes and auto-deploys via Git + Vercel CLI.
# Run this once; it stays alive in the background terminal.
# Stop it with Ctrl+C or close the terminal.

param(
    [int]$DebounceSeconds = 8
)

$ProjectRoot = $PSScriptRoot
$DeployScript = Join-Path $ProjectRoot "deploy.ps1"

# File extensions to watch
$Filter = "*.ts","*.tsx","*.js","*.jsx","*.css","*.json","*.mjs"

# Directories to ignore during change detection
$IgnoreDirs = @('.git', '.vscode', '.next', 'node_modules')

Write-Host "👀 Watching $ProjectRoot for changes..." -ForegroundColor Cyan
Write-Host "   Extensions : $($Filter -join ', ')" -ForegroundColor DarkCyan
Write-Host "   Debounce   : ${DebounceSeconds}s" -ForegroundColor DarkCyan
Write-Host "   Target     : Vercel (production)" -ForegroundColor Yellow
Write-Host "   Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $ProjectRoot
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite -bor [System.IO.NotifyFilters]::FileName

# Shared state for debounce
$script:LastTrigger   = [datetime]::MinValue
$script:DeployPending = $false
$script:ChangedFile   = ''

$onChange = {
    $path = $Event.SourceEventArgs.FullPath

    # Skip ignored directories
    foreach ($dir in $IgnoreDirs) {
        if ($path -like "*\$dir\*") { return }
    }

    # Skip if extension doesn't match
    $ext = [System.IO.Path]::GetExtension($path).ToLower()
    $watched = @('.ts','.tsx','.js','.jsx','.css','.json','.mjs')
    if ($ext -notin $watched) { return }

    $script:LastTrigger   = Get-Date
    $script:DeployPending = $true
    $script:ChangedFile   = $path
}

Register-ObjectEvent $watcher Changed -Action $onChange | Out-Null
Register-ObjectEvent $watcher Created -Action $onChange | Out-Null
Register-ObjectEvent $watcher Renamed -Action $onChange | Out-Null

try {
    while ($true) {
        Start-Sleep -Milliseconds 500

        if ($script:DeployPending) {
            $elapsed = ((Get-Date) - $script:LastTrigger).TotalSeconds
            if ($elapsed -ge $DebounceSeconds) {
                $script:DeployPending = $false
                $rel = $script:ChangedFile.Replace($ProjectRoot, '').TrimStart('\')
                Write-Host ""
                Write-Host "🔄 Change detected: $rel" -ForegroundColor Yellow
                Write-Host "🚀 Deploying via Git + Vercel CLI..." -ForegroundColor Cyan
                & powershell.exe -ExecutionPolicy Bypass -File $DeployScript
                Write-Host ""
                Write-Host "👀 Watching for more changes..." -ForegroundColor Cyan
            }
        }
    }
}
finally {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Write-Host "Watcher stopped." -ForegroundColor DarkGray
}
