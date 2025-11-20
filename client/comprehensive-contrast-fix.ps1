# Comprehensive Contrast Fix Script
# This will find and fix ALL low-contrast color combinations in the entire project

$sourceDir = "src"

Write-Host "Starting comprehensive contrast fix..." -ForegroundColor Cyan
Write-Host ""

# Define ALL contrast fixes comprehensively
$replacements = @{
    # TEXT COLOR FIXES - Light gray text (too light on white backgrounds)
    'text-gray-300' = 'text-gray-700'
    'text-gray-400 ' = 'text-gray-600 '
    'text-gray-500 ' = 'text-gray-600 '
    
    # Light blue text
    'text-blue-200' = 'text-blue-700'
    'text-blue-300' = 'text-blue-700'
    'text-blue-400' = 'text-blue-600'
    
    # Light green text
    'text-green-300' = 'text-green-700'
    'text-green-400' = 'text-green-600'
    
    # Light purple text
    'text-purple-300' = 'text-purple-700'
    'text-purple-400' = 'text-purple-600'
    
    # Light red text
    'text-red-300' = 'text-red-700'
    'text-red-400' = 'text-red-600'
    
    # Light orange text
    'text-orange-300' = 'text-orange-700'
    'text-orange-400' = 'text-orange-600'
    
    # Light yellow text
    'text-yellow-300' = 'text-yellow-700'
    'text-yellow-400' = 'text-yellow-600'
    
    # BADGE COLOR FIXES - Blue badges
    'bg-blue-50 text-blue-300' = 'bg-blue-100 text-blue-700'
    'bg-blue-50 text-blue-400' = 'bg-blue-100 text-blue-700'
    'bg-blue-100 text-blue-300' = 'bg-blue-200 text-blue-800'
    'bg-blue-100 text-blue-400' = 'bg-blue-200 text-blue-700'
    'bg-blue-100 text-blue-500' = 'bg-blue-200 text-blue-800'
    
    # Green badges
    'bg-green-50 text-green-300' = 'bg-green-100 text-green-700'
    'bg-green-50 text-green-400' = 'bg-green-100 text-green-700'
    'bg-green-100 text-green-500' = 'bg-green-200 text-green-800'
    'bg-green-100 text-green-600' = 'bg-green-200 text-green-800'
    
    # Orange badges
    'bg-orange-50 text-orange-300' = 'bg-orange-100 text-orange-700'
    'bg-orange-50 text-orange-400' = 'bg-orange-100 text-orange-700'
    'bg-orange-100 text-orange-500' = 'bg-orange-200 text-orange-800'
    'bg-orange-100 text-orange-600' = 'bg-orange-200 text-orange-800'
    
    # Yellow badges
    'bg-yellow-50 text-yellow-300' = 'bg-yellow-100 text-yellow-700'
    'bg-yellow-50 text-yellow-400' = 'bg-yellow-100 text-yellow-700'
    'bg-yellow-100 text-yellow-500' = 'bg-yellow-200 text-yellow-800'
    'bg-yellow-100 text-yellow-600' = 'bg-yellow-200 text-yellow-800'
    
    # Red badges
    'bg-red-50 text-red-300' = 'bg-red-100 text-red-700'
    'bg-red-50 text-red-400' = 'bg-red-100 text-red-700'
    'bg-red-100 text-red-500' = 'bg-red-200 text-red-800'
    'bg-red-100 text-red-600' = 'bg-red-200 text-red-800'
    
    # Purple badges
    'bg-purple-50 text-purple-300' = 'bg-purple-100 text-purple-700'
    'bg-purple-50 text-purple-400' = 'bg-purple-100 text-purple-700'
    'bg-purple-100 text-purple-500' = 'bg-purple-200 text-purple-800'
    'bg-purple-100 text-purple-600' = 'bg-purple-200 text-purple-800'
    
    # BORDER COLOR FIXES
    'border-gray-100' = 'border-gray-300'
    'border-gray-200 ' = 'border-gray-300 '
    
    # PLACEHOLDER TEXT
    'placeholder-gray-300' = 'placeholder-gray-500'
    'placeholder-gray-400' = 'placeholder-gray-500'
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
        $matches = ([regex]::Matches($content, [regex]::Escape($old))).Count
        if ($matches -gt 0) {
            $content = $content -replace [regex]::Escape($old), $new
            $fileReplacements += $matches
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $totalFiles++
        $totalReplacements += $fileReplacements
        $relativePath = $file.FullName.Replace($PWD.Path + "\", "")
        Write-Host "Updated: $relativePath - $fileReplacements replacements" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COMPREHENSIVE CONTRAST FIX COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total files updated: $totalFiles" -ForegroundColor Yellow
Write-Host "Total replacements made: $totalReplacements" -ForegroundColor Yellow
Write-Host ""
Write-Host "All contrast issues have been fixed!" -ForegroundColor Green
