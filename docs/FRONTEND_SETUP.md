# VMovies Frontend Setup Guide

## Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example.frontend` to `.env`:
```bash
cp .env.example.frontend .env
```

Edit `.env` if needed (API URL, etc.):
```
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME="VMovies Admin"
```

### 3. Start Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```

---

## Structure

```
resources/js/
├── app-router.jsx              # Main app with routing
├── bootstrap.js                # Axios setup
├── Components/                 # Reusable UI components
├── Context/
│   ├── AuthContext.jsx         # Auth state management
│   └── ProtectedRoute.jsx       # Route protection
├── Layouts/
├── Pages/
│   ├── Auth/
│   │   ├── LoginAPI.jsx         # Login page (with API)
│   │   └── RegisterAPI.jsx      # Register page (with API)
│   └── DashboardAPI.jsx         # Admin dashboard (with API)
├── Services/
│   └── apiClient.js            # API client & helpers
└── css/
    └── app.css
```

---

## Features

### Authentication
- **Login** (`/login`)
  - Email + Password
  - Get token from API
  - Save token to localStorage
  - Redirect to dashboard on success

- **Register** (`/register`)
  - Name, Email, Password confirmation
  - Create account via API
  - Auto login after registration
  - Validation on client

- **Logout**
  - Call logout endpoint
  - Clear localStorage
  - Redirect to login

### Protected Routes
- Automatically redirect to login if not authenticated
- Persist auth token across page refreshes
- Auto fetch user info on mount

### Dashboard
- Shows stats from `/api/admin/dashboard`
- Total movies, episodes, users, comments
- Pending actions count
- User dropdown menu with logout

---

## API Endpoints Used

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/admin/dashboard`

---

## Auth Context API

```javascript
const { 
  user,              // Current user object
  token,             // Auth token
  loading,           // Loading state
  error,             // Error message
  isAuthenticated,   // Boolean
  login(),           // Async login
  register(),        // Async register
  logout(),          // Async logout
} = useAuth();
```

---

## API Client

```javascript
import { apiClient, authApi } from '@/Services/apiClient';

// Generic request
const result = await apiClient.get('/endpoint');
const result = await apiClient.post('/endpoint', { data });
const result = await apiClient.put('/endpoint', { data });
const result = await apiClient.delete('/endpoint');

// Auth-specific
const result = await authApi.login(email, password);
const result = await authApi.register(name, email, password, password_confirmation);
const result = await authApi.logout();
const result = await authApi.me();

// Check result
if (result.success) {
  const data = result.data;
} else {
  const error = result.error;
}
```

---

## Notes

- Token stored in `localStorage` under key `auth_token`
- API URL from `VITE_API_URL` env var (defaults to `http://localhost:8000/api`)
- Tailwind CSS for styling
- Form validation on client side
- Protected routes automatically redirect unauthenticated users

