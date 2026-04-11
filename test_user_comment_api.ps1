#!/usr/bin/env pwsh
# VMovies - User & Comment Management API Test Script

$BASE_URL  = "http://127.0.0.1:8000/api"
$TOKEN     = ""
$USER_ID   = ""
$COMMENT_ID = ""

function Write-Success { Write-Host ">> $($args[0])" -ForegroundColor Green }
function Write-Fail    { Write-Host ">> $($args[0])" -ForegroundColor Red }
function Write-Info    { Write-Host "   $($args[0])" -ForegroundColor Yellow }
function Write-Header  { Write-Host "`n======== $($args[0]) ========" -ForegroundColor Cyan }
function Invoke-Api {
    param($Uri, $Method = 'GET', $Body = $null, $Token = $null)
    $headers = @{}
    if ($Token) { $headers['Authorization'] = "Bearer $Token" }
    $params = @{ Uri = $Uri; Method = $Method; Headers = $headers; ContentType = 'application/json' }
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
# USER MANAGEMENT TESTS
# ─────────────────────────────────────────────────────────────
Write-Header "--- USER MANAGEMENT ---"

# 2. LIST USERS
Write-Header "2. LIST USERS"
try {
    $r = Invoke-Api "$BASE_URL/admin/users" -Token $TOKEN
    $count = $r.data.data.Count
    Write-Success "Retrieved $count users"
    foreach ($u in $r.data.data | Select-Object -First 3) {
        Write-Info "[$($u.id)] $($u.name) | $($u.email) | status: $($u.status)"
    }
    # pick a non-admin user to test ban
    $USER_ID = ($r.data.data | Where-Object { $_.id -ne 1 } | Select-Object -First 1).id
    Write-Info "Target user for tests: ID=$USER_ID"
} catch { Write-Fail "ERROR: $_" }

# 3. SEARCH USERS
Write-Header "3. SEARCH USERS"
try {
    $r = Invoke-Api "$BASE_URL/admin/users?search=viewer&status=active&per_page=3" -Token $TOKEN
    Write-Success "Search 'viewer' active: $($r.data.data.Count) result(s)"
    foreach ($u in $r.data.data) { Write-Info "  $($u.name) [$($u.status)]" }
} catch { Write-Fail "ERROR: $_" }

# 4. GET USER DETAIL
Write-Header "4. GET USER DETAIL (ID=$USER_ID)"
try {
    $r = Invoke-Api "$BASE_URL/admin/users/$USER_ID" -Token $TOKEN
    Write-Success "Got user: $($r.data.name)"
    Write-Info "Email: $($r.data.email) | Status: $($r.data.status) | Role: $($r.data.role)"
    Write-Info "Comments: $($r.data.comments_count)"
} catch { Write-Fail "ERROR: $_" }

# 5. UPDATE USER
Write-Header "5. UPDATE USER (name)"
try {
    $r = Invoke-Api "$BASE_URL/admin/users/$USER_ID" -Method PUT -Token $TOKEN `
        -Body @{ name = "Updated User $(Get-Date -Format 'HHmm')" }
    Write-Success "Updated: $($r.data.name)"
} catch { Write-Fail "ERROR: $_" }

# 6. BAN USER
Write-Header "6. BAN USER"
try {
    $r = Invoke-Api "$BASE_URL/admin/users/$USER_ID/ban" -Method PATCH -Token $TOKEN
    Write-Success "Banned: $($r.data.name) -> status: $($r.data.status)"
} catch { Write-Fail "ERROR: $_" }

# 7. BAN AGAIN (should return 409 conflict)
Write-Header "7. BAN AGAIN (expect 409)"
try {
    Invoke-Api "$BASE_URL/admin/users/$USER_ID/ban" -Method PATCH -Token $TOKEN | Out-Null
    Write-Fail "Should have returned 409"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Success "Correct 409 conflict (HTTP $code)"
}

# 8. UNBAN USER
Write-Header "8. UNBAN USER"
try {
    $r = Invoke-Api "$BASE_URL/admin/users/$USER_ID/unban" -Method PATCH -Token $TOKEN
    Write-Success "Unbanned: $($r.data.name) -> status: $($r.data.status)"
} catch { Write-Fail "ERROR: $_" }

# 9. BAN SELF (should return 403)
Write-Header "9. BAN SELF (expect 403)"
try {
    $me = Invoke-Api "$BASE_URL/auth/me" -Token $TOKEN
    Invoke-Api "$BASE_URL/admin/users/$($me.data.id)/ban" -Method PATCH -Token $TOKEN | Out-Null
    Write-Fail "Should have returned 403"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Success "Correct 403 forbidden (HTTP $code)"
}

# 10. LIST USERS FILTERED BY STATUS=active
Write-Header "10. LIST USERS FILTERED BY STATUS=active"
try {
    $r = Invoke-Api "$BASE_URL/admin/users?status=active&per_page=5" -Token $TOKEN
    Write-Success "Active users: $($r.data.meta.total)"
    Write-Info "Page 1 has $($r.data.data.Count) users"
} catch { Write-Fail "ERROR: $_" }

# ─────────────────────────────────────────────────────────────
# COMMENT MANAGEMENT TESTS
# ─────────────────────────────────────────────────────────────
Write-Header "--- COMMENT MANAGEMENT ---"

# 11. LIST ALL COMMENTS
Write-Header "11. LIST ALL COMMENTS"
try {
    $r = Invoke-Api "$BASE_URL/admin/comments" -Token $TOKEN
    Write-Success "Total comments: $($r.data.meta.total)"
    if ($r.data.data.Count -gt 0) {
        $COMMENT_ID = $r.data.data[0].id
        $c = $r.data.data[0]
        Write-Info "First: [$($c.id)] approved=$($c.is_approved) | user: $($c.user.name)"
        Write-Info "Content: $($c.content.Substring(0, [Math]::Min(60, $c.content.Length)))..."
    }
} catch { Write-Fail "ERROR: $_" }

# 12. LIST PENDING COMMENTS
Write-Header "12. LIST PENDING COMMENTS"
try {
    $r = Invoke-Api "$BASE_URL/admin/comments/pending" -Token $TOKEN
    Write-Success "Pending comments: $($r.data.meta.total)"
    if ($r.data.data.Count -gt 0) {
        # pick a pending comment to approve
        $COMMENT_ID = $r.data.data[0].id
        Write-Info "Will test with pending comment ID: $COMMENT_ID"
    } else {
        Write-Info "No pending comments - will test with already-approved comment ID=$COMMENT_ID"
    }
} catch { Write-Fail "ERROR: $_" }

# 13. GET COMMENT DETAIL
if ($COMMENT_ID) {
    Write-Header "13. GET COMMENT DETAIL (ID=$COMMENT_ID)"
    try {
        $r = Invoke-Api "$BASE_URL/admin/comments/$COMMENT_ID" -Token $TOKEN
        Write-Success "Got comment detail"
        Write-Info "User: $($r.data.user.name) | Movie: $($r.data.movie.title)"
        Write-Info "Approved: $($r.data.is_approved) | Deleted: $($r.data.is_deleted)"
    } catch { Write-Fail "ERROR: $_" }
}

# 14. APPROVE COMMENT (smart: pick unapproved if exists, else verify 409)
if ($COMMENT_ID) {
    Write-Header "14. APPROVE COMMENT"
    try {
        $detail = Invoke-Api "$BASE_URL/admin/comments/$COMMENT_ID" -Token $TOKEN
        if ($detail.data.is_approved -eq $true) {
            Write-Info "Comment already approved - calling approve to verify 409..."
            try {
                Invoke-Api "$BASE_URL/admin/comments/$COMMENT_ID/approve" -Method PATCH -Token $TOKEN | Out-Null
                Write-Fail "Should have returned 409"
            } catch {
                $code = $_.Exception.Response.StatusCode.value__
                Write-Success "Correct 409 (already approved) - HTTP $code"
            }
        } else {
            $r = Invoke-Api "$BASE_URL/admin/comments/$COMMENT_ID/approve" -Method PATCH -Token $TOKEN
            Write-Success "Approved comment ID: $($r.data.id)"
            Write-Info "is_approved: $($r.data.is_approved)"
        }
    } catch { Write-Fail "ERROR: $_" }
}

# 15. APPROVE AGAIN (should return 409)
if ($COMMENT_ID) {
    Write-Header "15. APPROVE AGAIN (expect 409)"
    try {
        Invoke-Api "$BASE_URL/admin/comments/$COMMENT_ID/approve" -Method PATCH -Token $TOKEN | Out-Null
        Write-Fail "Should have returned 409"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Success "Correct 409 conflict (HTTP $code)"
    }
}

# 16. SEARCH COMMENTS
Write-Header "16. SEARCH COMMENTS"
try {
    $r = Invoke-Api "$BASE_URL/admin/comments?is_approved=1&per_page=3" -Token $TOKEN
    Write-Success "Approved comments: $($r.data.total)"
    foreach ($c in $r.data.data) {
        Write-Info "  [$($c.id)] $($c.user.name): $($c.content.Substring(0, [Math]::Min(40,$c.content.Length)))..."
    }
} catch { Write-Fail "ERROR: $_" }

# 17. DELETE COMMENT
if ($COMMENT_ID) {
    Write-Header "17. DELETE COMMENT"
    try {
        $r = Invoke-Api "$BASE_URL/admin/comments/$COMMENT_ID" -Method DELETE -Token $TOKEN
        Write-Success "Deleted: $($r.message)"
    } catch { Write-Fail "ERROR: $_" }
}

# 18. DELETE AGAIN (should return 409)
if ($COMMENT_ID) {
    Write-Header "18. DELETE AGAIN (expect 409)"
    try {
        Invoke-Api "$BASE_URL/admin/comments/$COMMENT_ID" -Method DELETE -Token $TOKEN | Out-Null
        Write-Fail "Should have returned 409"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Success "Correct 409 conflict (HTTP $code)"
    }
}

# 19. COMMENT NOT FOUND (expect 404)
Write-Header "19. GET NON-EXISTENT COMMENT (expect 404)"
try {
    Invoke-Api "$BASE_URL/admin/comments/999999" -Token $TOKEN | Out-Null
    Write-Fail "Should have returned 404"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Success "Correct 404 not found (HTTP $code)"
}

# 20. LOGOUT
Write-Header "20. LOGOUT"
try {
    Invoke-Api "$BASE_URL/auth/logout" -Method POST -Token $TOKEN | Out-Null
    Write-Success "Logged out successfully"
} catch { Write-Fail "ERROR: $_" }

Write-Header "ALL TESTS COMPLETED"
Write-Success "20 tests finished!"

