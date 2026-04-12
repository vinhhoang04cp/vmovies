# PowerShell script to test episode video upload

$token = "YOUR_TOKEN_HERE"  # Get from login response
$movieId = 1  # Change this to your movie ID
$apiUrl = "http://localhost:8000/api"

# Create a test video file (small dummy file)
$testVideoPath = "C:\temp\test_video.mp4"
$tempDir = "C:\temp"

if (-not (Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
}

# Create a small dummy video file (100KB)
if (-not (Test-Path $testVideoPath)) {
    $dummyData = New-Object System.Byte[] 102400
    [Random]::new().NextBytes($dummyData)
    [System.IO.File]::WriteAllBytes($testVideoPath, $dummyData)
    Write-Host "Created test video: $testVideoPath" -ForegroundColor Green
}

# Step 1: Login to get token
Write-Host "`n=== Step 1: Login ===" -ForegroundColor Cyan
$loginResponse = Invoke-RestMethod -Uri "$apiUrl/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body (@{
        email = "admin@vmovies.com"
        password = "password"
    } | ConvertTo-Json)

$token = $loginResponse.data.token
Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Green

# Step 2: Upload episode with video
Write-Host "`n=== Step 2: Upload Episode with Video ===" -ForegroundColor Cyan

$headers = @{
    "Authorization" = "Bearer $token"
}

# Create multipart form
$boundary = [Guid]::NewGuid().ToString()
$bodyLines = @(
    "--$boundary"
    'Content-Disposition: form-data; name="episode_number"'
    ""
    "1"
    "--$boundary"
    'Content-Disposition: form-data; name="title"'
    ""
    "Test Episode"
    "--$boundary"
    'Content-Disposition: form-data; name="arc_name"'
    ""
    "Test Arc"
    "--$boundary"
    'Content-Disposition: form-data; name="duration"'
    ""
    "3600"
    "--$boundary"
    'Content-Disposition: form-data; name="video_file"; filename="test_video.mp4"'
    'Content-Type: video/mp4'
    ""
)

$body = [System.Text.Encoding]::UTF8.GetBytes(($bodyLines -join "`r`n") + "`r`n")
$videoBytes = [System.IO.File]::ReadAllBytes($testVideoPath)
$body += $videoBytes
$body += [System.Text.Encoding]::UTF8.GetBytes("`r`n--$boundary--")

Write-Host "Sending multipart request..." -ForegroundColor Yellow
Write-Host "Content-Type: multipart/form-data; boundary=$boundary" -ForegroundColor Gray

$uploadSuccess = $false
$uploadResponse = $null
$uploadError = $null

try {
    $uploadResponse = Invoke-RestMethod -Uri "$apiUrl/admin/movies/$movieId/episodes" `
        -Method Post `
        -Headers $headers `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $body
    $uploadSuccess = $true
} catch {
    $uploadError = $_
}

Write-Host "`n" -ForegroundColor Cyan

