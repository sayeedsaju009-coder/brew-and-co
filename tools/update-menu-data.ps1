<#
  Copies data/menu.csv into data/menu-data.js.

  Browsers block fetch() of the CSV when a page is opened straight from the
  folder (file://). menu-data.js is the fallback the site loads in that case.
  Run this after every edit to menu.csv:

    powershell -NoProfile -ExecutionPolicy Bypass -File tools\update-menu-data.ps1
#>
$root = Split-Path -Parent $PSScriptRoot
$csv = [IO.File]::ReadAllText((Join-Path $root 'data\menu.csv'), [Text.Encoding]::UTF8)
if ($csv.Contains('`') -or $csv.Contains('${')) { throw 'menu.csv must not contain a backtick or ${' }
$js = "/* Generated from data/menu.csv by tools/update-menu-data.ps1. Do not edit by hand. */`nwindow.BREW_MENU_CSV = String.raw``" + $csv.TrimEnd() + "``;`n"
[IO.File]::WriteAllText((Join-Path $root 'data\menu-data.js'), $js, (New-Object Text.UTF8Encoding $false))
Write-Output "Updated data/menu-data.js"
