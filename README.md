# 📖 EchoNovel - Website Đọc & Nghe Truyện

Website đọc truyện trực tuyến với chức năng Text-to-Speech (AI đọc truyện), phân quyền người dùng (Khách / Member / VIP / Admin), và hệ thống khóa chương theo mức truy cập.

## 🏗️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend | Spring Boot | 4.1.0 |
| Java | OpenJDK | 21 |
| Security | Spring Security 7 + JWT (JJWT) | 0.13.0 |
| ORM | Hibernate + Spring Data JPA | Managed |
| Frontend | React + Vite + TypeScript | Vite 8.x |
| CSS | Tailwind CSS | v4 |
| Database | MySQL | 8.0 |
| Container | Docker Compose | MySQL |

## 📁 Cấu trúc Project

```
EchoNovel/
├── backend/                          # Spring Boot Backend
│   ├── pom.xml
│   └── src/main/java/com/echonovel/
│       ├── EchoNovelApplication.java
│       ├── config/
│       │   └── DataSeeder.java       # Tạo admin mặc định
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── StoryController.java
│       │   └── ChapterController.java
│       ├── dto/
│       │   ├── ApiResponse.java      # Response chuẩn
│       │   ├── ErrorResponse.java    # Error response
│       │   ├── request/              # Request DTOs
│       │   └── response/             # Response DTOs
│       ├── entity/                   # JPA Entities
│       ├── enums/                    # Role, AccessLevel, StoryStatus
│       ├── exception/
│       │   ├── AppException.java
│       │   ├── ErrorCode.java
│       │   └── GlobalExceptionHandler.java
│       ├── repository/               # Spring Data Repositories
│       ├── security/
│       │   ├── SecurityConfig.java
│       │   ├── JwtTokenProvider.java
│       │   ├── JwtAuthenticationFilter.java
│       │   └── CustomUserDetailsService.java
│       └── service/                  # Business Logic
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   ├── pages/                    # Page components
│   │   ├── services/                 # Axios API calls
│   │   ├── context/                  # React Context (Auth)
│   │   ├── hooks/                    # Custom hooks
│   │   ├── types/                    # TypeScript interfaces
│   │   └── utils/                    # Helpers & constants
│   ├── .env
│   └── vite.config.ts
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🚀 Hướng dẫn chạy project

### Yêu cầu
- **Docker & Docker Compose** (cho MySQL)
- **Java 21** (JDK)
- **Maven** (hoặc dùng `./mvnw`)
- **Node.js 20+** & **npm**

---

### Bước 1: Khởi chạy Database (MySQL)

```bash
# Từ thư mục root EchoNovel
docker-compose up -d

# Kiểm tra MySQL đã chạy
docker-compose ps
```

MySQL sẽ chạy tại **port 3307** (localhost:3307)

---

### Bước 2: Cấu hình Backend

File `backend/src/main/resources/application.properties` đã được cấu hình sẵn.

> ⚠️ Nếu bạn clone từ Git, hãy copy `application-example.properties` thành `application.properties` và điền các giá trị:

| Key | Mô tả | Giá trị mặc định |
|-----|--------|------------------|
| `spring.datasource.username` | MySQL username | `echonovel` |
| `spring.datasource.password` | MySQL password | `echonovel123` |
| `app.jwt.secret` | JWT signing key (≥32 ký tự) | Đã có sẵn |
| `app.jwt.expiration` | Token TTL (ms) | `86400000` (24h) |

---

### Bước 3: Chạy Backend

```bash
cd backend

# Cài Maven Wrapper (lần đầu)
mvn wrapper:wrapper

# Build & Run
./mvnw spring-boot:run
```

Backend sẽ chạy tại: **http://localhost:8080**

Khi chạy lần đầu, hệ thống sẽ:
1. Tự động tạo bảng trong MySQL (Hibernate `ddl-auto=update`)
2. Tự động tạo tài khoản Admin mặc định (DataSeeder)

---

### Bước 4: Chạy Frontend

```bash
cd frontend

# Cài dependencies
npm install

# Chạy dev server
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3000**

---

## 🔐 Tài khoản Admin mặc định

| Field | Value |
|-------|-------|
| **Email** | `admin@echonovel.com` |
| **Password** | `Admin@123` |
| **Role** | ADMIN |
| **VIP** | true |

### Cách đăng nhập:

```bash
# Sử dụng cURL hoặc Postman
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@echonovel.com","password":"Admin@123"}'
```

Response sẽ trả về JWT token:
```json
{
  "status": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOi...",
    "type": "Bearer",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@echonovel.com",
      "role": "ADMIN",
      "isVip": true
    }
  }
}
```

Sử dụng token này trong header `Authorization: Bearer <token>` để gọi các API yêu cầu xác thực.

---

## 📡 API Endpoints

### Public (không cần token)
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |
| GET | `/api/stories` | Danh sách truyện (phân trang) |
| GET | `/api/stories/{id}` | Chi tiết truyện |
| GET | `/api/stories/search?keyword=` | Tìm kiếm truyện |
| GET | `/api/stories/genre/{genreId}` | Lọc theo thể loại |
| GET | `/api/chapters/story/{storyId}` | Danh sách chương |
| GET | `/api/chapters/{id}` | Đọc chương |

### Admin (cần token + role ADMIN)
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/api/admin/stories` | Tạo truyện |
| PUT | `/api/admin/stories/{id}` | Sửa truyện |
| DELETE | `/api/admin/stories/{id}` | Xóa truyện |
| POST | `/api/admin/chapters` | Tạo chương |
| PUT | `/api/admin/chapters/{id}` | Sửa chương |
| DELETE | `/api/admin/chapters/{id}` | Xóa chương |

---

## 📋 API Response Format

### Thành công:
```json
{
  "status": 200,
  "message": "Success",
  "data": { ... }
}
```

### Lỗi:
```json
{
  "status": 400,
  "errorCode": "VALIDATION_ERROR",
  "message": "Dữ liệu không hợp lệ",
  "details": {
    "email": "Email không hợp lệ",
    "password": "Mật khẩu phải từ 6-100 ký tự"
  }
}
```

---

## 🗄️ Database Entities

| Entity | Bảng | Đặc biệt |
|--------|------|-----------|
| User | `users` | `role` (ADMIN/MEMBER), `is_vip` (boolean) |
| Genre | `genres` | ManyToMany với Story |
| Author | `authors` | OneToMany với Story |
| Story | `stories` | `status` (ONGOING/COMPLETED) |
| Chapter | `chapters` | `access_level` (PUBLIC/MEMBER/VIP) |

---

## 📝 Biến môi trường cần điền

### Docker (`.env` ở thư mục root)
```
MYSQL_ROOT_PASSWORD=root123
MYSQL_DATABASE=echonovel_db
MYSQL_USER=echonovel
MYSQL_PASSWORD=echonovel123
```

### Backend (`application.properties`)
```
spring.datasource.username=echonovel
spring.datasource.password=echonovel123
app.jwt.secret=<chuỗi ≥32 ký tự>
```

### Frontend (`.env`)
```
VITE_API_BASE_URL=http://localhost:8080/api
```
