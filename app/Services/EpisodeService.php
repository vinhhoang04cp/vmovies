<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Episode;
use App\Models\Movie;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class EpisodeService
{
    public function __construct(
        private FileUploadService $fileUploadService = new FileUploadService
    ) {}

    /**
     * Lấy danh sách tập phim của một bộ phim.
     */
    public function listByMovie(Movie $movie, array $filters = []): LengthAwarePaginator
    {
        $perPage = min((int) ($filters['per_page'] ?? 30), 100);

        return $movie->episodes()
            ->orderBy('episode_number')
            ->paginate($perPage);
    }

    /**
     * Lấy chi tiết một tập phim.
     */
    public function findOrFail(int $id): Episode
    {
        $episode = Episode::with('movie')->find($id);

        if (! $episode) {
            throw new ApiException('Không tìm thấy tập phim.', Response::HTTP_NOT_FOUND, 'NOT_FOUND');
        }

        return $episode;
    }

    /**
     * Tạo một tập phim mới cho một bộ phim.
     */
    public function create(Movie $movie, array $data): Episode
    {
        $this->checkDuplicateEpisodeNumber($movie->id, $data['episode_number']);

        $videoUrl = $data['video_url'] ?? null;

        // Tạo episode tạm thời
        $episode = Episode::create([
            'movie_id' => $movie->id,
            'episode_number' => $data['episode_number'],
            'arc_name' => $data['arc_name'] ?? null,
            'title' => $data['title'] ?? null,
            'video_url' => 'processing', // temporary value
            'duration' => isset($data['duration']) && $data['duration'] !== null ? (int) $data['duration'] : 0,
            'views' => 0,
        ]);

        // Xử lý upload video file qua hàng đợi
        if (! empty($data['video_file'])) {
            // Lưu tạm vào disk local
            $tempPath = $data['video_file']->store('temp', 'local');
            $originalExtension = $data['video_file']->getClientOriginalExtension();

            // Dispatch Job
            \App\Jobs\ProcessEpisodeVideo::dispatch($episode, $tempPath, $originalExtension);
        } elseif (! empty($videoUrl) && $videoUrl !== 'pending') {
            $episode->update(['video_url' => $videoUrl]);
        }

        return $episode->fresh();
    }

    /**
     * Tạo nhiều tập phim cùng lúc (bulk create).
     */
    public function bulkCreate(Movie $movie, array $episodes): Collection
    {
        return DB::transaction(function () use ($movie, $episodes) {
            $numbers = array_column($episodes, 'episode_number');

            // Kiểm tra trùng số tập trong request
            if (count($numbers) !== count(array_unique($numbers))) {
                throw new ApiException(
                    'Danh sách tập có số tập bị trùng lặp.',
                    Response::HTTP_UNPROCESSABLE_ENTITY,
                    'DUPLICATE_EPISODE_NUMBER'
                );
            }

            // Kiểm tra trùng với database
            $existing = $movie->episodes()
                ->whereIn('episode_number', $numbers)
                ->pluck('episode_number')
                ->toArray();

            if (! empty($existing)) {
                throw new ApiException(
                    'Các tập '.implode(', ', $existing).' đã tồn tại.',
                    Response::HTTP_CONFLICT,
                    'EPISODE_EXISTS'
                );
            }

            $created = [];
            foreach ($episodes as $epData) {
                $created[] = Episode::create([
                    'movie_id' => $movie->id,
                    'episode_number' => $epData['episode_number'],
                    'arc_name' => $epData['arc_name'] ?? null,
                    'title' => $epData['title'] ?? null,
                    'video_url' => $epData['video_url'],
                    'duration' => isset($epData['duration']) && $epData['duration'] !== null ? (int) $epData['duration'] : 0,
                    'views' => 0,
                ]);
            }

            return Episode::whereIn('id', array_map(fn ($e) => $e->id, $created))->get();
        });
    }

    /**
     * Cập nhật tập phim.
     */
    public function update(Episode $episode, array $data): Episode
    {
        if (isset($data['episode_number']) && $data['episode_number'] !== $episode->episode_number) {
            $this->checkDuplicateEpisodeNumber($episode->movie_id, $data['episode_number'], $episode->id);
        }

        $newDuration = array_key_exists('duration', $data) ? $data['duration'] : $episode->duration;
        $updateData = [
            'episode_number' => $data['episode_number'] ?? $episode->episode_number,
            'arc_name' => array_key_exists('arc_name', $data) ? $data['arc_name'] : $episode->arc_name,
            'title' => array_key_exists('title', $data) ? $data['title'] : $episode->title,
            'video_url' => $episode->video_url,
            'duration' => ($newDuration !== null) ? (int) $newDuration : $episode->duration ?? 0,
        ];

        if (! empty($data['video_file'])) {
            // Đặt trạng thái processing
            $updateData['video_url'] = 'processing';

            // Lưu tạm vào disk local
            $tempPath = $data['video_file']->store('temp', 'local');
            $originalExtension = $data['video_file']->getClientOriginalExtension();

            // Dispatch Job
            \App\Jobs\ProcessEpisodeVideo::dispatch($episode, $tempPath, $originalExtension);
        } elseif (! empty($data['video_url'])) {
            $updateData['video_url'] = $data['video_url'];
        }

        $episode->update($updateData);

        return $episode->fresh();
    }

    /**
     * Xóa mềm tập phim.
     */
    public function delete(Episode $episode): void
    {
        // Delete video file if exists and is local
        if ($episode->video_url && strpos($episode->video_url, '/storage/') !== false) {
            $this->fileUploadService->deleteVideo($episode->video_url);
        }

        $episode->delete();
    }

    /**
     * Lấy danh sách tập phim đã bị xóa mềm (admin only).
     */
    public function listTrashed(array $filters = []): LengthAwarePaginator
    {
        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        $query = Episode::onlyTrashed()->with('movie');

        if (! empty($filters['movie_id'])) {
            $query->where('movie_id', $filters['movie_id']);
        }

        return $query->orderBy('deleted_at', 'desc')->paginate($perPage);
    }

    /**
     * Khôi phục tập phim đã bị xóa mềm.
     */
    public function restore(int $id): Episode
    {
        $episode = Episode::onlyTrashed()->with('movie')->find($id);

        if (! $episode) {
            throw new ApiException('Không tìm thấy tập phim đã xóa.', Response::HTTP_NOT_FOUND, 'NOT_FOUND');
        }

        $this->checkDuplicateEpisodeNumber($episode->movie_id, $episode->episode_number);

        $episode->restore();

        /** @var Episode $episode */
        $episode = $episode->fresh(['movie']);

        return $episode;
    }

    /**
     * Sắp xếp lại thứ tự tập phim.
     * $order là mảng [['id' => X, 'episode_number' => Y], ...]
     */
    public function reorder(Movie $movie, array $order): void
    {
        DB::transaction(function () use ($movie, $order) {
            foreach ($order as $item) {
                Episode::where('id', $item['id'])
                    ->where('movie_id', $movie->id)
                    ->update(['episode_number' => $item['episode_number']]);
            }
        });
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private function checkDuplicateEpisodeNumber(int $movieId, int $episodeNumber, ?int $excludeId = null): void
    {
        $query = Episode::where('movie_id', $movieId)
            ->where('episode_number', $episodeNumber);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        if ($query->exists()) {
            throw new ApiException(
                "Tập phim số {$episodeNumber} đã tồn tại.",
                Response::HTTP_CONFLICT,
                'EPISODE_EXISTS'
            );
        }
    }
}
