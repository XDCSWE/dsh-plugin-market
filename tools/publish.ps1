# 更新 DSH 插件市场索引并发布到 GitHub Pages。
# 桌面上的「更新.cmd」调用本脚本；也可直接运行：
#   powershell -NoProfile -ExecutionPolicy Bypass -File tools\publish.ps1
# 加 -NoPush 只重新生成和校验，不提交推送。
param([switch]$NoPush)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

$node = 'C:\Users\admin\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe'
$git = 'E:\GIT\cmd\git.exe'

function Step($index, $text) {
  Write-Host ""
  Write-Host "[$index/4] $text" -ForegroundColor Cyan
}

Write-Host "==================================================" -ForegroundColor DarkGray
Write-Host "  DSH 插件市场索引 - 更新并发布" -ForegroundColor White
Write-Host "  https://xdcswe.github.io/dsh-plugin-market/" -ForegroundColor DarkGray
Write-Host "==================================================" -ForegroundColor DarkGray

try {
  Step 1 '从 npm registry 拉取各插件的最新版本'
  & $node tools\_fetch.mjs
  if ($LASTEXITCODE -ne 0) { throw "tools\_fetch.mjs 失败（退出码 $LASTEXITCODE）" }

  Step 2 '重新生成 index.json 和图标'
  & $node tools\_build.mjs
  if ($LASTEXITCODE -ne 0) { throw "tools\_build.mjs 失败（退出码 $LASTEXITCODE）" }

  Step 3 '用官方校验器检查索引格式'
  & $node tools\_validate.mjs
  if ($LASTEXITCODE -ne 0) { throw "tools\_validate.mjs 失败（退出码 $LASTEXITCODE）" }

  Step 4 '提交并推送'
  & $git add -A
  & $git diff --cached --quiet
  if ($LASTEXITCODE -ne 0) {
    $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
    & $git commit -m "update index: $stamp"
    if ($LASTEXITCODE -ne 0) { throw "git commit 失败（退出码 $LASTEXITCODE）" }
  } else {
    Write-Host "      索引没有变化，跳过提交。" -ForegroundColor DarkGray
  }

  if ($NoPush) {
    Write-Host "      已跳过推送（-NoPush）。" -ForegroundColor DarkGray
  } else {
    & $git push
    if ($LASTEXITCODE -ne 0) {
      Write-Host ""
      Write-Host "推送失败，常见原因：" -ForegroundColor Yellow
      Write-Host "  1. SSH 公钥还没加到 GitHub（Settings - SSH and GPG keys）" -ForegroundColor Yellow
      Write-Host "  2. 到 github.com 的网络不通（检查 hosts 是否被 Steam++ 改回）" -ForegroundColor Yellow
      exit 1
    }
  }

  Write-Host ""
  Write-Host "完成。GitHub Pages 通常 30-60 秒后生效：" -ForegroundColor Green
  Write-Host "  https://xdcswe.github.io/dsh-plugin-market/index.json" -ForegroundColor Green
  exit 0
} catch {
  Write-Host ""
  Write-Host "失败：$($_.Exception.Message)" -ForegroundColor Red
  Write-Host "索引没有推送。" -ForegroundColor Red
  exit 1
}
