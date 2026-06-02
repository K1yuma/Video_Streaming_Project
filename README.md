# 🎥 Ứng dụng Streaming Video Đơn Giản

Một dự án cơ bản để tìm hiểu về streaming video và phát trực tiếp (live broadcasting). Dự án này sử dụng Spring Boot cho backend và React cho frontend.

---

## Tính năng

### Tải lên & Xem Video
- **Tải lên Video:** Cách đơn giản để tải lên các tệp MP4.
- **Streaming Video:** Sử dụng FFmpeg để chuyển đổi video sang định dạng HLS để có thể phát theo từng phân đoạn (chunks).
- **Phát Video Cơ Bản:** Xem các video đã tải lên bằng trình phát web tiêu chuẩn.

### Phát Trực Tiếp & Chat
- **Phát Trực Tiếp:** Tích hợp cơ bản với MediaMTX để tìm hiểu cách hoạt động của luồng trực tiếp.
- **Khung Chat:** Một phòng chat đơn giản để gửi tin nhắn trong khi xem live.

---

## Công nghệ sử dụng

- **Backend:** Java 21 & Spring Boot
- **Frontend:** React (Vite) & Tailwind CSS
- **Cơ sở dữ liệu:** MySQL
- **Xử lý Video:** FFmpeg
- **Media Server:** MediaMTX

---

## Cách Chạy Dự Án

### 1. Điều kiện cần thiết
- Cài đặt **Java 21**.
- Cài đặt **Node.js** (để chạy frontend).
- Cài đặt **MySQL**.
- Cài đặt **FFmpeg** (đảm bảo đã thêm vào đường dẫn hệ thống - system path).

### 2. Thiết lập Cơ sở dữ liệu
- Tạo một database MySQL và cập nhật thông tin đăng nhập trong tệp `backend/src/main/resources/application.properties`.

### 3. Khởi động nhanh (Windows)
Dự án đã có sẵn file script để khởi động tất cả các dịch vụ cùng lúc:

1. Mở thư mục dự án.
2. Chạy file `start-all-dev.bat`.

Script này sẽ tự động mở các cửa sổ command prompt riêng biệt để chạy:
- **MediaMTX Server:** Xử lý luồng trực tiếp.
- **Backend:** Spring Boot API.
- **Frontend:** Giao diện React (Vite).
- **Cloudflare Tunnel:** (Tùy chọn) Để tạo link public nếu cần.

---

## Cấu trúc Dự án

- `backend/`: Mã nguồn Spring Boot xử lý tải lên và chat.
- `frontend/`: Các component React cho giao diện người dùng.
- `mediamtx/`: Công cụ được sử dụng để xử lý dữ liệu luồng trực tiếp.
- `videos/`: Thư mục lưu trữ các video đã tải lên.

