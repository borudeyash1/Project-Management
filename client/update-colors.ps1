# Script to update blue colors to yellow accent color (#fcdd05)
# This will replace common blue button and UI element colors with the accent color

$sourceDir = "src"

# Define color replacements
$replacements = @{
    # Button backgrounds
    'bg-blue-600' = 'bg-accent'
    'bg-blue-500' = 'bg-accent'
    'bg-blue-400' = 'bg-accent-light'
    
    # Hover states
    'hover:bg-blue-700' = 'hover:bg-accent-hover'
    'hover:bg-blue-600' = 'hover:bg-accent-dark'
    'hover:bg-blue-500' = 'hover:bg-accent-dark'
    
    # Text colors for buttons (when on blue background, now on yellow)
    # We'll keep text-white for now as it works on yellow
    
    # Border colors
    'border-blue-600' = 'border-accent-dark'
    'border-blue-500' = 'border-accent'
    'border-blue-400' = 'border-accent-light'
    
    # Focus states
    'focus:ring-blue-500' = 'focus:ring-accent'
    'focus:border-blue-500' = 'focus:border-accent'
    
    # Text colors (for links and accents)
    'text-blue-600' = 'text-accent-dark'
    'text-blue-500' = 'text-accent'
    'text-blue-400' = 'text-accent-light'
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
Write-Host "`nColor theme updated to yellow (#fcdd05)!"
