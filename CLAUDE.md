# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Environment (Docker)

All commands run inside Docker. The project ships with a `docker-compose.yml` defining three services: `vmovies_app` (PHP 8.2 + Apache), `vmovies_db` (MySQL 8.0), `vmovies_phpmyadmin`.

```bash
# First-time setup
docker compose up --build -d
npm run build                                         # generate public/build/manifest.json (required)
docker exec vmovies_app php artisan migrate
docker exec vmovies_app php artisan db:seed

# Daily workflow
docker compose up -d
npm run dev                                           # Vite dev server with HMR (run on host)
docker compose down

# Artisan commands
docker exec vmovies_app php artisan <command>
docker exec vmovies_app php artisan migrate:fresh --seed

# Test DB connection
docker exec vmovies_app php /var/www/html/.docker/db-test.php
```

**Important**: `npm run build` / `npm run dev` must run on the **host** (not in the container). The container has no Node.js. `npm run dev` also starts `php artisan serve` via `concurrently` — use `docker exec ... php artisan serve` is not needed when in Docker mode.

## Running Tests

```bash
# All tests
docker exec vmovies_app php artisan test

# Single test file
docker exec vmovies_app php artisan test tests/Feature/Auth/LoginTest.php

# Single test method
docker exec vmovies_app php artisan test --filter=test_method_name

# With coverage
docker exec vmovies_app php artisan test --coverage
```

Tests use the real MySQL database (not SQLite in-memory). The `phpunit.xml` comments out the SQLite lines intentionally. Run `migrate:fresh` before a full test suite if data state matters.

## Architecture Overview

### Dual Frontend Architecture

The project has **two separate React entry points** serving different audiences:

| Entry Point | File | Routing | Audience |
|---|---|---|---|
| Inertia SPA | `resources/js/app.jsx` | Inertia.js (server-driven) | Viewer-facing pages |
| React Router SPA | `resources/js/app-router.jsx` | `react-router-dom` | Admin CMS |

`routes/web.php` is a single catch-all that returns `view('app')` — it does not differentiate between viewer and admin routes. Client-side routing handles everything. The admin routes (`/login`, `/dashboard`, `/admin/*`) are defined in `app-router.jsx`.

### Backend: Service Pattern

Controllers delegate all business logic to a corresponding Service class. The pattern is consistent across all resources:

```
Request → Controller → Service → Eloquent Model → Response
```

- **Controllers** (`app/Http/Controllers/`) handle HTTP, call the service, return responses via the `HasJsonResponse` trait.
- **Services** (`app/Services/`) contain all query building, filtering, pagination, and DB transactions.
- **Form Requests** (`app/Http/Requests/`) handle validation before the controller runs.
- **API Resources** (`app/Http/Resources/`) shape JSON output.

### RBAC Authorization

Admin routes are protected by two middleware layers:
1. `auth:sanctum` — verifies the user is authenticated
2. `permission:<name>` — checks the user's role has the specific permission (e.g., `permission:movie.create`)

The `CheckPermission` middleware calls `$user->hasPermission($permission)` which loads `role.permissions` via eager loading. Permission names follow the pattern `resource.action` (e.g., `movie.read`, `user.ban`, `comment.approve`).

Roles and permissions are seeded by `RolePermissionSeeder`. To add a new permission, add it in the seeder and re-run `db:seed --class=RolePermissionSeeder`.

### Authentication Flow

Sanctum token is stored in an **HttpOnly cookie** (`auth_token`), not localStorage. The `ReadTokenFromCookie` middleware reads it and injects it as a `Bearer` header for every `/api/*` request before Sanctum processes it.

The frontend `apiClient.js` (`resources/js/Services/apiClient.js`) automatically handles **silent token refresh** on 401 responses: it calls `/api/auth/refresh`, and if that fails, dispatches a `auth:expired` custom DOM event which `AuthContext.jsx` listens to for forced logout.

### API Response Shape

All API responses use the `HasJsonResponse` trait (`app/Traits/HasJsonResponse.php`). The shape is always:

```json
{ "success": true|false, "message": "...", "data": ... }
```

Error responses additionally include `"error_code"` (e.g., `"NOT_FOUND"`, `"PERMISSION_DENIED"`, `"VALIDATION_ERROR"`) and `"errors"` for validation failures.

### Soft Deletes

`Movie`, `Episode`, `Genre`, `Country`, `Director`, and `Actor` models use `SoftDeletes`. Admin controllers expose `/trashed` list endpoints and `/restore` endpoints. The `destroy` action performs soft delete; there is no hard-delete endpoint exposed via the API.

### Frontend API Layer

Each backend resource has a matching JS API module in `resources/js/Services/` (e.g., `movieApi.js`, `episodeApi.js`). All modules import from `apiClient.js` and use `credentials: 'include'` to send the HttpOnly auth cookie. For file uploads (poster, banner images), use `apiClient.postMultipart()` / `apiClient.putMultipart()` which omits `Content-Type` and lets the browser set the multipart boundary.

## Key Environment Variables

```dotenv
DB_HOST=db          # must be "db" (Docker service name), not 127.0.0.1
DB_USERNAME=vmovies
DB_PASSWORD=secret
VITE_API_URL=http://localhost:8000/api
```
