#!/usr/bin/env pwsh
# VMovies API Test Script (PowerShell)

$BASE_URL = "http://127.0.0.1:8000/api"
$ADMIN_EMAIL = "admin@vmovies.com"
$ADMIN_PASS = "password"
$TOKEN = ""

# Color output
function Write-Success { Write-Host $args[0] -ForegroundColor Green }
function Write-ErrorMsg { Write-Host $args[0] -ForegroundColor Red }
function Write-Info { Write-Host $args[0] -ForegroundColor Yellow }

# ============================================================
# 1. LOGIN
# ============================================================

Write-Info "`n========== 1. LOGIN =========="
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
        Write-Success "SUCCESS: Login ok"
        Write-Info "Token: $($TOKEN.Substring(0, 20))..."
    } else {
        Write-ErrorMsg "FAILED: $($response.message)"
        exit
    }
} catch {
    Write-ErrorMsg "ERROR: $_"
    exit
}

# ============================================================
# 2. GET PUBLIC MOVIES
# ============================================================

Write-Info "`n========== 2. GET PUBLIC MOVIES (No Auth) =========="
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/movies" -Method GET
    $count = $response.data.data.Count
    Write-Success "SUCCESS: Got $count movies"
} catch {
    Write-ErrorMsg "ERROR: $_"
}

# ============================================================
# 3. CREATE MOVIE
# ============================================================

Write-Info "`n========== 3. CREATE MOVIE (Admin Only) =========="
$movieBody = @{
    title          = "Natsume Yuujinchou"
    original_title = "Natsume's Book of Friends"
    type           = "series"
    status         = "ongoing"
    summary        = "A supernatural story about a boy and spirits"
    release_year   = 2008
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/movies" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $TOKEN" } `
        -Body $movieBody

    if ($response.success) {
        $MOVIE_ID = $response.data.id
        Write-Success "SUCCESS: Movie created. ID: $MOVIE_ID"
    } else {
        Write-ErrorMsg "FAILED: $($response.message)"
    }
} catch {
    Write-ErrorMsg "ERROR: $_"
}

# ============================================================
# 4. GET MOVIE DETAIL
# ============================================================

if ($MOVIE_ID) {
    Write-Info "`n========== 4. GET MOVIE DETAIL =========="
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/movies/$MOVIE_ID" `
            -Method GET `
            -Headers @{ "Authorization" = "Bearer $TOKEN" }

        Write-Success "SUCCESS: Got movie detail"
        Write-Info "Title: $($response.data.title)"
        Write-Info "Type: $($response.data.type)"
    } catch {
        Write-ErrorMsg "ERROR: $_"
    }
}

# ============================================================
# 5. CREATE EPISODES (BULK)
# ============================================================

if ($MOVIE_ID) {
    Write-Info "`n========== 5. CREATE EPISODES (Bulk) =========="
    $episodesBody = @{
        movie_id = $MOVIE_ID
        episodes = @(
            @{
                episode_number = 1
                title          = "New Friend"
                video_url      = "https://example.com/ep1.mp4"
                duration       = 1440
            },
            @{
                episode_number = 2
                title          = "Lucky Charm"
                video_url      = "https://example.com/ep2.mp4"
                duration       = 1440
            },
            @{
                episode_number = 3
                title          = "Wishing"
                video_url      = "https://example.com/ep3.mp4"
                duration       = 1440
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
            Write-Success "SUCCESS: Created $($response.data.Count) episodes"
        } else {
            Write-ErrorMsg "FAILED: $($response.message)"
        }
    } catch {
        Write-ErrorMsg "ERROR: $_"
    }
}

# ============================================================
# 6. GET EPISODES LIST (Admin)
# ============================================================

if ($MOVIE_ID) {
    Write-Info "`n========== 6. GET EPISODES (Admin) =========="
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/movies/$MOVIE_ID/episodes" `
            -Method GET `
            -Headers @{ "Authorization" = "Bearer $TOKEN" }

        $count = $response.data.data.Count
        Write-Success "SUCCESS: Got $count episodes"
        foreach ($ep in $response.data.data) {
            Write-Info "  Ep $($ep.episode_number): $($ep.title)"
        }
    } catch {
        Write-ErrorMsg "ERROR: $_"
    }
}

# ============================================================
# 7. GET EPISODES LIST (Public)
# ============================================================

if ($MOVIE_ID) {
    Write-Info "`n========== 7. GET EPISODES (Public - No Auth) =========="
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/movies/$MOVIE_ID/episodes" `
            -Method GET

        $count = $response.data.data.Count
        Write-Success "SUCCESS: Got $count episodes from public API"
    } catch {
        Write-ErrorMsg "ERROR: $_"
    }
}

# ============================================================
# 8. UPDATE MOVIE
# ============================================================

if ($MOVIE_ID) {
    Write-Info "`n========== 8. UPDATE MOVIE =========="
    $updateBody = @{
        summary = "Updated story about a boy and spirits"
        status  = "completed"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/admin/movies/$MOVIE_ID" `
            -Method PUT `
            -ContentType "application/json" `
            -Headers @{ "Authorization" = "Bearer $TOKEN" } `
            -Body $updateBody

        Write-Success "SUCCESS: Movie updated"
        Write-Info "New status: $($response.data.status)"
    } catch {
        Write-ErrorMsg "ERROR: $_"
    }
}

# ============================================================
# 9. LIST MOVIES (Admin)
# ============================================================

Write-Info "`n========== 9. LIST MOVIES (Admin) =========="
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/admin/movies" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $TOKEN" }

    $count = $response.data.data.Count
    Write-Success "SUCCESS: Got $count movies from admin API"
} catch {
    Write-ErrorMsg "ERROR: $_"
}

# ============================================================
# 10. GET FIRST EPISODE DETAIL
# ============================================================

if ($MOVIE_ID) {
    Write-Info "`n========== 10. GET EPISODE DETAIL =========="
    try {
        $eps = Invoke-RestMethod -Uri "$BASE_URL/admin/movies/$MOVIE_ID/episodes" `
            -Method GET `
            -Headers @{ "Authorization" = "Bearer $TOKEN" }

        if ($eps.data.data.Count -gt 0) {
            $episodeId = $eps.data.data[0].id
            $epResponse = Invoke-RestMethod -Uri "$BASE_URL/admin/episodes/$episodeId" `
                -Method GET `
                -Headers @{ "Authorization" = "Bearer $TOKEN" }

            Write-Success "SUCCESS: Got episode detail"
            Write-Info "Episode $($epResponse.data.episode_number): $($epResponse.data.title)"
        }
    } catch {
        Write-ErrorMsg "ERROR: $_"
    }
}

# ============================================================
# 11. LOGOUT
# ============================================================

Write-Info "`n========== 11. LOGOUT =========="
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/logout" `
        -Method POST `
        -Headers @{ "Authorization" = "Bearer $TOKEN" }

    Write-Success "SUCCESS: Logged out"
} catch {
    Write-ErrorMsg "ERROR: $_"
}

Write-Success "`n========== ALL TESTS COMPLETED ==========="

