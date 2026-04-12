#!/usr/bin/env pwsh
# VMovies Personnel Management API Test Script
# Test CRUD Directors + Actors

$BASE_URL = "http://127.0.0.1:8000/api"
$ADMIN_EMAIL = "admin@vmovies.com"
$ADMIN_PASS = "password"
$TOKEN = ""
$DIRECTOR_ID = ""
$ACTOR_ID = ""

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
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST `
        -ContentType "application/json" -Body $loginBody
    if ($response.success) {
        $TOKEN = $response.data.token
        Write-Success "Login successful"
        Write-Info "Token: $($TOKEN.Substring(0, 20))..."
    }
    else { Write-ErrorMsg "Login failed: $($response.message)"; exit }
}
catch { Write-ErrorMsg "ERROR: $_"; exit }

# ============================================================
# DIRECTOR TESTS
# ============================================================

Write-Header "--- DIRECTOR API TESTS ---"

# 2. LIST DIRECTORS
Write-Header "2. LIST DIRECTORS"
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/directors" -Method GET `
        -Headers @{ "Authorization" = "Bearer $TOKEN" }
    $count = $response.data.data.Count
    Write-Success "Retrieved $count directors"
    foreach ($d in $response.data.data | Select-Object -First 3) {
        Write-Info "  [$($d.id)] $($d.name) (movies: $($d.movies_count))"
    }
}
catch { Write-ErrorMsg "ERROR: $_" }

# 3. CREATE DIRECTOR
Write-Header "3. CREATE DIRECTOR"
$directorBody = @{
    name      = "Hayao Miyazaki"
    bio       = "Japanese animator, director, producer, screenwriter, and manga artist."
    image_url = "https://example.com/miyazaki.jpg"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/directors" -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $TOKEN" } `
        -Body $directorBody

    if ($response.success) {
        $DIRECTOR_ID = $response.data.id
        Write-Success "Director created with ID: $DIRECTOR_ID"
        Write-Info "  Name: $($response.data.name)"
        Write-Info "  Bio: $($response.data.bio.Substring(0, 40))..."
    }
    else { Write-ErrorMsg "Failed: $($response.message)" }
}
catch { Write-ErrorMsg "ERROR: $_" }

# 4. GET DIRECTOR DETAIL
if ($DIRECTOR_ID) {
    Write-Header "4. GET DIRECTOR DETAIL"
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/directors/$DIRECTOR_ID" -Method GET `
            -Headers @{ "Authorization" = "Bearer $TOKEN" }
        Write-Success "Retrieved director detail"
        Write-Info "  Name: $($response.data.name)"
        Write-Info "  Image: $($response.data.image_url)"
        Write-Info "  Movies count: $($response.data.movies_count)"
    }
    catch { Write-ErrorMsg "ERROR: $_" }
}

# 5. UPDATE DIRECTOR
if ($DIRECTOR_ID) {
    Write-Header "5. UPDATE DIRECTOR"
    $updateBody = @{
        name      = "Hayao Miyazaki (Updated)"
        bio       = $null
        image_url = "https://example.com/miyazaki-new.jpg"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/directors/$DIRECTOR_ID" -Method PUT `
            -ContentType "application/json" `
            -Headers @{ "Authorization" = "Bearer $TOKEN" } `
            -Body $updateBody

        Write-Success "Director updated successfully"
        Write-Info "  Name: $($response.data.name)"
        Write-Info "  Bio (cleared): $($response.data.bio)"
        Write-Info "  Image: $($response.data.image_url)"
    }
    catch { Write-ErrorMsg "ERROR: $_" }
}

# 6. SEARCH DIRECTORS
Write-Header "6. SEARCH DIRECTORS"
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/directors?search=Miyazaki&sort_by=name" `
        -Method GET -Headers @{ "Authorization" = "Bearer $TOKEN" }
    Write-Success "Search results: $($response.data.data.Count) director(s)"
    foreach ($d in $response.data.data) {
        Write-Info "  $($d.name)"
    }
}
catch { Write-ErrorMsg "ERROR: $_" }

