# Deploy to Vercel (production) via Git + Vercel CLI
Set-Location $PSScriptRoot

# --- 1. Git: stage all changes ---
Write-Host ">> Staging changes..." -ForegroundColor Cyan
git add -A

# --- 2. Git: commit (skip if nothing to commit) ---
$status = git status --porcelain
if ($status) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    git commit -m "deploy: $timestamp"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: git commit failed." -ForegroundColor Red
        exit $LASTEXITCODE
    }
} else {
    Write-Host "INFO: Nothing new to commit." -ForegroundColor DarkGray
}

# --- 3. Git: push ---
Write-Host ">> Pushing to remote..." -ForegroundColor Cyan
git push
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: git push failed." -ForegroundColor Red
    exit $LASTEXITCODE
}

# --- 4. Vercel: deploy to production ---
Write-Host ">> Deploying to Vercel (production)..." -ForegroundColor Cyan
vercel --prod --yes
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Deployment to Vercel production successful!" -ForegroundColor Green
} else {
    Write-Host "ERROR: Vercel deployment failed." -ForegroundColor Red
    exit $LASTEXITCODE
}
