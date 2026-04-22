<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'content' => $this->content,
            'is_approved' => $this->is_approved,
            'is_deleted' => $this->is_deleted,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
            ]),
            'movie' => $this->whenLoaded('movie', fn () => [
                'id' => $this->movie?->id,
                'title' => $this->movie?->title,
            ]),
            'episode' => $this->whenLoaded('episode', fn () => $this->episode ? [
                'id' => $this->episode->id,
                'episode_number' => $this->episode->episode_number,
                'title' => $this->episode->title,
            ] : null),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
