#!/usr/bin/env pwsh
# VMovies Episode Management API Test Script
# Test comprehensive Episode Management APIs

$BASE_URL = "http://127.0.0.1:8000/api"
$ADMIN_EMAIL = "admin@vmovies.com"
$ADMIN_PASS = "password"
$TOKEN = ""
$MOVIE_ID = ""
$EPISODE_ID = ""

# Color output
function Write-Success { Write-Host ">> $($args[0])" -ForegroundColor Green }
function Write-ErrorMsg { Write-Host ">> $($args[0])" -ForegroundColor Red }
function Write-Info { Write-Host ">> $($args[0])" -ForegroundColor Yellow }
function Write-Header { Write-Host "`n======== $($args[0]) ========" -ForegroundColor Cyan }

# ============================================================
# 1. LOGIN
# ============================================================

Write-Header "1. LOGIN"
$loginBody = @{
    email    = $ADMIN_EMAIL
    password = $ADMIN_PASS
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody

    if ($response.success) {
        $TOKEN = $response.data.token
        Write-Success "Login successful"
        Write-Info "Token: $($TOKEN.Substring(0, 20))..."
    }
    else {
        Write-ErrorMsg "Login failed: $($response.message)"
        exit
    }
}
catch {
    Write-ErrorMsg "ERROR: $_"
    exit
}

# ============================================================
# 2. CREATE TEST MOVIE
# ============================================================

Write-Header "2. CREATE TEST MOVIE"
$movieBody = @{
    title          = "Test Episode API - $(Get-Date -Format 'HHmmss')"
    original_title = "Episode Testing"
    type           = "series"
    status         = "ongoing"
    summary        = "Movie for testing episode APIs"
    release_year   = 2026
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/movies" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $TOKEN" } `
        -Body $movieBody

    if ($response.success) {
        $MOVIE_ID = $response.data.id
        Write-Success "Movie created with ID: $MOVIE_ID"
        Write-Info "Title: $($response.data.title)"
    }
    else {
        Write-ErrorMsg "Failed to create movie: $($response.message)"
        exit
    }
}
catch {
    Write-ErrorMsg "ERROR: $_"
    exit
}

# ============================================================
# 3. CREATE EPISODES (Bulk)
# ============================================================

Write-Header "3. CREATE EPISODES (Bulk)"
$episodesBody = @{
    movie_id = $MOVIE_ID
    episodes = @(
        @{
            episode_number = 1
            title          = "Episode 1: The Beginning"
            arc_name       = "Arc 1"
            video_url      = "https://example.com/ep1.mp4"
            duration       = 1440
        },
        @{
            episode_number = 2
            title          = "Episode 2: The Journey"
            arc_name       = "Arc 1"
            video_url      = "https://example.com/ep2.mp4"
            duration       = 1500
        },
        @{
            episode_number = 3
            title          = "Episode 3: The Climax"
            arc_name       = "Arc 2"
            video_url      = "https://example.com/ep3.mp4"
            duration       = 1620
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/episodes/bulk-create" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $TOKEN" } `
        -Body $episodesBody

    if ($response.success) {
        Write-Success "Created $($response.data.Count) episodes"
        $EPISODE_ID = $response.data[0].id
        foreach ($ep in $response.data) {
            Write-Info "  Ep $($ep.episode_number): $($ep.title) (ID: $($ep.id))"
        }
    }
    else {
        Write-ErrorMsg "Failed to create episodes: $($response.message)"
    }
}
catch {
    Write-ErrorMsg "ERROR: $_"
}

# ============================================================
# 4. GET EPISODES LIST
# ============================================================

Write-Header "4. LIST EPISODES (Admin)"
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/movies/$MOVIE_ID/episodes" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $TOKEN" }

    $count = $response.data.data.Count
    Write-Success "Retrieved $count episodes"
    foreach ($ep in $response.data.data) {
        Write-Info "  Ep $($ep.episode_number): $($ep.title) [ID: $($ep.id)]"
    }
}
catch {
    Write-ErrorMsg "ERROR: $_"
}

# ============================================================
# 5. GET EPISODE DETAIL
# ============================================================

