<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadService
{
    /**
     * Upload video file to storage and return public URL
     *
     * @return string Public URL of the uploaded video
     */
    public function uploadVideo(UploadedFile $file, string $episode_id): string
    {
        try {
            // Check if file is valid
            if (! $file->isValid()) {
                throw new \RuntimeException(
                    'File upload không hợp lệ. Mã lỗi: '.$file->getError()
                );
            }

            Log::info('Starting video upload', [
                'filename' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'episode_id' => $episode_id,
            ]);

            // Generate unique filename: episodes/{episode_id}/{uuid}.{ext}
            $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
            $path = "episodes/{$episode_id}";

            Log::info('Uploading to path', ['path' => $path, 'filename' => $filename]);

            // Store file in public disk
            $storagePath = Storage::disk('public')->putFileAs($path, $file, $filename);

            if ($storagePath === false || $storagePath === null) {
                throw new \RuntimeException(
                    'Không thể lưu file video vào storage. Kiểm tra quyền ghi thư mục storage/app/public.'
                );
            }

            Log::info('File stored successfully', ['storagePath' => $storagePath]);

            // Return public URL
            $publicUrl = asset('storage/'.$storagePath);
            Log::info('Video upload complete', ['url' => $publicUrl]);

            return $publicUrl;
        } catch (\Exception $e) {
            Log::error('Video upload error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Delete video file from storage
     *
     * @param  string  $videoUrl  Full URL of the video
     */
    public function deleteVideo(string $videoUrl): bool
    {
        // Extract path from URL
        // Example: http://localhost:8000/storage/episodes/123/uuid.mp4
        // We need: episodes/123/uuid.mp4

        if (strpos($videoUrl, '/storage/') === false) {
            return true; // Not a local file, skip deletion
        }

        $relativePath = str_replace(asset('storage/'), '', $videoUrl);

        if (Storage::disk('public')->exists($relativePath)) {
            return Storage::disk('public')->delete($relativePath);
        }

        return false;
    }

    /**
     * Delete all videos in an episode directory
     */
    public function deleteEpisodeVideos(string $episode_id): bool
    {
        $path = "episodes/{$episode_id}";

        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->deleteDirectory($path);
        }

        return false;
    }
}