# 7. DELETE DIRECTOR (Soft Delete)
if ($DIRECTOR_ID) {
    Write-Header "7. DELETE DIRECTOR (Soft Delete)"
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/directors/$DIRECTOR_ID" -Method DELETE `
            -Headers @{ "Authorization" = "Bearer $TOKEN" }
        Write-Success "Director deleted (soft delete)"
    }
    catch { Write-ErrorMsg "ERROR: $_" }
}

# 8. LIST TRASHED DIRECTORS
Write-Header "8. LIST TRASHED DIRECTORS"
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/directors/trashed" -Method GET `
        -Headers @{ "Authorization" = "Bearer $TOKEN" }
    $count = $response.data.data.Count
    Write-Success "Retrieved $count trashed director(s)"
    foreach ($d in $response.data.data) {
        Write-Info "  [$($d.id)] $($d.name) [Deleted: $($d.deleted_at)]"
    }
}
catch { Write-ErrorMsg "ERROR: $_" }

# 9. RESTORE DIRECTOR
if ($DIRECTOR_ID) {
    Write-Header "9. RESTORE DIRECTOR"
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/directors/$DIRECTOR_ID/restore" -Method POST `
            -Headers @{ "Authorization" = "Bearer $TOKEN" }
        Write-Success "Director restored successfully"
        Write-Info "  Name: $($response.data.name)"
        Write-Info "  Deleted_at: $($response.data.deleted_at)"
    }
    catch { Write-ErrorMsg "ERROR: $_" }
}

# 10. GET DIRECTOR DETAIL AFTER RESTORE
if ($DIRECTOR_ID) {
    Write-Header "10. VERIFY DIRECTOR AFTER RESTORE"
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/directors/$DIRECTOR_ID" -Method GET `
            -Headers @{ "Authorization" = "Bearer $TOKEN" }
        Write-Success "Director still accessible after restore"
        Write-Info "  Name: $($response.data.name)"
    }
    catch { Write-ErrorMsg "ERROR: $_" }
}

# ============================================================
# ACTOR TESTS
# ============================================================

Write-Header "--- ACTOR API TESTS ---"

# 11. LIST ACTORS
Write-Header "11. LIST ACTORS"
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/actors" -Method GET `
        -Headers @{ "Authorization" = "Bearer $TOKEN" }
    $count = $response.data.data.Count
    Write-Success "Retrieved $count actors"
    foreach ($a in $response.data.data | Select-Object -First 3) {
        Write-Info "  [$($a.id)] $($a.name) (movies: $($a.movies_count))"
    }
}
catch { Write-ErrorMsg "ERROR: $_" }

# 12. CREATE ACTOR
Write-Header "12. CREATE ACTOR"
$actorBody = @{
    name      = "Test Actor $(Get-Date -Format 'HHmmss')"
    bio       = "A talented actor from the test suite."
    image_url = "https://example.com/actor-test.jpg"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/actors" -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $TOKEN" } `
        -Body $actorBody

    if ($response.success) {
        $ACTOR_ID = $response.data.id
        Write-Success "Actor created with ID: $ACTOR_ID"
        Write-Info "  Name: $($response.data.name)"
    }
    else { Write-ErrorMsg "Failed: $($response.message)" }
}
catch { Write-ErrorMsg "ERROR: $_" }

# 13. GET ACTOR DETAIL
if ($ACTOR_ID) {
    Write-Header "13. GET ACTOR DETAIL"
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/actors/$ACTOR_ID" -Method GET `
            -Headers @{ "Authorization" = "Bearer $TOKEN" }
        Write-Success "Retrieved actor detail"
        Write-Info "  Name: $($response.data.name)"
        Write-Info "  Bio: $($response.data.bio)"
        Write-Info "  Movies count: $($response.data.movies_count)"
    }
    catch { Write-ErrorMsg "ERROR: $_" }
}

