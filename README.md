## Dành cho Developer (Cần Node.js 20+, Khuyên dùng)

Nếu chưa cài đặt Node.js, hãy tải và cài đặt phiên bản LTS từ [Trang chủ Node.js](https://nodejs.org/).

Chạy trực tiếp và phát triển ứng dụng:

```bash
npm install
npm run dev

```

---

## Khởi chạy (Docker)

### 1. Hướng dẫn cài đặt Docker

- **Windows:**

1. Tải và chạy bộ cài [Docker Desktop cho Windows](https://www.docker.com/products/docker-desktop/) (phần mềm sẽ tự động thiết lập các thành phần WSL 2 đi kèm).

- **macOS:**

1. Tải và cài đặt [Docker Desktop cho Mac](https://www.docker.com/products/docker-desktop/) (chọn đúng phiên bản cho chip Apple Silicon M1/M2/M3 hoặc Intel).

- **Linux (Ubuntu/Debian):**

1. Chạy script cài đặt tự động có sẵn trong dự án:

```bash
chmod +x scripts/install-docker.sh && ./scripts/install-docker.sh

```

2. Sau khi chạy xong, hãy đăng xuất và đăng nhập lại VPS/Server để cập nhật quyền chạy Docker.

### 2. Khởi chạy ứng dụng

Tại thư mục chứa source code của dự án, chạy lệnh sau:

```bash
docker compose up -d --build

```

Ứng dụng sẽ tự động được build và chạy ngầm tại: [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)

- **Xem logs:** `docker compose logs -f`
- **Dừng lại:** `docker compose down`
