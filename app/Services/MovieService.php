<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Movie;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class MovieService
{
    /**
     * Lấy danh sách phim có pagination + filter.
     */
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Movie::withCount('episodes')
            ->with(['genres', 'countries']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('original_title', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['genre_id'])) {
            $query->whereHas('genres', fn($q) => $q->where('genres.id', $filters['genre_id']));
        }

        if (!empty($filters['country_id'])) {
            $query->whereHas('countries', fn($q) => $q->where('countries.id', $filters['country_id']));
        }

        if (!empty($filters['year'])) {
            $query->where('release_year', $filters['year']);
        }

        $sortBy  = $filters['sort_by'] ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $allowedSorts = ['created_at', 'title', 'release_year', 'view_count', 'average_rating'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->paginate($perPage);
    }

    /**
     * Lấy danh sách phim đã bị soft delete (admin only).
     */
    public function listTrashed(array $filters = []): LengthAwarePaginator
    {
        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return Movie::onlyTrashed()
            ->withCount('episodes')
            ->orderBy('deleted_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Lấy chi tiết một phim.
     */
    public function findOrFail(int $id, bool $withTrashed = false): Movie
    {
        $query = Movie::with(['genres', 'countries', 'directors', 'actors', 'episodes']);

        if ($withTrashed) {
            $query->withTrashed();
        }

        $movie = $query->find($id);

        if (!$movie) {
            throw new ApiException('Không tìm thấy phim.', Response::HTTP_NOT_FOUND, 'NOT_FOUND');
        }

        return $movie;
    }

    /**
     * Tạo phim mới.
     */
    public function create(array $data): Movie
    {
        return DB::transaction(function () use ($data) {
            if (empty($data['slug'])) {
                $data['slug'] = Str::slug($data['title']) . '-' . time();
            }

            $movie = Movie::create([
                'title'          => $data['title'],
                'original_title' => $data['original_title'] ?? null,
                'slug'           => $data['slug'],
                'poster_url'     => $data['poster_url'] ?? null,
                'banner_url'     => $data['banner_url'] ?? null,
                'trailer_url'    => $data['trailer_url'] ?? null,
                'summary'        => $data['summary'] ?? null,
                'release_year'   => $data['release_year'] ?? null,
                'status'         => $data['status'] ?? 'ongoing',
                'type'           => $data['type'],
                'view_count'     => 0,
                'average_rating' => 0,
            ]);

            $this->syncRelationships($movie, $data);

            return $movie->load(['genres', 'countries', 'directors', 'actors']);
        });
    }

    /**
     * Cập nhật phim.
     */
    public function update(Movie $movie, array $data): Movie
    {
        return DB::transaction(function () use ($movie, $data) {
            $movie->update(array_filter([
                'title'          => $data['title'] ?? $movie->title,
                'original_title' => array_key_exists('original_title', $data) ? $data['original_title'] : $movie->original_title,
                'slug'           => $data['slug'] ?? $movie->slug,
                'poster_url'     => array_key_exists('poster_url', $data) ? $data['poster_url'] : $movie->poster_url,
                'banner_url'     => array_key_exists('banner_url', $data) ? $data['banner_url'] : $movie->banner_url,
                'trailer_url'    => array_key_exists('trailer_url', $data) ? $data['trailer_url'] : $movie->trailer_url,
                'summary'        => array_key_exists('summary', $data) ? $data['summary'] : $movie->summary,
                'release_year'   => $data['release_year'] ?? $movie->release_year,
                'status'         => $data['status'] ?? $movie->status,
                'type'           => $data['type'] ?? $movie->type,
            ], fn($v) => $v !== null));

            $this->syncRelationships($movie, $data);

            return $movie->load(['genres', 'countries', 'directors', 'actors']);
        });
    }

    /**
     * Xóa mềm phim.
     */
    public function delete(Movie $movie): void
    {
        $movie->delete();
    }

    /**
     * Khôi phục phim đã bị xóa mềm.
     */
    public function restore(int $id): Movie
    {
        $movie = Movie::onlyTrashed()->find($id);

        if (!$movie) {
            throw new ApiException('Không tìm thấy phim đã xóa.', Response::HTTP_NOT_FOUND, 'NOT_FOUND');
        }

        $movie->restore();

        /** @var Movie $movie */
        $movie = $movie->fresh(['genres', 'countries', 'directors', 'actors']);

        return $movie;
    }

    // ─── Pivot operations ────────────────────────────────────────────────────

    public function attachGenre(Movie $movie, int $genreId): void
    {
        if ($movie->genres()->where('genres.id', $genreId)->exists()) {
            throw new ApiException('Thể loại đã được gắn vào phim này.', Response::HTTP_CONFLICT, 'CONFLICT');
        }
        $movie->genres()->attach($genreId);
    }

    public function detachGenre(Movie $movie, int $genreId): void
    {
        $movie->genres()->detach($genreId);
    }

    public function attachCountry(Movie $movie, int $countryId): void
    {
        if ($movie->countries()->where('countries.id', $countryId)->exists()) {
            throw new ApiException('Quốc gia đã được gắn vào phim này.', Response::HTTP_CONFLICT, 'CONFLICT');
        }
        $movie->countries()->attach($countryId);
    }

    public function detachCountry(Movie $movie, int $countryId): void
    {
        $movie->countries()->detach($countryId);
    }

    public function attachDirector(Movie $movie, int $directorId): void
    {
        if ($movie->directors()->where('directors.id', $directorId)->exists()) {
            throw new ApiException('Đạo diễn đã được gắn vào phim này.', Response::HTTP_CONFLICT, 'CONFLICT');
        }
        $movie->directors()->attach($directorId);
    }

    public function detachDirector(Movie $movie, int $directorId): void
    {
        $movie->directors()->detach($directorId);
    }

    public function attachActor(Movie $movie, int $actorId, ?string $roleName = null): void
    {
        if ($movie->actors()->where('actors.id', $actorId)->exists()) {
            throw new ApiException('Diễn viên đã được gắn vào phim này.', Response::HTTP_CONFLICT, 'CONFLICT');
        }
        $movie->actors()->attach($actorId, ['role_name' => $roleName]);
    }

    public function detachActor(Movie $movie, int $actorId): void
    {
        $movie->actors()->detach($actorId);
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private function syncRelationships(Movie $movie, array $data): void
    {
        if (array_key_exists('genres', $data)) {
            $movie->genres()->sync($data['genres'] ?? []);
        }

        if (array_key_exists('countries', $data)) {
            $movie->countries()->sync($data['countries'] ?? []);
        }

        if (array_key_exists('directors', $data)) {
            $movie->directors()->sync($data['directors'] ?? []);
        }

        if (array_key_exists('actors', $data)) {
            $actorsSync = collect($data['actors'] ?? [])->mapWithKeys(fn($actor) => [
                $actor['id'] => ['role_name' => $actor['role_name'] ?? null],
            ])->toArray();
            $movie->actors()->sync($actorsSync);
        }
    }
}

