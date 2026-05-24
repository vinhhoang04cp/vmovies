<?php

namespace App\Jobs;

use App\Models\Episode;
use App\Services\FileUploadService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessEpisodeVideo implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Episode $episode,
        public string $tempPath,
        public string $originalExtension
    ) {}

    /**
     * Execute the job.
     */
    public function handle(FileUploadService $fileUploadService): void
    {
        try {
            Log::info("Starting background job to upload video for episode ID: {$this->episode->id}");

            // Upload the video from temporary storage
            $videoUrl = $fileUploadService->uploadVideoFromPath($this->tempPath, (string) $this->episode->id, $this->originalExtension);

            // Update episode video URL
            $this->episode->update(['video_url' => $videoUrl]);

            Log::info("Background job successfully updated video URL for episode ID: {$this->episode->id}");
        } catch (\Exception $e) {
            Log::error("Failed to process background video upload for episode ID: {$this->episode->id}. Error: " . $e->getMessage());
            // Update to indicate failure
            $this->episode->update(['video_url' => 'failed']);
            throw $e;
        }
    }
}
