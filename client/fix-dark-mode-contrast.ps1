# Dark Mode Specific Contrast Fix
# This targets the specific issues visible in the screenshots

$sourceDir = "src"

Write-Host "Fixing dark mode contrast issues..." -ForegroundColor Cyan
Write-Host ""

# Define dark mode specific fixes
$replacements = @{
    # Fix light text on dark backgrounds (labels, headings)
    'dark:text-gray-400' = 'dark:text-gray-200'
    'dark:text-gray-500' = 'dark:text-gray-300'
    'dark:text-gray-600' = 'dark:text-gray-300'
    
    # Fix very light badges in dark mode
    'dark:bg-blue-900 text-blue-300' = 'dark:bg-blue-800 text-blue-200'
    'dark:bg-blue-900 dark:text-blue-300' = 'dark:bg-blue-800 dark:text-blue-200'
    'dark:text-blue-300' = 'dark:text-blue-200'
    'dark:text-blue-400' = 'dark:text-blue-300'
    
    'dark:bg-green-900 text-green-300' = 'dark:bg-green-800 text-green-200'
    'dark:bg-green-900 dark:text-green-300' = 'dark:bg-green-800 dark:text-green-200'
    'dark:text-green-300' = 'dark:text-green-200'
    'dark:text-green-400' = 'dark:text-green-300'
    
    'dark:bg-purple-900 text-purple-300' = 'dark:bg-purple-800 text-purple-200'
    'dark:bg-purple-900 dark:text-purple-300' = 'dark:bg-purple-800 dark:text-purple-200'
    'dark:text-purple-300' = 'dark:text-purple-200'
    'dark:text-purple-400' = 'dark:text-purple-300'
    
    'dark:bg-cyan-900 text-cyan-300' = 'dark:bg-cyan-800 text-cyan-200'
    'dark:bg-cyan-900 dark:text-cyan-300' = 'dark:bg-cyan-800 dark:text-cyan-200'
    'dark:text-cyan-300' = 'dark:text-cyan-200'
    'dark:text-cyan-400' = 'dark:text-cyan-300'
    
    # Fix placeholder text in dark mode
    'dark:placeholder-gray-400' = 'dark:placeholder-gray-300'
    'dark:placeholder-gray-500' = 'dark:placeholder-gray-300'
    
    # Fix icon colors in dark mode
    'dark:text-gray-400"' = 'dark:text-gray-200"'
    'dark:text-gray-500"' = 'dark:text-gray-300"'
    
    # Fix border colors in dark mode
    'dark:border-gray-700' = 'dark:border-gray-600'
    'dark:border-gray-800' = 'dark:border-gray-700'
    
    # Fix hover states in dark mode
    'dark:hover:text-gray-400' = 'dark:hover:text-gray-200'
    'dark:hover:text-gray-500' = 'dark:hover:text-gray-300'
    'dark:hover:bg-gray-800' = 'dark:hover:bg-gray-700'
    'dark:hover:bg-gray-900' = 'dark:hover:bg-gray-800'
}

# Get all TypeScript and JavaScript files
$files = Get-ChildItem -Path $sourceDir -Recurse -Include *.tsx,*.ts,*.jsx,*.js

$totalFiles = 0
$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileReplacements = 0
    
    foreach ($old in $replacements.Keys) {
        $new = $replacements[$old]
        $count = ([regex]::Matches($content, [regex]::Escape($old))).Count
        if ($count -gt 0) {
            $content = $content -replace [regex]::Escape($old), $new
            $fileReplacements += $count
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $totalFiles++
        $totalReplacements += $fileReplacements
        $relativePath = $file.FullName.Replace($PWD.Path + "\", "")
        Write-Host "Updated: $relativePath - $fileReplacements changes" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DARK MODE CONTRAST FIX COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total files updated: $totalFiles" -ForegroundColor Yellow
Write-Host "Total replacements: $totalReplacements" -ForegroundColor Yellow
Write-Host ""
Write-Host "Dark mode contrast issues fixed!" -ForegroundColor Green
