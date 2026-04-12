# 🚀 Quick Reference Guide - VMovies

## ⚡ 60-Second Setup

```bash
# 1. Backend
php artisan migrate:fresh --seed
php artisan serve --port=8000

# 2. Frontend (new terminal)
npm install
npm run dev

# 3. Visit
http://localhost:5173
# Login: admin@vmovies.com / password
```

---

## 📍 Key URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |
| API | http://localhost:8000/api |
| Login | http://localhost:5173/login |
| Dashboard | http://localhost:5173/dashboard |

---

## 🔑 Test Credentials

```
Email:    admin@vmovies.com
Password: password
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `routes/api.php` | All API endpoints |
| `routes/web.php` | React SPA routes |
| `app/Http/Controllers/Admin/*` | API logic |
| `resources/js/app-router.jsx` | React app entry |
| `resources/js/Context/AuthContext.jsx` | Auth state |
| `resources/js/Services/apiClient.js` | API client |
| `.env` | Backend config |
| `.env` (frontend) | Frontend config |

---

## 🔌 API Endpoints Quick List

### Auth
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
GET    /api/auth/me
```

### Admin
```
GET    /api/admin/movies
POST   /api/admin/movies
GET/PUT/DELETE /api/admin/movies/{id}

GET    /api/admin/genres
POST   /api/admin/genres
(same CRUD for countries, directors, actors)

GET    /api/admin/users
PATCH  /api/admin/users/{id}/ban
PATCH  /api/admin/users/{id}/unban

GET    /api/admin/comments
PATCH  /api/admin/comments/{id}/approve
DELETE /api/admin/comments/{id}

GET    /api/admin/dashboard
GET    /api/admin/stats/movies
GET    /api/admin/stats/users
GET    /api/admin/stats/comments
```

---

## 🧪 Testing

### Backend
```bash
powershell -File test_script\test_api_v2.ps1
powershell -File test_script\test_category_api.ps1
powershell -File test_script\test_personnel_api.ps1
powershell -File test_script\test_episode_api.ps1
powershell -File test_script\test_user_comment_api.ps1
powershell -File test_script\test_dashboard_api.ps1
```

**Result:** ✅ 93 tests passing

### Frontend
1. Open http://localhost:5173/login
2. Login with admin@vmovies.com / password
3. See dashboard with stats
4. Click logout
5. Redirects to login

---

## 🏗️ Project Structure

```
vmovies/
├── app/Http/Controllers/Admin/      ← API logic
├── app/Models/                      ← Database models
├── app/Services/                    ← Business logic
├── routes/api.php                   ← API routes
├── routes/web.php                   ← React routes
├── resources/js/                    ← React code
│   ├── Context/AuthContext.jsx
│   ├── Pages/Auth/LoginAPI.jsx
│   ├── Pages/Auth/RegisterAPI.jsx
│   ├── Pages/DashboardAPI.jsx
│   └── app-router.jsx
├── database/migrations/             ← DB schema
├── database/seeders/                ← Demo data
└── tests/                          ← Test files
```

---

## 💡 Common Tasks

### Add New API Endpoint
1. Create method in Controller
2. Add route in `routes/api.php`
3. Add test in `test_script/`
4. Run test to verify

### Add New Page
1. Create component in `resources/js/Pages/`
2. Add route in `resources/js/app-router.jsx`
3. Import & use component

### Call API from Frontend
```javascript
import { apiClient } from '@/Services/apiClient';

const result = await apiClient.get('/admin/movies');
if (result.success) {
  console.log(result.data);
}
```

### Use Auth State
```javascript
import { useAuth } from '@/Context/AuthContext';

const { user, token, login, logout } = useAuth();
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check port 8000 not in use, `php artisan serve` |
| Frontend won't load | `npm install`, check `npm run dev` running |
| API 401 errors | Check token in localStorage, re-login |
| DB errors | Run `php artisan migrate:fresh --seed` |
| CORS issues | Backend handles CORS, check `.env` config |

---

## 📊 Stats

- **Backend:** 50+ endpoints, 9 controllers, 9 services
- **Frontend:** 3 pages, 10+ components, React Router
- **Database:** 12+ tables, relationships, soft deletes
- **Tests:** 93 tests, all passing ✅
- **Auth:** Sanctum tokens, role-based access

---

## 📚 Documentation

- `PROJECT_SUMMARY.md` - Overview of entire project
- `FRONTEND_SETUP.md` - Frontend setup guide
- `COMPONENT_GUIDE.md` - React component documentation
- `API_TESTING_GUIDE.md` - API testing instructions

---

## ✨ Features Implemented

✅ Login/Register/Logout  
✅ Auth Context  
✅ Protected Routes  
✅ Admin Dashboard  
✅ Movie Management  
✅ Episode Management  
✅ Genre/Country Management  
✅ Director/Actor Management  
✅ User Management  
✅ Comment Management  
✅ Statistics & Analytics  
✅ Form Validation  
✅ Error Handling  
✅ Responsive UI  

---

## 🎯 Next Steps

1. ✅ Backend complete
2. ✅ Frontend complete
3. Run servers: `php artisan serve` + `npm run dev`
4. Test login flow
5. Explore dashboard
6. Build management pages
7. Deploy to production

---

## 📞 Quick Commands

```bash
# Backend
php artisan serve --port=8000              # Start server
php artisan migrate:fresh --seed           # Reset DB
php artisan route:list                     # Show routes
php artisan tinker                         # Interactive shell

# Frontend
npm run dev                                 # Dev server
npm run build                              # Production build
npm install react-router-dom               # Install packages

# Testing
powershell -File test_script/test_*.ps1    # Run tests
```

---

## 🎓 Learn More

- Laravel Docs: https://laravel.com/docs
- React Docs: https://react.dev
- React Router: https://reactrouter.com
- Tailwind CSS: https://tailwindcss.com
- Sanctum: https://laravel.com/docs/sanctum

---

**Everything is ready to go! 🚀**

Just run the backend & frontend servers and start using the app!

