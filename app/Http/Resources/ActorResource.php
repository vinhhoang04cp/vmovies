<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'bio'        => $this->bio,
            'image_url'  => $this->image_url,
            'role_name'  => $this->whenPivotLoaded('movie_actor', fn () => $this->pivot->role_name),
            'created_at' => $this->created_at,
        ];
    }
}

