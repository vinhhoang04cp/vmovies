$u = App\Models\User::where("email", "admin@vmovies.com")->first(); echo json_encode(app(App\Services\Auth\AuthService::class)->generateTokenResponse($u));
