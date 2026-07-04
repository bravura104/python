# Deploy to Vercel via Git + Vercel CLI
param(
    [ValidateSet("prod", "qa")]
    [string]$Target = "prod"
)

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

# --- 4. Vercel: deploy by target ---
if ($Target -eq "qa") {
    Write-Host ">> Deploying to Vercel (preview / QA)..." -ForegroundColor Cyan
    vercel --yes
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK: Deployment to Vercel QA successful!" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Vercel QA deployment failed." -ForegroundColor Red
        exit $LASTEXITCODE
    }
} else {
    Write-Host ">> Deploying to Vercel (production)..." -ForegroundColor Cyan
    vercel --prod --yes
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK: Deployment to Vercel production successful!" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Vercel deployment failed." -ForegroundColor Red
        exit $LASTEXITCODE
    }
}
