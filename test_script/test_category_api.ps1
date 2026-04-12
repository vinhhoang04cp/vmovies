#!/usr/bin/env pwsh
# VMovies Category Management API Test Script
# Test CRUD Genres + Countries

$BASE_URL = "http://127.0.0.1:8000/api"
$ADMIN_EMAIL = "admin@vmovies.com"
$ADMIN_PASS = "password"
$TOKEN = ""
$GENRE_ID = ""
$GENRE_SLUG = ""
$COUNTRY_ID = ""

function Write-Success { Write-Host ">> $($args[0])" -ForegroundColor Green }
function Write-ErrorMsg { Write-Host ">> $($args[0])" -ForegroundColor Red }
function Write-Info { Write-Host ">> $($args[0])" -ForegroundColor Yellow }
function Write-Header { Write-Host "`n======== $($args[0]) ========" -ForegroundColor Cyan }

# ============================================================
# 1. LOGIN
# ============================================================

Write-Header "1. LOGIN"
$loginBody = @{ email = $ADMIN_EMAIL; password = $ADMIN_PASS } | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    if ($response.success) {
        $TOKEN = $response.data.token
        Write-Success "Login successful"
        Write-Info "Token: $($TOKEN.Substring(0, 20))..."
    }
    else { Write-ErrorMsg "Login failed: $($response.message)"; exit }
}
catch { Write-ErrorMsg "ERROR: $_"; exit }

# ============================================================
# GENRE TESTS
# ============================================================

Write-Header "--- GENRE API TESTS ---"

# 2. LIST GENRES
Write-Header "2. LIST GENRES"
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/genres" -Method GET `
        -Headers @{ "Authorization" = "Bearer $TOKEN" }
    $count = $response.data.data.Count
    Write-Success "Retrieved $count genres"
    foreach ($g in $response.data.data | Select-Object -First 3) {
        Write-Info "  [$($g.id)] $($g.name) (movies: $($g.movies_count))"
    }
}
catch { Write-ErrorMsg "ERROR: $_" }

# 3. CREATE GENRE
Write-Header "3. CREATE GENRE"
$genreBody = @{
    name        = "Test Genre $(Get-Date -Format 'HHmmss')"
    description = "A test genre created by API test"
    icon_url    = "https://example.com/icon-test.png"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/genres" -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $TOKEN" } `
        -Body $genreBody

    if ($response.success) {
        $GENRE_ID   = $response.data.id
        $GENRE_SLUG = $response.data.slug
        Write-Success "Genre created with ID: $GENRE_ID"
        Write-Info "  Name: $($response.data.name)"
        Write-Info "  Slug: $GENRE_SLUG"
    }
    else { Write-ErrorMsg "Failed: $($response.message)" }
}
catch { Write-ErrorMsg "ERROR: $_" }

# 4. GET GENRE DETAIL
if ($GENRE_ID) {
    Write-Header "4. GET GENRE DETAIL"
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/genres/$GENRE_ID" -Method GET `
            -Headers @{ "Authorization" = "Bearer $TOKEN" }
        Write-Success "Retrieved genre detail"
        Write-Info "  Name: $($response.data.name)"
        Write-Info "  Slug: $($response.data.slug)"
        Write-Info "  Description: $($response.data.description)"
    }
    catch { Write-ErrorMsg "ERROR: $_" }
}

# 5. UPDATE GENRE
if ($GENRE_ID) {
    Write-Header "5. UPDATE GENRE"
    $updateBody = @{
        name        = "Updated Genre Name"
        description = "Updated description"
        icon_url    = $null
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/genres/$GENRE_ID" -Method PUT `
            -ContentType "application/json" `
            -Headers @{ "Authorization" = "Bearer $TOKEN" } `
            -Body $updateBody

        Write-Success "Genre updated successfully"
        Write-Info "  New name: $($response.data.name)"
        Write-Info "  Icon URL: $($response.data.icon_url)"
    }
    catch { Write-ErrorMsg "ERROR: $_" }
}

