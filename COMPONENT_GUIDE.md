# React Frontend - Component Guide

## 📦 Components Overview

### 1. AuthContext.jsx

**Quản lý toàn bộ authentication state**

```javascript
import { useAuth } from '@/Context/AuthContext';

function MyComponent() {
  const { 
    user,              // Current user object
    token,             // JWT token
    loading,           // Loading state
    error,             // Error message
    isAuthenticated,   // Is user logged in?
    login,             // Login function
    register,          // Register function
    logout,            // Logout function
    setError,          // Set error message
  } = useAuth();

  return (
    <>
      {isAuthenticated ? (
        <p>Hello, {user.name}!</p>
      ) : (
        <p>Please log in</p>
      )}
    </>
  );
}
```

**Features:**
- ✅ Stores token in localStorage
- ✅ Auto-loads user on app start if token exists
- ✅ Provides login/register/logout functions
- ✅ Manages loading and error states

---

### 2. apiClient.js

**Generic API client wrapper**

```javascript
import { apiClient, authApi } from '@/Services/apiClient';

// Generic requests
await apiClient.get('/endpoint');
await apiClient.post('/endpoint', { data });
await apiClient.put('/endpoint', { data });
await apiClient.patch('/endpoint', { data });
await apiClient.delete('/endpoint');

// Auth-specific
await authApi.login(email, password);
await authApi.register(name, email, password, password_confirmation);
await authApi.logout();
await authApi.me();
await authApi.refresh();
```

**Features:**
- ✅ Auto-adds Bearer token to headers
- ✅ Handles errors gracefully
- ✅ Returns consistent response format: `{ success, data, error }`
- ✅ Base URL from `VITE_API_URL` env

---

### 3. LoginAPI.jsx

**Login page component**

```jsx
import LoginAPI from '@/Pages/Auth/LoginAPI';

// Usage in router
<Route path="/login" element={<LoginAPI />} />
```

**Features:**
- Email input (pre-filled: admin@vmovies.com)
- Password input (pre-filled: password)
- Loading state
- Error display
- Form validation
- Link to register page
- Auto-redirect if already logged in

**Flow:**
1. User enters email & password
2. Click "Log In"
3. Calls `useAuth().login(email, password)`
4. Makes POST to `/api/auth/login`
5. On success: token saved, user state updated, redirect to `/dashboard`
6. On error: show error message

---

### 4. RegisterAPI.jsx

**Register page component**

```jsx
import RegisterAPI from '@/Pages/Auth/RegisterAPI';

// Usage in router
<Route path="/register" element={<RegisterAPI />} />
```

**Features:**
- Name input
- Email input
- Password input
- Confirm password input
- Client-side validation (email format, password match, min length)
- Loading state
- Error display
- Link to login page
- Auto-redirect if already logged in

**Validation:**
- Name: required
- Email: required, valid format
- Password: required, min 6 chars
- Confirm password: matches password

**Flow:**
1. User fills form
2. Client-side validation
3. Click "Sign Up"
4. Calls `useAuth().register(...)`
5. Makes POST to `/api/auth/register`
6. On success: auto login, redirect to `/dashboard`
7. On error: show error message

---

### 5. DashboardAPI.jsx

**Admin dashboard component**

```jsx
import DashboardAPI from '@/Pages/DashboardAPI';

// Usage in router
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <DashboardAPI />
    </ProtectedRoute>
  } 
/>
```

**Features:**
- User dropdown menu (name + email)
- Logout button
- Fetches stats from `/api/admin/dashboard`
- Displays 4 stat cards:
  - Total movies
  - Total episodes
  - Total users
  - Total comments
- Shows pending actions:
  - Pending comments
  - Banned users
  - Trashed movies
  - Trashed episodes
- Loading and error states

**Flow:**
1. Component mounts
2. Check if authenticated (redirect to login if not)
3. Fetch stats from API
4. Display stats in cards
5. User can click dropdown to logout

---

### 6. ProtectedRoute.jsx

**Route guard wrapper**

```jsx
import { ProtectedRoute, PublicRoute } from '@/Context/ProtectedRoute';

// Protected - requires authentication
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <DashboardAPI />
    </ProtectedRoute>
  } 
/>

// Public - redirects to dashboard if authenticated
<Route 
  path="/login" 
  element={
    <PublicRoute>
      <LoginAPI />
    </PublicRoute>
  } 
/>
```

**Features:**
- `<ProtectedRoute>` - Requires authentication, redirects to `/login` if not
- `<PublicRoute>` - Prevents access if already authenticated, redirects to `/dashboard`
- Loading spinner while checking auth status

---

### 7. app-router.jsx

**Main React Router app**

```jsx
import App from '@/app-router';
import { createRoot } from 'react-dom/client';

// This is the main entry point
// Wraps everything with <AuthProvider>
// Sets up React Router with all routes
```

**Routes:**
```
/login              - Login page (public)
/register           - Register page (public)
/dashboard          - Admin dashboard (protected)
/                   - Redirect to /dashboard
```

---

## 🔄 Data Flow

