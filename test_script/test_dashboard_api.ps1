#!/usr/bin/env pwsh
# VMovies Dashboard & Stats API Test Script

$BASE_URL    = "http://127.0.0.1:8000/api"
$TOKEN       = ""

function Write-Success { Write-Host ">> $($args[0])" -ForegroundColor Green }
function Write-Fail    { Write-Host ">> $($args[0])" -ForegroundColor Red }
function Write-Info    { Write-Host "   $($args[0])" -ForegroundColor Yellow }
function Write-Header  { Write-Host "`n======== $($args[0]) ========" -ForegroundColor Cyan }

function Invoke-Api {
    param($Uri, $Method = 'GET', $Body = $null, $Token = $null)
    $headers = @{ 'Accept' = 'application/json' }
    if ($Token) { $headers['Authorization'] = "Bearer $Token" }
    $params  = @{ Uri = $Uri; Method = $Method; Headers = $headers; ContentType = 'application/json' }
    if ($Body) { $params['Body'] = ($Body | ConvertTo-Json -Depth 5) }
    return Invoke-RestMethod @params
}

# ─────────────────────────────────────────────────────────────
# 1. LOGIN
# ─────────────────────────────────────────────────────────────
Write-Header "1. LOGIN"
try {
    $r = Invoke-Api "$BASE_URL/auth/login" -Method POST -Body @{email='admin@vmovies.com';password='password'}
    $TOKEN = $r.data.token
    Write-Success "Login OK - Token: $($TOKEN.Substring(0,20))..."
} catch { Write-Fail "Login FAILED: $_"; exit }

# ─────────────────────────────────────────────────────────────
# 2. GET DASHBOARD OVERVIEW
# ─────────────────────────────────────────────────────────────
Write-Header "2. GET DASHBOARD OVERVIEW  [GET /api/admin/dashboard]"
try {
    $r = Invoke-Api "$BASE_URL/admin/dashboard" -Token $TOKEN
    Write-Success "Dashboard OK"

    $t = $r.data.totals
    Write-Info "--- Totals ---"
    Write-Info "Movies    : $($t.movies)"
    Write-Info "Episodes  : $($t.episodes)"
    Write-Info "Users     : $($t.users)"
    Write-Info "Comments  : $($t.comments)"
    Write-Info "Genres    : $($t.genres)"
    Write-Info "Countries : $($t.countries)"
    Write-Info "Directors : $($t.directors)"
    Write-Info "Actors    : $($t.actors)"

    Write-Info "--- New This Week ---"
    Write-Info "Movies  : $($r.data.new_this_week.movies)"
    Write-Info "Users   : $($r.data.new_this_week.users)"
    Write-Info "Comments: $($r.data.new_this_week.comments)"

    Write-Info "--- New This Month ---"
    Write-Info "Movies  : $($r.data.new_this_month.movies)"
    Write-Info "Users   : $($r.data.new_this_month.users)"
    Write-Info "Comments: $($r.data.new_this_month.comments)"

    Write-Info "--- Pending Actions ---"
    Write-Info "Pending comments: $($r.data.pending_actions.pending_comments)"
    Write-Info "Banned users    : $($r.data.pending_actions.banned_users)"
    Write-Info "Trashed movies  : $($r.data.pending_actions.trashed_movies)"

    Write-Info "--- Top 5 Movies (views) ---"
    foreach ($m in $r.data.top_movies) {
        Write-Info "  '$($m.title)' | views: $($m.view_count) | rating: $($m.average_rating)"
    }

    Write-Info "--- Recent 5 Movies ---"
    foreach ($m in $r.data.recent_movies) {
        Write-Info "  [$($m.id)] $($m.title) ($($m.type))"
    }

    Write-Info "--- Recent 5 Comments ---"
    foreach ($c in $r.data.recent_comments) {
        $userInfo = if ($c.user) { $c.user.name } else { "N/A" }
        Write-Info "  [$($c.id)] ${userInfo}: $($c.content.Substring(0, [Math]::Min(50,$c.content.Length)))..."
    }

    Write-Info "--- Recent 5 Users ---"
    foreach ($u in $r.data.recent_users) {
        Write-Info "  [$($u.id)] $($u.name) [$($u.role)] $($u.status)"
    }
} catch { Write-Fail "ERROR: $_" }