# 6. LIST GENRES WITH SEARCH
Write-Header "6. LIST GENRES WITH SEARCH"
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/genres?search=Updated&sort_by=name&sort_dir=asc" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $TOKEN" }
    Write-Success "Search results: $($response.data.data.Count) genre(s)"
    foreach ($g in $response.data.data) {
        Write-Info "  $($g.name)"
    }
}
catch { Write-ErrorMsg "ERROR: $_" }

# 7. DELETE GENRE (Soft Delete)
if ($GENRE_ID) {
    Write-Header "7. DELETE GENRE (Soft Delete)"
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/genres/$GENRE_ID" -Method DELETE `
            -Headers @{ "Authorization" = "Bearer $TOKEN" }
        Write-Success "Genre deleted (soft delete)"
        Write-Info "  Message: $($response.message)"
    }
    catch { Write-ErrorMsg "ERROR: $_" }
}

# 8. LIST TRASHED GENRES
Write-Header "8. LIST TRASHED GENRES"
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/genres/trashed" -Method GET `
        -Headers @{ "Authorization" = "Bearer $TOKEN" }
    $count = $response.data.data.Count
    Write-Success "Retrieved $count trashed genre(s)"
    foreach ($g in $response.data.data) {
        Write-Info "  [$($g.id)] $($g.name) [Deleted: $($g.deleted_at)]"
    }
}
catch { Write-ErrorMsg "ERROR: $_" }

# 9. RESTORE GENRE
if ($GENRE_ID) {
    Write-Header "9. RESTORE GENRE"
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/genres/$GENRE_ID/restore" -Method POST `
            -Headers @{ "Authorization" = "Bearer $TOKEN" }
        Write-Success "Genre restored successfully"
        Write-Info "  Name: $($response.data.name)"
        Write-Info "  Deleted_at: $($response.data.deleted_at)"
    }
    catch { Write-ErrorMsg "ERROR: $_" }
}

# 10. TEST DUPLICATE SLUG
Write-Header "10. TEST CONFLICT (Duplicate Slug)"
$dupBody = @{
    name = "Another Genre Same Slug"
    slug = $GENRE_SLUG
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/genres" -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $TOKEN" } `
        -Body $dupBody
    Write-ErrorMsg "Should have failed but got: $($response.message)"
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Success "Conflict correctly returned (HTTP $statusCode)"
    Write-Info "  Expected conflict on duplicate slug"
}

# ============================================================
# COUNTRY TESTS
# ============================================================

Write-Header "--- COUNTRY API TESTS ---"

# 11. LIST COUNTRIES
Write-Header "11. LIST COUNTRIES"
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/countries" -Method GET `
        -Headers @{ "Authorization" = "Bearer $TOKEN" }
    $count = $response.data.data.Count
    Write-Success "Retrieved $count countries"
    foreach ($c in $response.data.data | Select-Object -First 3) {
        Write-Info "  [$($c.id)] $($c.name) [$($c.code)] (movies: $($c.movies_count))"
    }
}
catch { Write-ErrorMsg "ERROR: $_" }

# 12. CREATE COUNTRY
Write-Header "12. CREATE COUNTRY"
$secVal    = (Get-Date).Second % 26
$thirdChar = [char](65 + $secVal)
$uniqueCode = "T$thirdChar"
$countryBody = @{
    name     = "Test Country $uniqueCode"
    code     = $uniqueCode
    flag_url = "https://example.com/flag-tc.png"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/countries" -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $TOKEN" } `
        -Body $countryBody

    if ($response.success) {
        $COUNTRY_ID = $response.data.id
        Write-Success "Country created with ID: $COUNTRY_ID"
        Write-Info "  Name: $($response.data.name)"
        Write-Info "  Code: $($response.data.code)"
    }
    else { Write-ErrorMsg "Failed: $($response.message)" }
}
catch { Write-ErrorMsg "ERROR: $_" }

# 13. GET COUNTRY DETAIL
if ($COUNTRY_ID) {
    Write-Header "13. GET COUNTRY DETAIL"
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/countries/$COUNTRY_ID" -Method GET `
            -Headers @{ "Authorization" = "Bearer $TOKEN" }
        Write-Success "Retrieved country detail"
        Write-Info "  Name: $($response.data.name)"
        Write-Info "  Code: $($response.data.code)"
        Write-Info "  Flag: $($response.data.flag_url)"
    }
    catch { Write-ErrorMsg "ERROR: $_" }
}

