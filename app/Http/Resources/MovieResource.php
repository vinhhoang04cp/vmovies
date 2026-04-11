<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MovieResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'title'          => $this->title,
            'original_title' => $this->original_title,
            'slug'           => $this->slug,
            'poster_url'     => $this->poster_url,
            'banner_url'     => $this->banner_url,
            'trailer_url'    => $this->trailer_url,
            'summary'        => $this->summary,
            'release_year'   => $this->release_year,
            'status'         => $this->status,
            'type'           => $this->type,
            'view_count'     => $this->view_count,
            'average_rating' => $this->average_rating,
            'genres'         => GenreResource::collection($this->whenLoaded('genres')),
            'countries'      => CountryResource::collection($this->whenLoaded('countries')),
            'directors'      => DirectorResource::collection($this->whenLoaded('directors')),
            'actors'         => ActorResource::collection($this->whenLoaded('actors')),
            'episodes'       => EpisodeResource::collection($this->whenLoaded('episodes')),
            'episodes_count' => $this->whenCounted('episodes'),
            'created_at'     => $this->created_at,
            'updated_at'     => $this->updated_at,
        ];
    }
}

