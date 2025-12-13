# PowerShell script to add missing profile translation keys to all language files

$localesPath = "client\src\locales"
$languageFiles = @("da.json", "de.json", "es.json", "fi.json", "fr.json", "hi.json", "ja.json", "ko.json", "mr.json", "nl.json", "no.json", "pt.json", "sv.json")

$keysToAdd = '    "TotalTasks": "Total Tasks",
    "CompletedTasks": "Completed Tasks",
    "ProjectsParticipated": "Projects Participated",
    "WorkspacesJoined": "Workspaces Joined",
    "StreakDays": "Streak Days",
    "TotalHoursWorked": "Total Hours Worked",
    "totalTasks": "Total Tasks",
    "completedTasks": "Completed Tasks",
    "projectsParticipated": "Projects Participated",
    "workspacesJoined": "Workspaces Joined",
    "streakDays": "Streak Days",
    "totalHoursWorked": "Total Hours Worked",
    "addAddress": "Add Address",
    "addPaymentMethod": "Add Payment Method",
    "default": "Default",
    "expiryDate": "Expiry Date",
    "type": "Type",
    "street": "Street Address",
    "city": "City",
    "state": "State/Province",
    "zipCode": "ZIP/Postal Code",
    "country": "Country",
    "setAsDefault": "Set as Default",
    "cardNumber": "Card Number",
    "expiryMonth": "Expiry Month",
    "expiryYear": "Expiry Year",
    "cardHolderName": "Cardholder Name",
    "home": "Home",
    "work": "Work",
    "billing": "Billing",
    "shipping": "Shipping"'

Write-Host "Starting to update language files..." -ForegroundColor Green

foreach ($file in $languageFiles) {
    $filePath = Join-Path $localesPath $file
    
    if (Test-Path $filePath) {
        Write-Host "Processing $file..." -ForegroundColor Yellow
        
        try {
            $content = Get-Content $filePath -Raw
            
            if ($content -match '"showPhone":\s*"[^"]*"') {
                $content = $content -replace '("showPhone":\s*"[^"]*")', "`$1,`r`n$keysToAdd"
                Set-Content -Path $filePath -Value $content -NoNewline
                Write-Host "Updated $file successfully" -ForegroundColor Green
            } else {
                Write-Host "Could not find showPhone key in $file" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "Error updating $file" -ForegroundColor Red
        }
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

Write-Host "All files processed!" -ForegroundColor Green
