<?php

namespace App\Http\Controllers;

/**
 * Class Controller
 * Đây là class base controller (controller cơ sở) mà tất cả các controller khác trong ứng dụng
 * đều kế thừa. Trong Laravel 11+, base controller thường rỗng và không cần extend BaseController
 * từ framework như các phiên bản cũ, nhưng vẫn có thể dùng để chứa các logic dùng chung cho mọi controller.
 */
abstract class Controller
{
    // Hiện tại class này trống, nhưng bạn có thể thêm các traits hoặc methods
    // dùng chung cho tất cả controller tại đây (ví dụ: AuthorizesRequests, ValidatesRequests).
}