### On App Load
```
App starts
  ↓
AuthProvider mounts
  ↓
Check for token in localStorage
  ↓
If token exists:
  - Set token state
  - Call fetchUser(token) to get user info
  ↓
If no token:
  - User is not authenticated
  ↓
Render routes
```

### Login Flow
```
User on /login page
  ↓
Enter email & password
  ↓
Click "Log In"
  ↓
LoginAPI calls useAuth().login(email, password)
  ↓
AuthContext calls apiClient.post('/auth/login', {email, password})
  ↓
Backend validates & returns {success, data: {user, token}}
  ↓
AuthContext saves token to localStorage
  ↓
AuthContext updates user state
  ↓
useNavigate() redirects to /dashboard
  ↓
DashboardAPI mounts
  ↓
Fetches stats from /api/admin/dashboard
  ↓
Display dashboard
```

### Logout Flow
```
User on dashboard
  ↓
Click user dropdown
  ↓
Click "Log Out"
  ↓
handleLogout() calls useAuth().logout()
  ↓
AuthContext calls apiClient.post('/auth/logout', {})
  ↓
Removes token from localStorage
  ↓
Clears user state
  ↓
useNavigate() redirects to /login
```

### Protected Route Flow
```
User tries to access /dashboard directly
  ↓
<ProtectedRoute> checks isAuthenticated
  ↓
If not authenticated:
  - Show loading spinner
  - Redirect to /login
  ↓
If authenticated:
  - Render <DashboardAPI />
```

---

## 🛠️ Customization

### Change API Base URL
Edit `.env`:
```
VITE_API_URL=https://api.example.com/api
```

### Change App Name
Edit `.env`:
```
VITE_APP_NAME="My App Name"
```

### Add More Routes
Edit `app-router.jsx`:
```jsx
<Route path="/new-page" element={<NewPage />} />
```

### Add More API Methods
Edit `apiClient.js`:
```javascript
export const customApi = {
  getMovies() {
    return apiClient.get('/admin/movies');
  },
  createMovie(data) {
    return apiClient.post('/admin/movies', data);
  },
};
```

### Customize Login Page
Edit `LoginAPI.jsx`:
- Change colors
- Add logo
- Add additional fields
- Change validation rules

---

## 📊 Component Dependencies

```
app-router.jsx
  ├── AuthProvider (from AuthContext.jsx)
  ├── Routes
  │   ├── /login → LoginAPI.jsx
  │   │   └── useAuth() → AuthContext
  │   ├── /register → RegisterAPI.jsx
  │   │   └── useAuth() → AuthContext
  │   └── /dashboard → ProtectedRoute
  │       └── DashboardAPI.jsx
  │           ├── useAuth() → AuthContext
  │           └── apiClient.get() → apiClient.js
  └── AuthContext.jsx
      └── apiClient (from apiClient.js)
```

---

## 🧠 State Management

### Global Auth State (AuthContext)
```javascript
{
  user: {
    id: 1,
    name: "Admin",
    email: "admin@vmovies.com",
    avatar_url: null,
    status: "active",
    role: {id: 1, name: "admin", display_name: "Administrator"},
    is_admin: true,
    created_at: "2026-04-10T13:21:21.000000Z"
  },
  token: "309Wg5usFjrQsDVgBj2FVFY6DaIBPs9...",
  loading: false,
  error: null,
  isAuthenticated: true
}
```

### Component Local State

**LoginAPI.jsx:**
```javascript
{
  formData: { email, password },
  formErrors: { email?, password?, submit? },
  loading: boolean
}
```

**DashboardAPI.jsx:**
```javascript
{
  stats: { totals, pending_actions, top_movies, ... },
  loading: boolean,
  error: string,
  showDropdown: boolean
}
```

---

## 🚀 Performance Tips

1. **Memoize components** if they render frequently
2. **Use useCallback** for event handlers
3. **Lazy load routes** with React.lazy()
4. **Cache API responses** in state
5. **Debounce search** inputs

---

## 🔒 Security Best Practices

✅ Token stored in localStorage (client-side)  
✅ Token included in Authorization header  
✅ CORS handled by Laravel backend  
✅ Password fields use type="password"  
✅ Form validation on client-side  
✅ Sensitive data not logged in console  

**Note:** For production, consider:
- Storing token in httpOnly cookie instead of localStorage
- Implement token refresh mechanism
- Add CSRF protection
- Rate limiting on API endpoints

---

## 🐛 Debugging

### Enable React DevTools
1. Install React DevTools browser extension
2. Inspect components, check props/state
3. Track component re-renders

### Check Auth State
```javascript
// In browser console
localStorage.getItem('auth_token')
```

### Monitor API Calls
1. Open DevTools Network tab
2. Make login/register request
3. Check request/response headers and body

### Check Logs
```javascript
// apiClient.js logs errors
// AuthContext.jsx logs state changes
// Components log loading/error states
```

---

## 📝 Next Steps

1. ✅ Frontend complete
2. ✅ Backend complete
3. Run `npm run dev`
4. Test login flow
5. Add more pages/components
6. Build for production with `npm run build`


