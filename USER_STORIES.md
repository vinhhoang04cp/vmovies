# Tài liệu Chức năng & User Stories - VMovies

Dựa vào cấu trúc hệ thống (API Routes và Controllers), dưới đây là danh sách toàn bộ các chức năng người dùng có thể thực hiện trên hệ thống VMovies, được chia theo từng nhóm quyền, kèm theo định dạng chuẩn **User Stories**.

---

## 1. DÀNH CHO KHÁCH VÃNG LAI (GUEST)
*(Người dùng chưa đăng nhập hệ thống)*

### Chức năng có thể thực hiện:
*   Xem danh sách các bộ phim, lọc theo thể loại, quốc gia.
*   Xem thông tin chi tiết của một bộ phim.
*   Xem danh sách tập phim và phát video của một tập phim cụ thể.
*   Đọc các bình luận công khai và xem điểm đánh giá của các bộ phim.
*   Đăng ký tài khoản mới và Đăng nhập.

### User Stories:
*   **Là một Khách vãng lai**, tôi muốn **xem danh sách các bộ phim mới nhất**, để **tôi có thể tìm kiếm bộ phim mình muốn xem**.
*   **Là một Khách vãng lai**, tôi muốn **lọc phim theo thể loại và quốc gia**, để **tôi dễ dàng tìm được phim đúng với sở thích cá nhân**.
*   **Là một Khách vãng lai**, tôi muốn **xem thông tin chi tiết của một bộ phim (tóm tắt, đạo diễn, diễn viên)**, để **tôi quyết định có nên xem phim đó hay không**.
*   **Là một Khách vãng lai**, tôi muốn **chọn và xem video của một tập phim**, để **tôi có thể thưởng thức nội dung giải trí**.
*   **Là một Khách vãng lai**, tôi muốn **đọc bình luận và đánh giá của người khác**, để **tôi biết chất lượng của bộ phim ra sao**.
*   **Là một Khách vãng lai**, tôi muốn **đăng ký tài khoản mới**, để **tôi có thể sử dụng các tính năng cá nhân hóa như bình luận và lưu phim**.
*   **Là một Khách vãng lai**, tôi muốn **đăng nhập vào hệ thống**, để **tôi có thể truy cập vào hồ sơ và tủ phim của mình**.

---

## 2. DÀNH CHO THÀNH VIÊN (MEMBER)
*(Người dùng đã đăng nhập, bao gồm mọi quyền của Khách vãng lai)*

### Chức năng có thể thực hiện:
*   Quản lý phiên đăng nhập (Lấy thông tin cá nhân, Đăng xuất, Làm mới Token).
*   Quản lý Tủ phim / Yêu thích (Bookmark): Xem danh sách, thêm phim, xóa phim khỏi tủ.
*   Tương tác Bình luận (Comment): Viết bình luận, xóa bình luận của chính mình.
*   Đánh giá phim (Rating): Gửi điểm đánh giá, xem lại đánh giá cá nhân.

### User Stories:
*   **Là một Thành viên**, tôi muốn **xem thông tin tài khoản cá nhân của mình**, để **tôi kiểm tra lại thông tin hồ sơ**.
*   **Là một Thành viên**, tôi muốn **đăng xuất khỏi hệ thống**, để **tôi bảo vệ tài khoản khi dùng chung thiết bị**.
*   **Là một Thành viên**, tôi muốn **thêm một bộ phim vào danh sách Yêu thích (Bookmark)**, để **tôi có thể xem lại bộ phim đó sau này**.
*   **Là một Thành viên**, tôi muốn **xem danh sách phim tôi đã lưu**, để **tôi dễ dàng tiếp tục theo dõi các bộ phim yêu thích**.
*   **Là một Thành viên**, tôi muốn **xóa một bộ phim khỏi danh sách Yêu thích**, để **tôi dọn dẹp tủ phim khi không còn nhu cầu xem nữa**.
*   **Là một Thành viên**, tôi muốn **viết bình luận cho một bộ phim/tập phim**, để **tôi chia sẻ cảm nghĩ của mình với cộng đồng**.
*   **Là một Thành viên**, tôi muốn **xóa bình luận do chính mình viết**, để **tôi gỡ bỏ những nội dung tôi không muốn chia sẻ nữa**.
*   **Là một Thành viên**, tôi muốn **chấm điểm (đánh giá từ 1-10) cho bộ phim**, để **tôi thể hiện mức độ hài lòng về tác phẩm**.

