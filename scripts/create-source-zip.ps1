$ErrorActionPreference = 'Stop'
$museumRoot = Split-Path -Parent $PSScriptRoot
$sourceItems = @(
  '.github', 'src', 'electron', 'scripts', 'tests', 'build', 'licenses',
  '.gitignore', '.prettierrc.json', '.prettierignore', 'package.json', 'package-lock.json',
  'index.html', 'electron-builder.cjs', 'vite.config.js', 'playwright.config.js',
  'README.md', 'Launch Museum.cmd'
)
$sourcePaths = $sourceItems | ForEach-Object { Join-Path $museumRoot $_ }
$archivePath = Join-Path $museumRoot 'Chemistry-Museum-Source.zip'
Compress-Archive -LiteralPath $sourcePaths -DestinationPath $archivePath -Force
Get-Item -LiteralPath $archivePath | Select-Object FullName, Length