# ─────────────────────────────────────────────────────────────
# 3. GET MOVIE STATS
# ─────────────────────────────────────────────────────────────
Write-Header "3. GET MOVIE STATS  [GET /api/admin/stats/movies]"
try {
    $r = Invoke-Api "$BASE_URL/admin/stats/movies" -Token $TOKEN
    Write-Success "Movie stats OK"

    $ov = $r.data.overview
    Write-Info "--- Overview ---"
    Write-Info "Total movies   : $($ov.total)"
    Write-Info "Active         : $($ov.active)"
    Write-Info "Trashed        : $($ov.trashed)"
    Write-Info "Total episodes : $($ov.total_episodes)"
    Write-Info "Total views    : $($ov.total_views)"
    Write-Info "Avg rating     : $($ov.avg_rating)"
    Write-Info "Total ratings  : $($ov.total_ratings)"
    Write-Info "Total bookmarks: $($ov.total_bookmarks)"

    Write-Info "--- By Type ---"
    $r.data.by_type.PSObject.Properties | ForEach-Object { Write-Info "  $($_.Name): $($_.Value)" }

    Write-Info "--- By Status ---"
    $r.data.by_status.PSObject.Properties | ForEach-Object { Write-Info "  $($_.Name): $($_.Value)" }

    Write-Info "--- By Genre (top 5) ---"
    $r.data.by_genre | Select-Object -First 5 | ForEach-Object {
        Write-Info "  $($_.name): $($_.movies_count) movies"
    }

    Write-Info "--- By Country (top 5) ---"
    $r.data.by_country | Select-Object -First 5 | ForEach-Object {
        Write-Info "  $($_.name) [$($_.code)]: $($_.movies_count) movies"
    }

    Write-Info "--- By Release Year (last 5) ---"
    $r.data.by_release_year.PSObject.Properties | Select-Object -First 5 | ForEach-Object {
        Write-Info "  $($_.Name): $($_.Value) movies"
    }

    Write-Info "--- Top 5 Viewed ---"
    $r.data.top_viewed | Select-Object -First 5 | ForEach-Object {
        Write-Info "  '$($_.title)' | views: $($_.view_count)"
    }

    Write-Info "--- Top 5 Rated ---"
    $r.data.top_rated | Select-Object -First 5 | ForEach-Object {
        Write-Info "  '$($_.title)' | rating: $($_.average_rating)"
    }

    Write-Info "--- Top 5 Most Commented ---"
    $r.data.most_commented | Select-Object -First 5 | ForEach-Object {
        Write-Info "  '$($_.title)' | comments: $($_.comments_count)"
    }

    Write-Info "--- Top 5 Most Bookmarked ---"
    $r.data.most_bookmarked | Select-Object -First 5 | ForEach-Object {
        Write-Info "  '$($_.title)' | bookmarks: $($_.bookmarks_count)"
    }
} catch { Write-Fail "ERROR: $_" }

# ─────────────────────────────────────────────────────────────
# 4. GET USER STATS
# ─────────────────────────────────────────────────────────────
Write-Header "4. GET USER STATS  [GET /api/admin/stats/users]"
try {
    $r = Invoke-Api "$BASE_URL/admin/stats/users" -Token $TOKEN
    Write-Success "User stats OK"

    $ov = $r.data.overview
    Write-Info "--- Overview ---"
    Write-Info "Total          : $($ov.total)"
    Write-Info "Active         : $($ov.active)"
    Write-Info "Banned         : $($ov.banned)"
    Write-Info "New this week  : $($ov.new_this_week)"
    Write-Info "New this month : $($ov.new_this_month)"

    Write-Info "--- By Status ---"
    $r.data.by_status.PSObject.Properties | ForEach-Object { Write-Info "  $($_.Name): $($_.Value)" }

    Write-Info "--- By Role ---"
    foreach ($role in $r.data.by_role) {
        Write-Info "  $($role.display_name) ($($role.role)): $($role.total)"
    }

    Write-Info "--- Growth by Month (last 6) ---"
    $r.data.growth_by_month | Select-Object -Last 6 | ForEach-Object {
        Write-Info "  $($_.period): $($_.total) users"
    }

    Write-Info "--- Top 5 Commenters ---"
    $r.data.top_commenters | Select-Object -First 5 | ForEach-Object {
        Write-Info "  $($_.name): $($_.comments_count) comments"
    }

    Write-Info "--- Top 5 Bookmarkers ---"
    $r.data.top_bookmarkers | Select-Object -First 5 | ForEach-Object {
        Write-Info "  $($_.name): $($_.bookmarks_count) bookmarks"
    }

    Write-Info "--- Top 5 Raters ---"
    $r.data.top_raters | Select-Object -First 5 | ForEach-Object {
        Write-Info "  $($_.name): $($_.ratings_count) ratings"
    }
} catch { Write-Fail "ERROR: $_" }

