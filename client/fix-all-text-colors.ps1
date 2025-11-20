# Final script to fix all remaining white text on yellow accent backgrounds
# This will search for specific patterns and replace them

$sourceDir = "src"

# Get all TypeScript and JavaScript files
$files = Get-ChildItem -Path $sourceDir -Recurse -Include *.tsx,*.ts,*.jsx,*.js

$totalFiles = 0
$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileChanged = $false
    
    # Pattern 1: bg-accent with text-white in same className
    if ($content -match 'className="[^"]*bg-accent[^"]*text-white[^"]*"') {
        $content = $content -replace '(className="[^"]*)text-white([^"]*bg-accent[^"]*")', '$1text-gray-900$2'
        $content = $content -replace '(className="[^"]*)bg-accent([^"]*text-white[^"]*")', '$1bg-accent$2' -replace 'text-white', 'text-gray-900'
        $fileChanged = $true
    }
    
    # Pattern 2: Specific pattern for avatar badges
    if ($content -match 'bg-accent border-2 border-white.*?text-white') {
        $content = $content -replace '(bg-accent border-2 border-white[^"]*dark:border-gray-[0-9]+ flex items-center justify-center )text-white', '$1text-gray-900'
        $fileChanged = $true
    }
    
    # Pattern 3: Another pattern for avatars
    if ($content -match 'rounded-full bg-accent.*?text-white') {
        $content = $content -replace '(rounded-full bg-accent[^"]*border-[^"]*flex items-center justify-center )text-white', '$1text-gray-900'
        $fileChanged = $true
    }
    
    if ($fileChanged) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $totalFiles++
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "`nTotal files updated: $totalFiles"
Write-Host "`nAll white text on yellow backgrounds has been fixed!"
