# Script to fix text colors on yellow accent buttons
# Yellow buttons should have dark text, not white text

$sourceDir = "src"

# Define text color fixes for buttons with accent background
$replacements = @{
    # Fix white text on accent buttons - replace with dark text
    'bg-accent text-white' = 'bg-accent text-gray-900'
    'bg-accent-light text-white' = 'bg-accent-light text-gray-900'
    'bg-accent-dark text-white' = 'bg-accent-dark text-gray-900'
    'bg-accent-hover text-white' = 'bg-accent-hover text-gray-900'
    
    # Fix hover states that might have white text
    'hover:bg-accent-hover text-white' = 'hover:bg-accent-hover text-gray-900'
    'hover:bg-accent-dark text-white' = 'hover:bg-accent-dark text-gray-900'
    
    # Fix cases where text-white comes before bg-accent
    'text-white bg-accent' = 'text-gray-900 bg-accent'
    'text-white bg-accent-light' = 'text-gray-900 bg-accent-light'
    'text-white bg-accent-dark' = 'text-gray-900 bg-accent-dark'
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
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $new
            $fileReplacements++
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $totalFiles++
        $totalReplacements += $fileReplacements
        Write-Host "Updated: $($file.FullName) - $fileReplacements replacements"
    }
}

Write-Host "`nTotal files updated: $totalFiles"
Write-Host "Total replacements made: $totalReplacements"
Write-Host "`nButton text colors fixed for better contrast on yellow background!"