---

## 3. DÀNH CHO QUẢN TRỊ VIÊN (ADMIN)
*(Người dùng có quyền quản trị tối cao)*

### Chức năng có thể thực hiện:
*   Xem bảng thống kê tổng quan (Dashboard, Số liệu Phim, User, Bình luận).
*   Quản lý Phim: Xem danh sách, Thêm, Sửa, Xóa mềm (Trash), Khôi phục. Gán các quan hệ (Thể loại, Quốc gia, Đạo diễn, Diễn viên).
*   Quản lý Tập phim: Xem, Thêm mới, Tạo hàng loạt (Bulk-create), Sắp xếp thứ tự (Reorder), Sửa, Xóa.
*   Quản lý Danh mục & Nhân sự (Genres, Countries, Directors, Actors): Thêm, Sửa, Xóa, Khôi phục.
*   Quản lý Người dùng: Xem danh sách, Sửa thông tin, Xóa, Cấm (Ban) hoặc Bỏ cấm (Unban) người dùng.
*   Quản lý Bình luận: Xem toàn bộ bình luận, Xem các bình luận chờ duyệt, Duyệt bình luận, Xóa bình luận vi phạm.

### User Stories:

#### Nhóm Thống kê & Phim
*   **Là một Quản trị viên**, tôi muốn **xem biểu đồ thống kê trên Dashboard**, để **tôi nắm bắt được tình hình hoạt động của toàn bộ nền tảng**.
*   **Là một Quản trị viên**, tôi muốn **thêm một bộ phim mới vào hệ thống**, để **cập nhật kho nội dung phục vụ người xem**.
*   **Là một Quản trị viên**, tôi muốn **gắn Thể loại, Đạo diễn, Diễn viên vào một bộ phim**, để **thông tin phim được hiển thị đầy đủ và dễ dàng tìm kiếm**.
*   **Là một Quản trị viên**, tôi muốn **khôi phục một bộ phim đã xóa (Soft Delete)**, để **tôi có thể sửa chữa sai lầm nếu lỡ tay xóa nhầm**.

#### Nhóm Tập phim
*   **Là một Quản trị viên**, tôi muốn **thêm nhiều tập phim cùng lúc (Bulk-create)**, để **tôi tiết kiệm thời gian khi upload một bộ phim nhiều tập (Series)**.
*   **Là một Quản trị viên**, tôi muốn **sắp xếp lại thứ tự các tập phim (Reorder)**, để **đảm bảo mạch truyện hiển thị đúng cho người xem**.

#### Nhóm Danh mục & Nhân sự
*   **Là một Quản trị viên**, tôi muốn **thêm mới một Quốc gia hoặc Thể loại**, để **tôi mở rộng phân loại nội dung cho hệ thống**.
*   **Là một Quản trị viên**, tôi muốn **quản lý danh sách Đạo diễn và Diễn viên**, để **tôi xây dựng cơ sở dữ liệu nhân sự điện ảnh phong phú**.

#### Nhóm Người dùng
*   **Là một Quản trị viên**, tôi muốn **xem danh sách toàn bộ người dùng**, để **tôi quản lý cộng đồng thành viên**.
*   **Là một Quản trị viên**, tôi muốn **Khóa (Ban) một tài khoản người dùng**, để **tôi ngăn chặn những người dùng vi phạm quy tắc cộng đồng**.

#### Nhóm Bình luận
*   **Là một Quản trị viên**, tôi muốn **xem danh sách các bình luận đang chờ duyệt**, để **tôi kiểm duyệt nội dung trước khi cho hiển thị công khai**.
*   **Là một Quản trị viên**, tôi muốn **duyệt (Approve) hoặc xóa (Destroy) một bình luận**, để **đảm bảo môi trường trao đổi trên nền tảng luôn văn minh và sạch sẽ**.