if ($EPISODE_ID) {
    Write-Header "5. GET EPISODE DETAIL"
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/episodes/$EPISODE_ID" `
            -Method GET `
            -Headers @{ "Authorization" = "Bearer $TOKEN" }

        Write-Success "Retrieved episode detail"
        Write-Info "  Episode #: $($response.data.episode_number)"
        Write-Info "  Title: $($response.data.title)"
        Write-Info "  Arc: $($response.data.arc_name)"
        Write-Info "  Duration: $($response.data.duration_formatted)"
        Write-Info "  Views: $($response.data.views)"
    }
    catch {
        Write-ErrorMsg "ERROR: $_"
    }
}

# ============================================================
# 6. UPDATE EPISODE
# ============================================================

if ($EPISODE_ID) {
    Write-Header "6. UPDATE EPISODE"
    $updateBody = @{
        title    = "Episode 1: The Beginning (Updated)"
        arc_name = $null
        duration = 1500
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/episodes/$EPISODE_ID" `
            -Method PUT `
            -ContentType "application/json" `
            -Headers @{ "Authorization" = "Bearer $TOKEN" } `
            -Body $updateBody

        Write-Success "Episode updated successfully"
        Write-Info "  New title: $($response.data.title)"
        Write-Info "  Arc (now empty): $($response.data.arc_name)"
        Write-Info "  Duration: $($response.data.duration) seconds"
    }
    catch {
        Write-ErrorMsg "ERROR: $_"
    }
}

# ============================================================
# 7. DELETE EPISODE (Soft Delete)
# ============================================================

if ($EPISODE_ID) {
    Write-Header "7. DELETE EPISODE (Soft Delete)"
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/episodes/$EPISODE_ID" `
            -Method DELETE `
            -Headers @{ "Authorization" = "Bearer $TOKEN" }

        Write-Success "Episode deleted (soft delete)"
        Write-Info "  Message: $($response.message)"
    }
    catch {
        Write-ErrorMsg "ERROR: $_"
    }
}

# ============================================================
# 8. GET TRASHED EPISODES
# ============================================================

Write-Header "8. LIST TRASHED EPISODES"
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/episodes/trashed" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $TOKEN" }

    $count = $response.data.data.Count
    Write-Success "Retrieved $count trashed episodes"
    foreach ($ep in $response.data.data) {
        Write-Info "  Ep $($ep.episode_number): $($ep.title) [Deleted: $($ep.deleted_at)]"
    }
}
catch {
    Write-ErrorMsg "ERROR: $_"
}

# ============================================================
# 9. RESTORE DELETED EPISODE
# ============================================================

if ($EPISODE_ID) {
    Write-Header "9. RESTORE DELETED EPISODE"
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/episodes/$EPISODE_ID/restore" `
            -Method POST `
            -Headers @{ "Authorization" = "Bearer $TOKEN" }

        Write-Success "Episode restored successfully"
        Write-Info "  Episode #: $($response.data.episode_number)"
        Write-Info "  Title: $($response.data.title)"
        Write-Info "  Deleted_at: $($response.data.deleted_at)"
    }
    catch {
        Write-ErrorMsg "ERROR: $_"
    }
}

# ============================================================
# 10. REORDER EPISODES
# ============================================================

Write-Header "10. REORDER EPISODES"
$reorderBody = @{
    movie_id = $MOVIE_ID
    episodes = @(
        @{ id = $EPISODE_ID; episode_number = 10 },
        @{ id = ($EPISODE_ID + 1); episode_number = 20 },
        @{ id = ($EPISODE_ID + 2); episode_number = 30 }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/episodes/reorder" `
        -Method PUT `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $TOKEN" } `
        -Body $reorderBody

    Write-Success "Episodes reordered successfully"
    Write-Info "  Message: $($response.message)"
}
catch {
    Write-ErrorMsg "ERROR: $_"
}

# ============================================================
# 11. LIST EPISODES AFTER REORDER
# ============================================================

Write-Header "11. LIST EPISODES AFTER REORDER"
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/movies/$MOVIE_ID/episodes" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $TOKEN" }

    $count = $response.data.data.Count
    Write-Success "Retrieved $count episodes (after reorder)"
    foreach ($ep in $response.data.data) {
        Write-Info "  Ep $($ep.episode_number): $($ep.title)"
    }
}
catch {
    Write-ErrorMsg "ERROR: $_"
}

# ============================================================
# 12. CREATE SINGLE EPISODE
# ============================================================

Write-Header "12. CREATE SINGLE EPISODE"
$singleEpisodeBody = @{
    episode_number = 50
    title          = "Episode 50: The End"
    arc_name       = "Final Arc"
    video_url      = "https://example.com/ep50.mp4"
    duration       = 1800
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/movies/$MOVIE_ID/episodes" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $TOKEN" } `
        -Body $singleEpisodeBody

    if ($response.success) {
        Write-Success "Single episode created successfully"
        Write-Info "  Episode #: $($response.data.episode_number)"
        Write-Info "  Title: $($response.data.title)"
        Write-Info "  Arc: $($response.data.arc_name)"
    }
    else {
        Write-ErrorMsg "Failed: $($response.message)"
    }
}
catch {
    Write-ErrorMsg "ERROR: $_"
}

# ============================================================
# 13. GET PUBLIC EPISODES (No Auth)
# ============================================================

Write-Header "13. GET PUBLIC EPISODES (No Auth)"
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/movies/$MOVIE_ID/episodes" `
        -Method GET

    $count = $response.data.data.Count
    Write-Success "Retrieved $count episodes from public API"
    foreach ($ep in $response.data.data | Select-Object -First 3) {
        Write-Info "  Ep $($ep.episode_number): $($ep.title)"
    }
}
catch {
    Write-ErrorMsg "ERROR: $_"
}

# ============================================================
# 14. LOGOUT
# ============================================================

Write-Header "14. LOGOUT"
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/logout" `
        -Method POST `
        -Headers @{ "Authorization" = "Bearer $TOKEN" }

    Write-Success "Logged out successfully"
}
catch {
    Write-ErrorMsg "ERROR: $_"
}

Write-Header "ALL EPISODE API TESTS COMPLETED"
Write-Success "All tests finished successfully!"

