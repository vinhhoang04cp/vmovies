#!/usr/bin/env pwsh
# Frontend React + Auth Testing Guide

$API_URL = "http://127.0.0.1:8000/api"

Write-Host "`n===== VMovies React Frontend Setup =====" -ForegroundColor Cyan

Write-Host "`n1. INSTALL DEPENDENCIES" -ForegroundColor Green
Write-Host "   npm install"
Write-Host "   npm install react-router-dom@^6.20.0"

Write-Host "`n2. START DEV SERVER" -ForegroundColor Green
Write-Host "   npm run dev"
Write-Host "   This will start Vite at http://localhost:5173"

Write-Host "`n3. AVAILABLE PAGES" -ForegroundColor Green
Write-Host "   http://localhost:5173/login       - Login page"
Write-Host "   http://localhost:5173/register    - Register page"
Write-Host "   http://localhost:5173/dashboard   - Admin dashboard (protected)"

Write-Host "`n4. TEST CREDENTIALS" -ForegroundColor Green
Write-Host "   Email: admin@vmovies.com"
Write-Host "   Password: password"

Write-Host "`n5. API ENDPOINTS BEING CALLED" -ForegroundColor Green
Write-Host "   POST $API_URL/auth/login"
Write-Host "   POST $API_URL/auth/register"
Write-Host "   POST $API_URL/auth/logout"
Write-Host "   GET  $API_URL/auth/me"
Write-Host "   GET  $API_URL/admin/dashboard"

Write-Host "`n6. BACKEND REQUIREMENTS" -ForegroundColor Green
Write-Host "   - Backend server running on http://localhost:8000"
Write-Host "   - Database migrated (php artisan migrate:fresh --seed)"
Write-Host "   - API routes properly configured"

Write-Host "`n7. KEY FILES" -ForegroundColor Green
Write-Host "   - resources/js/Context/AuthContext.jsx       (Auth state management)"
Write-Host "   - resources/js/Pages/Auth/LoginAPI.jsx       (Login component)"
Write-Host "   - resources/js/Pages/Auth/RegisterAPI.jsx    (Register component)"
Write-Host "   - resources/js/Pages/DashboardAPI.jsx        (Dashboard component)"
Write-Host "   - resources/js/Services/apiClient.js         (API client)"
Write-Host "   - resources/js/app-router.jsx                (Main React router app)"

Write-Host "`n8. WORKFLOW" -ForegroundColor Green
Write-Host "   User clicks Login"
Write-Host "     ↓"
Write-Host "   Enters email & password"
Write-Host "     ↓"
Write-Host "   Submit calls AuthContext.login(email, password)"
Write-Host "     ↓"
Write-Host "   POST to /api/auth/login with credentials"
Write-Host "     ↓"
Write-Host "   Backend returns { success, data: { user, token } }"
Write-Host "     ↓"
Write-Host "   Token saved to localStorage"
Write-Host "     ↓"
Write-Host "   User state updated in AuthContext"
Write-Host "     ↓"
Write-Host "   Redirect to /dashboard"
Write-Host "     ↓"
Write-Host "   Dashboard fetches stats from /api/admin/dashboard"
Write-Host "     ↓"
Write-Host "   Display admin stats"

Write-Host "`n9. LOGOUT FLOW" -ForegroundColor Green
Write-Host "   User clicks Logout dropdown"
Write-Host "     ↓"
Write-Host "   Calls AuthContext.logout()"
Write-Host "     ↓"
Write-Host "   POST to /api/auth/logout with token"
Write-Host "     ↓"
Write-Host "   Token removed from localStorage"
Write-Host "     ↓"
Write-Host "   User state cleared"
Write-Host "     ↓"
Write-Host "   Redirect to /login"

Write-Host "`n10. PROTECTED ROUTES" -ForegroundColor Green
Write-Host "    /login & /register redirects to /dashboard if already logged in"
Write-Host "    /dashboard redirects to /login if NOT authenticated"

Write-Host "`n11. FEATURES IMPLEMENTED" -ForegroundColor Green
Write-Host "    ✓ Login with API"
Write-Host "    ✓ Register with API"
Write-Host "    ✓ Logout with API"
Write-Host "    ✓ Auth context state management"
Write-Host "    ✓ Token persistence in localStorage"
Write-Host "    ✓ Protected routes"
Write-Host "    ✓ Dashboard with stats"
Write-Host "    ✓ User dropdown menu"
Write-Host "    ✓ Form validation"
Write-Host "    ✓ Error handling"
Write-Host "    ✓ Loading states"

Write-Host "`n" -ForegroundColor Cyan

