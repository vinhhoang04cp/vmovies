<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EpisodeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'movie_id' => $this->movie_id,
            'movie_title' => $this->whenLoaded('movie', fn () => $this->movie?->title),
            'episode_number' => $this->episode_number,
            'arc_name' => $this->arc_name,
            'title' => $this->title,
            'video_url' => $this->video_url,
            'duration' => $this->duration,
            'duration_formatted' => $this->duration ? $this->duration_formatted : null,
            'views' => $this->views,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