# 14. UPDATE ACTOR
if ($ACTOR_ID) {
    Write-Header "14. UPDATE ACTOR"
    $updateActorBody = @{
        name      = "Updated Actor Name"
        bio       = "Updated bio for the actor."
        image_url = $null
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/actors/$ACTOR_ID" -Method PUT `
            -ContentType "application/json" `
            -Headers @{ "Authorization" = "Bearer $TOKEN" } `
            -Body $updateActorBody

        Write-Success "Actor updated successfully"
        Write-Info "  Name: $($response.data.name)"
        Write-Info "  Bio: $($response.data.bio)"
        Write-Info "  Image (cleared): $($response.data.image_url)"
    }
    catch { Write-ErrorMsg "ERROR: $_" }
}

# 15. SEARCH ACTORS
Write-Header "15. SEARCH ACTORS"
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/actors?search=Updated&sort_by=name&per_page=5" `
        -Method GET -Headers @{ "Authorization" = "Bearer $TOKEN" }
    Write-Success "Search results: $($response.data.data.Count) actor(s)"
    foreach ($a in $response.data.data) {
        Write-Info "  $($a.name)"
    }
}
catch { Write-ErrorMsg "ERROR: $_" }

# 16. SORT BY movies_count
Write-Header "16. LIST ACTORS SORTED BY MOVIES COUNT"
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/actors?sort_by=movies_count&sort_dir=desc&per_page=3" `
        -Method GET -Headers @{ "Authorization" = "Bearer $TOKEN" }
    Write-Success "Top 3 actors by movies count"
    foreach ($a in $response.data.data) {
        Write-Info "  $($a.name) (movies: $($a.movies_count))"
    }
}
catch { Write-ErrorMsg "ERROR: $_" }

# 17. DELETE ACTOR (Soft Delete)
if ($ACTOR_ID) {
    Write-Header "17. DELETE ACTOR (Soft Delete)"
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/actors/$ACTOR_ID" -Method DELETE `
            -Headers @{ "Authorization" = "Bearer $TOKEN" }
        Write-Success "Actor deleted (soft delete)"
    }
    catch { Write-ErrorMsg "ERROR: $_" }
}

# 18. LIST TRASHED ACTORS
Write-Header "18. LIST TRASHED ACTORS"
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/actors/trashed" -Method GET `
        -Headers @{ "Authorization" = "Bearer $TOKEN" }
    $count = $response.data.data.Count
    Write-Success "Retrieved $count trashed actor(s)"
    foreach ($a in $response.data.data) {
        Write-Info "  [$($a.id)] $($a.name) [Deleted: $($a.deleted_at)]"
    }
}
catch { Write-ErrorMsg "ERROR: $_" }

# 19. RESTORE ACTOR
if ($ACTOR_ID) {
    Write-Header "19. RESTORE ACTOR"
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/actors/$ACTOR_ID/restore" -Method POST `
            -Headers @{ "Authorization" = "Bearer $TOKEN" }
        Write-Success "Actor restored successfully"
        Write-Info "  Name: $($response.data.name)"
        Write-Info "  Deleted_at: $($response.data.deleted_at)"
    }
    catch { Write-ErrorMsg "ERROR: $_" }
}

# 20. TEST VALIDATION (missing name)
Write-Header "20. TEST VALIDATION (Missing Required Field)"
$invalidBody = @{ bio = "bio without name" } | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$BASE_URL/admin/actors" -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $TOKEN" } `
        -Body $invalidBody `
        -ErrorAction Stop | Out-Null
    Write-ErrorMsg "Should have failed validation"
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Success "Validation correctly returned (HTTP $statusCode)"
    Write-Info "  Missing 'name' field correctly rejected"
}

# 21. LOGOUT
Write-Header "21. LOGOUT"
try {
    Invoke-RestMethod -Uri "$BASE_URL/auth/logout" -Method POST `
        -Headers @{ "Authorization" = "Bearer $TOKEN" } | Out-Null
    Write-Success "Logged out successfully"
}
catch { Write-ErrorMsg "ERROR: $_" }

Write-Header "ALL PERSONNEL API TESTS COMPLETED"
Write-Success "All 21 tests finished!"

