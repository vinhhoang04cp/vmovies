<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Class ProfileController
 * Quản lý các chức năng liên quan đến tài khoản/hồ sơ cá nhân của người dùng (profile).
 * Thường được cung cấp bởi Laravel Breeze hoặc Jetstream để xử lý frontend bằng Inertia.js.
 */
class ProfileController extends Controller
{
    /**
     * Hiển thị form chỉnh sửa hồ sơ người dùng.
     * Trả về giao diện Inertia cho trang Edit Profile.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            // Kiểm tra xem user có implement MustVerifyEmail hay không (cần xác thực email)
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            // Trạng thái (status) từ session, thường dùng để hiển thị flash message sau khi cập nhật
            'status' => session('status'),
        ]);
    }

    /**
     * Cập nhật thông tin hồ sơ của người dùng (tên, email...).
     * Request được validate bởi ProfileUpdateRequest trước khi chạy vào hàm này.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        // Gán dữ liệu đã validate vào model User hiện tại
        $request->user()->fill($request->validated());

        // Nếu email bị thay đổi, reset lại email_verified_at thành null (bắt người dùng xác thực lại email mới)
        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        // Lưu thông tin người dùng vào database
        $request->user()->save();

        // Chuyển hướng về lại trang edit profile
        return Redirect::route('profile.edit');
    }

    /**
     * Xóa tài khoản người dùng hiện tại (Delete account).
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Yêu cầu người dùng phải nhập đúng mật khẩu hiện tại để xác nhận việc xóa
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        // Đăng xuất người dùng ra khỏi hệ thống
        Auth::logout();

        // Xóa bản ghi người dùng khỏi CSDL
        $user->delete();

        // Xóa toàn bộ session hiện tại
        $request->session()->invalidate();
        // Tạo lại token CSRF mới để bảo mật (tránh lỗi Session Fixation)
        $request->session()->regenerateToken();

        // Chuyển hướng người dùng về trang chủ
        return Redirect::to('/');
    }
}
