# CVAT Role-Based Access Control (RBAC) Demo

Dự án này là một bản Frontend mẫu (React + Vite) tích hợp tính năng Đăng nhập và Phân quyền (RBAC) chuẩn theo kiến trúc bảo mật của **CVAT (Computer Vision Annotation Tool)**.

Dự án giúp bạn dễ dàng kết nối, lấy Token và mô phỏng giao diện Dashboard thay đổi theo 8 cấp độ quyền hạn (Từ Superuser, Global Admin đến các Org Roles).

---

## ⚠️ Lưu ý Quan Trọng Về Cấu Trúc Thư Mục

Dự án gồm 2 thư mục chính:
1. `frontend/`: Ứng dụng React (Vite) chính. Đây là phần lõi sẽ kết nối với CVAT.
2. `backend/`: **Đây CHỈ LÀ MOCK DATA (Dữ liệu giả lập).** Thư mục này chứa một server Node.js nhỏ giọt được viết ra trong giai đoạn đầu để test giao diện (trước khi có CVAT thật). **Bạn KHÔNG CẦN chạy thư mục này** nếu đã có CVAT thật chạy trên máy.

---

## Hướng Dẫn Cài Đặt Chi Tiết

Để chạy hoàn chỉnh hệ thống này, bạn cần thực hiện 2 phần: **Dựng CVAT Server thật (bằng Docker)** và **Chạy Frontend React**.

### Phần 1: Tự Host CVAT Server (Localhost)

**Yêu cầu:** Đã cài đặt [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Đảm bảo đã bật và chạy xanh).

**Bước 1: Tải mã nguồn CVAT**
Mở Terminal, di chuyển ra ngoài thư mục dự án này và clone CVAT về:
```bash
git clone https://github.com/cvat-ai/cvat.git
cd cvat
```

**Bước 2: Cấu hình cho phép kết nối API (Cực kỳ quan trọng)**
Mặc định CVAT sẽ chặn API từ các nguồn lạ. Để Frontend (cổng 5173) có thể gọi vào CVAT (cổng 8080), hãy tạo một file tên là `docker-compose.override.yml` bên trong thư mục `cvat` vừa tải về, nội dung như sau:
```yaml
services:
  cvat_server:
    environment:
      CORS_ALLOW_ALL_ORIGINS: 'True'
      CVAT_ALLOWED_HOSTS: '*'
```

**Bước 3: Khởi động hệ thống CVAT**
```bash
docker compose up -d
```
*(Lần đầu tiên sẽ mất khoảng 15 phút để tải Docker Images. Hãy chờ cho đến khi tất cả các container chuyển trạng thái Running).*

**Bước 4: Tạo tài khoản Superuser tối cao**
Chạy lệnh sau để tạo tài khoản Chúa tể (God Mode) cho hệ thống:
```bash
docker exec -it cvat_server bash -ic 'python3 ~/manage.py createsuperuser'
```
*Nhập Username (vd: `admin`), Email và Password theo hướng dẫn trên màn hình.*

---

### Phần 2: Khởi Động Frontend React

Sau khi Server CVAT ở cổng `8080` đã chạy thành công, bạn quay lại thư mục dự án này (`LogIn_LogOut`).

**Bước 1: Cài đặt thư viện**
Mở Terminal, trỏ vào thư mục `frontend`:
```bash
cd frontend
npm install
```

**Bước 2: Khởi động Vite Server**
```bash
npm run dev
```
Trình duyệt sẽ mở ra ở địa chỉ: **`http://localhost:5173`**

*(Lưu ý: Hệ thống Vite đã được cấu hình sẵn hệ thống Proxy ngầm trong file `vite.config.js` để tự động đẩy mọi API sang `http://localhost:8080` và lách luật CORS của trình duyệt, bạn không cần cấu hình gì thêm).*

---

### Phần 3: Trải Nghiệm Và Kiểm Tra Phân Quyền

1. Mở trang `http://localhost:5173`.
2. Đăng nhập bằng tài khoản Superuser bạn vừa tạo ở Bước 4 (Phần 1).
3. Nếu thành công, bạn sẽ thấy Dashboard hiện thẻ **Superuser (Global Override)** màu đỏ.
4. Bạn có thể lên trang quản trị gốc của CVAT (`http://localhost:8080/admin`) để tạo thêm các tài khoản thuộc nhóm `admin`, `user`, `worker` và đăng nhập chéo trên Tool Frontend để kiểm tra logic phân quyền hiển thị (Ẩn/Hiện nút Manage Projects, Manage Members,...).

**Chúc bạn lập trình vui vẻ!**