# ─────────────────────────────────────────────────────────────
# 5. GET COMMENT STATS
# ─────────────────────────────────────────────────────────────
Write-Header "5. GET COMMENT STATS  [GET /api/admin/stats/comments]"
try {
    $r = Invoke-Api "$BASE_URL/admin/stats/comments" -Token $TOKEN
    Write-Success "Comment stats OK"

    $ov = $r.data.overview
    Write-Info "--- Overview ---"
    Write-Info "Total          : $($ov.total)"
    Write-Info "Approved       : $($ov.approved)"
    Write-Info "Pending        : $($ov.pending)"
    Write-Info "Deleted        : $($ov.deleted)"
    Write-Info "Approval rate  : $($ov.approval_rate)%"
    Write-Info "New this week  : $($ov.new_this_week)"
    Write-Info "New this month : $($ov.new_this_month)"

    Write-Info "--- By Status ---"
    Write-Info "  approved: $($r.data.by_status.approved)"
    Write-Info "  pending : $($r.data.by_status.pending)"
    Write-Info "  deleted : $($r.data.by_status.deleted)"

    Write-Info "--- Growth by Month (last 6) ---"
    $r.data.growth_by_month | Select-Object -Last 6 | ForEach-Object {
        Write-Info "  $($_.period): total=$($_.total) approved=$($_.approved)"
    }

    Write-Info "--- Top 5 Most Commented Movies ---"
    $r.data.top_movies | Select-Object -First 5 | ForEach-Object {
        Write-Info "  '$($_.title)' | comments: $($_.comments_count)"
    }

    Write-Info "--- Top 5 Commenters ---"
    $r.data.top_commenters | Select-Object -First 5 | ForEach-Object {
        Write-Info "  $($_.name): $($_.comments_count) comments"
    }

    Write-Info "--- Recent Pending Comments ($($r.data.recent_pending.Count)) ---"
    foreach ($c in $r.data.recent_pending | Select-Object -First 3) {
        $userInfo = if ($c.user) { $c.user.name } else { "N/A" }
        Write-Info "  [$($c.id)] ${userInfo}: $($c.content.Substring(0, [Math]::Min(50,$c.content.Length)))..."
    }
} catch { Write-Fail "ERROR: $_" }

# ─────────────────────────────────────────────────────────────
# 6. TEST UNAUTHORIZED ACCESS (no token)
# ─────────────────────────────────────────────────────────────
Write-Header "6. TEST UNAUTHORIZED (no token) - expect 401"
try {
    Invoke-Api "$BASE_URL/admin/dashboard" | Out-Null
    Write-Fail "Should have returned 401"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Success "Correct 401 Unauthorized (HTTP $code)"
}

# ─────────────────────────────────────────────────────────────
# 7. LOGOUT
# ─────────────────────────────────────────────────────────────
Write-Header "7. LOGOUT"
try {
    Invoke-Api "$BASE_URL/auth/logout" -Method POST -Token $TOKEN | Out-Null
    Write-Success "Logged out"
} catch { Write-Fail "ERROR: $_" }

Write-Header "ALL DASHBOARD & STATS TESTS COMPLETED"
Write-Success "7 test groups finished!"

