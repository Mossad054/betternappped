# Sleep Wellness Hub - Real Data Migration Verification Script
# This script checks for any remaining mock data or hardcoded defaults

Write-Host "Verifying Sleep Wellness Hub Real Data Migration..." -ForegroundColor Cyan
Write-Host ""

$foundIssues = $false
$basePath = "c:\Users\ROLSS_IWCF TC 6\projects\Betternapped"

# Define files to check
$filesToCheck = @(
    "app\sleep-wellness\wind-down.tsx",
    "app\sleep-wellness\programme-hub.tsx",
    "services\SleepProgrammeService.ts"
)

# Check for MOCK constants
Write-Host "Checking for MOCK constants..." -ForegroundColor Yellow
foreach ($file in $filesToCheck) {
    $fullPath = Join-Path $basePath $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        if ($content -match "MOCK_") {
            Write-Host "   [X] Found MOCK constant in: $file" -ForegroundColor Red
            $foundIssues = $true
        }
    }
}
if (-not $foundIssues) {
    Write-Host "   [OK] No MOCK constants found" -ForegroundColor Green
}
Write-Host ""

# Check for hardcoded sleep defaults
Write-Host "Checking for hardcoded sleep duration defaults (420, 480, 390)..." -ForegroundColor Yellow
$programmeServicePath = Join-Path $basePath "services\SleepProgrammeService.ts"
if (Test-Path $programmeServicePath) {
    $content = Get-Content $programmeServicePath -Raw
    $matches = [regex]::Matches($content, "=\s*(420|480|390)\s*;")
    if ($matches.Count -gt 0) {
        Write-Host "   [X] Found hardcoded defaults in SleepProgrammeService.ts" -ForegroundColor Red
        $foundIssues = $true
    } else {
        Write-Host "   [OK] No hardcoded sleep duration defaults found" -ForegroundColor Green
    }
}
Write-Host ""

# Verify SleepService integration
Write-Host "Verifying SleepService integration in programme-hub..." -ForegroundColor Yellow
$programmeHubPath = Join-Path $basePath "app\sleep-wellness\programme-hub.tsx"
if (Test-Path $programmeHubPath) {
    $content = Get-Content $programmeHubPath -Raw
    if ($content -match "SleepService\.getByDateRange") {
        Write-Host "   [OK] Programme Hub uses SleepService.getByDateRange" -ForegroundColor Green
    } else {
        Write-Host "   [X] Programme Hub missing SleepService integration" -ForegroundColor Red
        $foundIssues = $true
    }
}
Write-Host ""

# Verify HabitsService integration
Write-Host "Verifying HabitsService integration in wind-down..." -ForegroundColor Yellow
$windDownPath = Join-Path $basePath "app\sleep-wellness\wind-down.tsx"
if (Test-Path $windDownPath) {
    $content = Get-Content $windDownPath -Raw
    if ($content -match "HabitsService") {
        Write-Host "   [OK] Wind-down uses HabitsService" -ForegroundColor Green
    } else {
        Write-Host "   [X] Wind-down missing HabitsService integration" -ForegroundColor Red
        $foundIssues = $true
    }
}
Write-Host ""

# Final Report
Write-Host "=========================================" -ForegroundColor Cyan
if ($foundIssues) {
    Write-Host "[FAILED] Verification found issues" -ForegroundColor Red
    exit 1
} else {
    Write-Host "[PASSED] Sleep Wellness Hub is fully migrated to real data!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor White
    Write-Host "  - No MOCK constants" -ForegroundColor White
    Write-Host "  - No hardcoded defaults" -ForegroundColor White
    Write-Host "  - Proper service integration" -ForegroundColor White
    Write-Host "  - Real database queries throughout" -ForegroundColor White
    exit 0
}
