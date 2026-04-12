@echo off
REM Test video upload using curl

setlocal enabledelayedexpansion

set API_URL=http://localhost:8000/api
set MOVIE_ID=1

REM Step 1: Login
echo === Step 1: Login ===
for /f "delims=" %%i in ('curl -s -X POST "%API_URL%/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"admin@vmovies.com\",\"password\":\"password\"}" ^| findstr /i "token"') do set TOKEN_LINE=%%i
echo Token response: !TOKEN_LINE!

REM Extract token (simple extraction)
for /f "tokens=2 delims=:" %%i in ('echo !TOKEN_LINE!') do set TOKEN=%%i
set TOKEN=!TOKEN:~2,-2!
echo Using token: !TOKEN:~0,20!...

REM Step 2: Create episode without file
echo.
echo === Step 2: Create Episode with URL ===
curl -s -X POST "%API_URL%/admin/movies/%MOVIE_ID%/episodes" ^
  -H "Authorization: Bearer !TOKEN!" ^
  -H "Content-Type: application/json" ^
  -d "{\"episode_number\":5,\"title\":\"Test Episode\",\"arc_name\":\"Test\",\"video_url\":\"https://example.com/video.mp4\",\"duration\":3600}" ^
  | findstr "id"

echo.
echo === Done ===

