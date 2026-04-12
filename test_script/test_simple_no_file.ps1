# PowerShell script to test episode creation - Step by step

$apiUrl = "http://localhost:8000/api"

# Step 1: Login
Write-Host "=== Step 1: Login ===" -ForegroundColor Cyan
$loginResponse = Invoke-RestMethod -Uri "$apiUrl/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body (@{
        email = "admin@vmovies.com"
        password = "password"
    } | ConvertTo-Json)

$token = $loginResponse.data.token
Write-Host "✓ Token: $($token.Substring(0, 20))..." -ForegroundColor Green

# Step 2: Test create episode WITH URL
Write-Host "`n=== Step 2: Create Episode with URL ===" -ForegroundColor Cyan

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$episodeData = @{
    episode_number = 5
    title = "Test Episode No File"
    arc_name = "Test Arc"
    video_url = "https://example.com/video.mp4"
    duration = 3600
} | ConvertTo-Json

Write-Host "Sending: $episodeData" -ForegroundColor Gray

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/admin/movies/1/episodes" `
    -Method Post `
    -Headers $headers `
    -Body $episodeData

Write-Host "✓ Success!" -ForegroundColor Green
Write-Host "Episode ID: $($response.data.id)" -ForegroundColor Green
Write-Host "Video URL: $($response.data.video_url)" -ForegroundColor Green

Write-Host "`n=== Step 3: Check logs ===" -ForegroundColor Cyan
$logFile = "C:\Users\vinh-code\Documents\vmovies\storage\logs\laravel.log"
Write-Host "Last 10 lines of log:" -ForegroundColor Yellow
Get-Content $logFile | Select-Object -Last 10 | ForEach-Object { Write-Host $_ -ForegroundColor Gray }

