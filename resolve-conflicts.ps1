# PowerShell script to resolve all merge conflicts by accepting remote version
$conflictedFiles = git diff --name-only --diff-filter=U

if ($conflictedFiles) {
    Write-Host "Found conflicted files:"
    $conflictedFiles | ForEach-Object { Write-Host "  - $_" }
    
    Write-Host "`nResolving conflicts by accepting remote version..."
    git checkout --theirs $conflictedFiles
    
    Write-Host "`nAdding resolved files..."
    git add $conflictedFiles
    
    Write-Host "`nDone! Files resolved."
} else {
    Write-Host "No conflicted files found."
}