# 14. UPDATE COUNTRY
if ($COUNTRY_ID) {
    Write-Header "14. UPDATE COUNTRY"
    $updateCountryBody = @{
        name     = "Updated Test Country"
        flag_url = $null
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/countries/$COUNTRY_ID" -Method PUT `
            -ContentType "application/json" `
            -Headers @{ "Authorization" = "Bearer $TOKEN" } `
            -Body $updateCountryBody

        Write-Success "Country updated successfully"
        Write-Info "  Name: $($response.data.name)"
        Write-Info "  Code: $($response.data.code)"
        Write-Info "  Flag: $($response.data.flag_url)"
    }
    catch { Write-ErrorMsg "ERROR: $_" }
}

# 15. LIST COUNTRIES WITH SEARCH
Write-Header "15. LIST COUNTRIES WITH SEARCH"
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/countries?search=Updated&sort_by=name" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $TOKEN" }
    Write-Success "Search results: $($response.data.data.Count) country/ies"
    foreach ($c in $response.data.data) {
        Write-Info "  $($c.name) [$($c.code)]"
    }
}
catch { Write-ErrorMsg "ERROR: $_" }

# 16. DELETE COUNTRY (Soft Delete)
if ($COUNTRY_ID) {
    Write-Header "16. DELETE COUNTRY (Soft Delete)"
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/countries/$COUNTRY_ID" -Method DELETE `
            -Headers @{ "Authorization" = "Bearer $TOKEN" }
        Write-Success "Country deleted (soft delete)"
    }
    catch { Write-ErrorMsg "ERROR: $_" }
}

# 17. LIST TRASHED COUNTRIES
Write-Header "17. LIST TRASHED COUNTRIES"
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/countries/trashed" -Method GET `
        -Headers @{ "Authorization" = "Bearer $TOKEN" }
    $count = $response.data.data.Count
    Write-Success "Retrieved $count trashed country/ies"
    foreach ($c in $response.data.data) {
        Write-Info "  [$($c.id)] $($c.name) [$($c.code)] [Deleted: $($c.deleted_at)]"
    }
}
catch { Write-ErrorMsg "ERROR: $_" }

# 18. RESTORE COUNTRY
if ($COUNTRY_ID) {
    Write-Header "18. RESTORE COUNTRY"
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/countries/$COUNTRY_ID/restore" -Method POST `
            -Headers @{ "Authorization" = "Bearer $TOKEN" }
        Write-Success "Country restored successfully"
        Write-Info "  Name: $($response.data.name)"
        Write-Info "  Deleted_at: $($response.data.deleted_at)"
    }
    catch { Write-ErrorMsg "ERROR: $_" }
}

# 19. TEST DUPLICATE CODE
Write-Header "19. TEST CONFLICT (Duplicate Country Code)"
$dupCountryBody = @{ name = "Another Country"; code = $uniqueCode } | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/countries" -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $TOKEN" } `
        -Body $dupCountryBody
    Write-ErrorMsg "Should have failed but got: $($response.message)"
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Success "Conflict correctly returned (HTTP $statusCode)"
    Write-Info "  Expected conflict on duplicate country code"
}

# 20. LOGOUT
Write-Header "20. LOGOUT"
try {
    Invoke-RestMethod -Uri "$BASE_URL/auth/logout" -Method POST `
        -Headers @{ "Authorization" = "Bearer $TOKEN" } | Out-Null
    Write-Success "Logged out successfully"
}
catch { Write-ErrorMsg "ERROR: $_" }

Write-Header "ALL CATEGORY API TESTS COMPLETED"
Write-Success "All 20 tests finished!"

