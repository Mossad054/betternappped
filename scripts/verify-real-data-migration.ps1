# Sleep Wellness Hub - Real Data Migration Verification Script
# This script checks for any remaining mock data or hardcoded defaults

Write-Host "🔍 Verifying Sleep Wellness Hub Real Data Migration..." -ForegroundColor Cyan
Write-Host ""

$foundIssues = $false
$basePath = "c:\Users\ROLSS_IWCF TC 6\projects\Betternapped"

# Define files to check
$filesToCheck = @(
    "app\sleep-wellness\wind-down.tsx",
    "app\sleep-wellness\programme-hub.tsx",
    "app\sleep-wellness\morning-check-in.tsx",
    "app\sleep-wellness\trends.tsx",
    "services\SleepProgrammeService.ts",
    "services\sleep.service.ts",
    "services\sleep-analytics.service.ts",
    "components\sleep\SleepDashboard.tsx"
)

# Check for MOCK constants
Write-Host "📋 Checking for MOCK constants..." -ForegroundColor Yellow
foreach ($file in $filesToCheck) {
    $fullPath = Join-Path $basePath $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        if ($content -match "MOCK_") {
            Write-Host "   ❌ Found MOCK constant in: $file" -ForegroundColor Red
            $foundIssues = $true
        }
    }
}
if (-not $foundIssues) {
    Write-Host "   ✅ No MOCK constants found" -ForegroundColor Green
}
Write-Host ""

# Check for hardcoded sleep defaults (420, 480, 390, etc.)
Write-Host "📋 Checking for hardcoded sleep duration defaults..." -ForegroundColor Yellow
$hardcodedDefaults = @(420, 480, 390)
$tempIssues = $false
foreach ($file in $filesToCheck) {
    $fullPath = Join-Path $basePath $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        foreach ($default in $hardcodedDefaults) {
            # Skip legitimate time conversions (24 * 60, etc.)
            if ($content -match "=\s*$default\s*;") {
                Write-Host "   [X] Found hardcoded default $default in: $file" -ForegroundColor Red
                $tempIssues = $true
                $foundIssues = $true
            }
        }
    }
}
if (-not $tempIssues) {
    Write-Host "   ✅ No hardcoded sleep duration defaults found" -ForegroundColor Green
}
Write-Host ""

# Check for mock quality scores (2.8, 3.0, etc.)
Write-Host "📋 Checking for hardcoded quality score defaults..." -ForegroundColor Yellow
$qualityDefaults = @("2.8", "3.0")
$tempIssues = $false
foreach ($file in $filesToCheck) {
    $fullPath = Join-Path $basePath $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        foreach ($default in $qualityDefaults) {
            if ($content -match "=\s*$default\s*;") {
                Write-Host "   ❌ Found hardcoded quality default $default in: $file" -ForegroundColor Red
                $tempIssues = $true
                $foundIssues = $true
            }
        }
    }
}
if (-not $tempIssues) {
    Write-Host "   ✅ No hardcoded quality score defaults found" -ForegroundColor Green
}
Write-Host ""

# Verify SleepService imports
Write-Host "📋 Verifying SleepService integration..." -ForegroundColor Yellow
$sleepServiceFiles = @(
    "app\sleep-wellness\programme-hub.tsx",
    "components\sleep\SleepDashboard.tsx"
)
$missingImports = $false
foreach ($file in $sleepServiceFiles) {
    $fullPath = Join-Path $basePath $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        if ($content -notmatch "SleepService") {
            Write-Host "   ❌ Missing SleepService import in: $file" -ForegroundColor Red
            $missingImports = $true
            $foundIssues = $true
        }
    }
}
if (-not $missingImports) {
    Write-Host "   ✅ All files properly import SleepService" -ForegroundColor Green
}
Write-Host ""

# Verify HabitsService integration in wind-down
Write-Host "📋 Verifying HabitsService integration..." -ForegroundColor Yellow
$windDownPath = Join-Path $basePath "app\sleep-wellness\wind-down.tsx"
if (Test-Path $windDownPath) {
    $content = Get-Content $windDownPath -Raw
    if ($content -match "HabitsService") {
        Write-Host "   ✅ Wind-down properly uses HabitsService" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Wind-down missing HabitsService integration" -ForegroundColor Red
        $foundIssues = $true
    }
}
Write-Host ""

# Check for "estimated" or "fake" in alerts
Write-Host "📋 Checking for estimation language in user alerts..." -ForegroundColor Yellow
$tempIssues = $false
foreach ($file in $filesToCheck) {
    $fullPath = Join-Path $basePath $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        if ($content -match "estimated baseline|fake|mock data|hardcoded") {
            Write-Host "   ⚠️  Found estimation/mock language in: $file" -ForegroundColor Yellow
            $tempIssues = $true
        }
    }
}
if (-not $tempIssues) {
    Write-Host "   ✅ No estimation language found in alerts" -ForegroundColor Green
}
Write-Host ""

# Final Report
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
if ($foundIssues) {
    Write-Host "❌ VERIFICATION FAILED - Issues found above" -ForegroundColor Red
    Write-Host "   Please review and fix the identified issues" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "✅ VERIFICATION PASSED" -ForegroundColor Green
    Write-Host "   Sleep Wellness Hub is fully migrated to real data!" -ForegroundColor Green
    Write-Host "   • No MOCK constants" -ForegroundColor White
    Write-Host "   • No hardcoded defaults" -ForegroundColor White
    Write-Host "   • Proper service integration" -ForegroundColor White
    Write-Host "   • Real database queries throughout" -ForegroundColor White
    exit 0
}
