# PowerShell script để test Episode Video Upload API

# Configuration
$API_URL = "http://localhost:8000/api"
$TOKEN = "" # Sẽ được lấy từ login
$MOVIE_ID = 1 # Thay bằng ID phim thực tế
$TEST_VIDEO = "C:\temp\test.mp4" # Thay bằng đường dẫn video test thực tế

Write-Host "=== Episode Video Upload Test ===" -ForegroundColor Cyan

# 1. Login để lấy token
Write-Host "`n[1] Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@vmovies.com"
    password = "password"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody

    $TOKEN = $loginResponse.data.token
    Write-Host "✓ Login successful. Token: $($TOKEN.Substring(0, 20))..." -ForegroundColor Green
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit 1
}

# 2. Kiểm tra xem phim có tồn tại
Write-Host "`n[2] Checking movie..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Accept" = "application/json"
}

try {
    $movieResponse = Invoke-RestMethod -Uri "$API_URL/admin/movies/$MOVIE_ID" `
        -Method Get `
        -Headers $headers

    Write-Host "✓ Movie found: $($movieResponse.data.title)" -ForegroundColor Green
} catch {
    Write-Host "✗ Movie not found: $_" -ForegroundColor Red
    exit 1
}

# 3. Tạo file video test nếu không tồn tại
if (-Not (Test-Path $TEST_VIDEO)) {
    Write-Host "`n[3] Creating test video file..." -ForegroundColor Yellow

    # Tạo thư mục temp nếu cần
    $tempDir = Split-Path $TEST_VIDEO
    if (-Not (Test-Path $tempDir)) {
        New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    }

    # Tạo file video test nhỏ (10MB video)
    # Lưu ý: Đây là file dummy, không phải video thực tế
    $dummyVideoData = New-Object System.Byte[] 10485760
    [System.Random]::new().NextBytes($dummyVideoData)
    [System.IO.File]::WriteAllBytes($TEST_VIDEO, $dummyVideoData)

    Write-Host "✓ Test video created at: $TEST_VIDEO (10MB)" -ForegroundColor Green
}

# 4. Upload video - Tạo tập phim mới
Write-Host "`n[4] Creating episode with video upload..." -ForegroundColor Yellow

$fileContent = [System.IO.File]::ReadAllBytes($TEST_VIDEO)
$boundary = [System.Guid]::NewGuid().ToString()
$multipartContent = New-Object System.Text.StringBuilder

# Build multipart form data
$multipartContent.AppendLine("--$boundary")
$multipartContent.AppendLine("Content-Disposition: form-data; name=`"episode_number`"")
$multipartContent.AppendLine("")
$multipartContent.AppendLine("1")

$multipartContent.AppendLine("--$boundary")
$multipartContent.AppendLine("Content-Disposition: form-data; name=`"title`"")
$multipartContent.AppendLine("")
$multipartContent.AppendLine("Test Episode")

$multipartContent.AppendLine("--$boundary")
$multipartContent.AppendLine("Content-Disposition: form-data; name=`"arc_name`"")
$multipartContent.AppendLine("")
$multipartContent.AppendLine("Test Arc")

$multipartContent.AppendLine("--$boundary")
$multipartContent.AppendLine("Content-Disposition: form-data; name=`"duration`"")
$multipartContent.AppendLine("")
$multipartContent.AppendLine("3600")

$multipartContent.AppendLine("--$boundary")
$multipartContent.AppendLine("Content-Disposition: form-data; name=`"video_file`"; filename=`"test.mp4`"")
$multipartContent.AppendLine("Content-Type: video/mp4")
$multipartContent.AppendLine("")

$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($multipartContent.ToString())
$bodyBytes += $fileContent
$bodyBytes += [System.Text.Encoding]::UTF8.GetBytes("`r`n--$boundary--")

try {
    $uploadResponse = Invoke-RestMethod -Uri "$API_URL/admin/movies/$MOVIE_ID/episodes" `
        -Method Post `
        -Headers $headers `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $bodyBytes

    $episodeId = $uploadResponse.data.id
    $videoUrl = $uploadResponse.data.video_url

    Write-Host "✓ Episode created successfully!" -ForegroundColor Green
    Write-Host "  Episode ID: $episodeId" -ForegroundColor Gray
    Write-Host "  Video URL: $videoUrl" -ForegroundColor Gray
} catch {
    Write-Host "✗ Upload failed: $_" -ForegroundColor Red
    exit 1
}

# 5. Kiểm tra chi tiết tập
Write-Host "`n[5] Verifying episode details..." -ForegroundColor Yellow

try {
    $detailResponse = Invoke-RestMethod -Uri "$API_URL/admin/episodes/$episodeId" `
        -Method Get `
        -Headers $headers

    Write-Host "✓ Episode details:" -ForegroundColor Green
    Write-Host "  Title: $($detailResponse.data.title)" -ForegroundColor Gray
    Write-Host "  Episode Number: $($detailResponse.data.episode_number)" -ForegroundColor Gray
    Write-Host "  Video URL: $($detailResponse.data.video_url)" -ForegroundColor Gray
    Write-Host "  Duration: $($detailResponse.data.duration)s" -ForegroundColor Gray
} catch {
    Write-Host "✗ Verification failed: $_" -ForegroundColor Red
}

# 6. Test update dengan video khác
Write-Host "`n[6] Testing episode update with new video..." -ForegroundColor Yellow

$multipartContent2 = New-Object System.Text.StringBuilder
$multipartContent2.AppendLine("--$boundary")
$multipartContent2.AppendLine("Content-Disposition: form-data; name=`"episode_number`"")
$multipartContent2.AppendLine("")
$multipartContent2.AppendLine("1")

$multipartContent2.AppendLine("--$boundary")
$multipartContent2.AppendLine("Content-Disposition: form-data; name=`"title`"")
$multipartContent2.AppendLine("")
$multipartContent2.AppendLine("Test Episode Updated")

$multipartContent2.AppendLine("--$boundary")
$multipartContent2.AppendLine("Content-Disposition: form-data; name=`"video_file`"; filename=`"test_updated.mp4`"")
$multipartContent2.AppendLine("Content-Type: video/mp4")
$multipartContent2.AppendLine("")

$bodyBytes2 = [System.Text.Encoding]::UTF8.GetBytes($multipartContent2.ToString())
$bodyBytes2 += $fileContent
$bodyBytes2 += [System.Text.Encoding]::UTF8.GetBytes("`r`n--$boundary--")

try {
    $updateResponse = Invoke-RestMethod -Uri "$API_URL/admin/episodes/$episodeId" `
        -Method Put `
        -Headers $headers `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $bodyBytes2

    Write-Host "✓ Episode updated successfully!" -ForegroundColor Green
    Write-Host "  New title: $($updateResponse.data.title)" -ForegroundColor Gray
    Write-Host "  New video URL: $($updateResponse.data.video_url)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Update failed: $_" -ForegroundColor Red
}

Write-Host "`n=== Test Completed ===" -ForegroundColor Cyan
Write-Host "Video files are stored in: storage/app/public/episodes/$episodeId/" -ForegroundColor Yellow

