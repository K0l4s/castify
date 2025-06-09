# Castify Development Setup

## Yêu cầu
- Docker Desktop for Windows
- Java 17
- Maven (hoặc dùng wrapper: `mvnw`)

## Cách sử dụng

### Lần đầu setup:
1. Cài Docker Desktop và chạy nó
2. Clone repository
3. Vào thư mục `backend`
4. Chạy `start-dev.bat`

### Các lần sau:
- **Chỉ chạy DB + Redis**: `start-dev.bat`
- **Chạy toàn bộ trong Docker**: `start-all.bat`
- **Dừng services**: `stop-dev.bat`

### Kết nối:
- **Backend**: http://localhost:9090
- **MongoDB**: localhost:27017 (không password)
- **Redis**: localhost:6379
- **Swagger UI**: http://localhost:9090/swagger-ui.html

### Lưu ý:
- MongoDB và Redis data sẽ được lưu persistent
- Thư mục `castify_resources` sẽ được tạo tự động