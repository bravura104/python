# Deploy to ding-tee.dovara.biz
$WinSCP = "$env:LOCALAPPDATA\Programs\WinSCP\WinSCP.com"

& $WinSCP /log="deploy.log" /ini=nul /command `
    "open ftp://dovara_prod@dovara.biz:DovaraProd@2025@ftp.dovara.biz:21 -passive=on" `
    "synchronize remote -criteria=either ""C:\projects\tshirt-shop"" /ding-tee.dovara.biz -filemask=""|.git/;node_modules/;.next/;deploy.ps1;watch-deploy.ps1;deploy.log;.vscode/;.env.local;.env.local.example""" `
    "exit"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment to ding-tee.dovara.biz successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed. Check deploy.log for details." -ForegroundColor Red
    exit $LASTEXITCODE
}
