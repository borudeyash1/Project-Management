# Script to fix all low-contrast color combinations
# This will improve readability across light and dark themes

$sourceDir = "src"

# Define contrast fixes
$replacements = @{
    # Fix light gray text on white backgrounds
    'text-gray-300' = 'text-gray-700'
    'text-gray-400 ' = 'text-gray-600 '
    
    # Fix light blue text (planning badge, etc.)
    'text-blue-300' = 'text-blue-700'
    'text-blue-400' = 'text-blue-600'
    'bg-blue-100 text-blue-300' = 'bg-blue-100 text-blue-700'
    'bg-blue-100 text-blue-400' = 'bg-blue-100 text-blue-600'
    
    # Fix beige/cream colors on dark backgrounds
    'bg-orange-100' = 'bg-orange-200'
    'text-orange-300' = 'text-orange-500'
    'text-orange-400' = 'text-orange-500'
    
    # Fix priority badge colors for better contrast
    'bg-orange-100 text-orange-600' = 'bg-orange-200 text-orange-800'
    'bg-yellow-100 text-yellow-600' = 'bg-yellow-200 text-yellow-800'
    'bg-red-100 text-red-600' = 'bg-red-200 text-red-800'
    'bg-green-100 text-green-600' = 'bg-green-200 text-green-800'
    
    # Fix toggle/switch colors
    'bg-gray-200' = 'bg-gray-300'
    'bg-gray-300 ' = 'bg-gray-400 '
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
Write-Host "`nAll low-contrast colors have been fixed!"
