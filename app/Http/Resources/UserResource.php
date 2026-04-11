<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'email'             => $this->email,
            'avatar_url'        => $this->avatar_url,
            'status'            => $this->status,
            'is_admin'          => $this->is_admin,
            'role'              => $this->whenLoaded('role', fn () => $this->role?->name),
            'email_verified_at' => $this->email_verified_at,
            'comments_count'    => $this->whenCounted('comments'),
            'created_at'        => $this->created_at,
            'updated_at'        => $this->updated_at,
        ];
    }
}

