# EchoNovel - Setup Nền Tảng Project (Tuần 1)

Website Đọc & Nghe Truyện với chức năng Text-to-Speech. Thiết lập toàn bộ monorepo: Backend (Spring Boot 4.1.0), Frontend (React Vite + TypeScript), Docker (MySQL 8).

## Tech Stack Xác Nhận

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend** | Spring Boot | 4.1.0 (Spring Framework 7, Spring Security 7) |
| **Java** | OpenJDK | 21 (LTS) |
| **ORM** | Hibernate + Spring Data JPA | Managed by Spring Boot |
| **Security** | Spring Security 7 + JJWT | 0.13.0 |
| **Frontend** | React + Vite + TypeScript | Vite 8.x |
| **CSS** | Tailwind CSS v4 | (theo yêu cầu user) |
| **Database** | MySQL | 8.0 |
| **Container** | Docker Compose | MySQL container |

## User Review Required

> [!IMPORTANT]
> **Về Tailwind CSS**: Sử dụng **Tailwind CSS v4** (phiên bản stable mới nhất). Đồng ý?

> [!IMPORTANT]
> **Về JWT approach**: Triển khai **custom JwtAuthenticationFilter** với JJWT library (không dùng OAuth2 Resource Server built-in) để có toàn quyền kiểm soát flow đăng nhập/đăng ký. Đồng ý?

> [!IMPORTANT]
> **Về Frontend language**: Sử dụng **TypeScript** cho type-safety. Đồng ý?

> [!IMPORTANT]
> **Seeding Data - Tài khoản Admin mặc định**:
> - **Email**: `admin@echonovel.com`
> - **Password**: `Admin@123`
> - **Role**: ADMIN, isVip: true
> - Tạo tự động bằng `CommandLineRunner`, chỉ tạo khi DB chưa có user nào có email này
> - Bạn muốn đổi thông tin đăng nhập mặc định khác không?

---

## Proposed Changes

### 1. Docker & Infrastructure

#### [NEW] docker-compose.yml
- MySQL 8.0 container
- Database: `echonovel_db`, user: `echonovel`, password: configurable qua `.env`
- Port mapping: `3307:3306` (tránh conflict với MySQL local)
- Volume persist data

#### [NEW] .gitignore
- Ignore IDE files, build outputs, `.env`, `application.properties`

#### [NEW] .env + .env.example
- Biến môi trường cho Docker & Frontend

---

### 2. Backend - Spring Boot 4.1.0

#### [NEW] pom.xml
Dependencies:
- `spring-boot-starter-web`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-security`
- `spring-boot-starter-validation`
- `mysql-connector-j`
- `lombok`
- `jjwt-api`, `jjwt-impl`, `jjwt-jackson` (0.13.0)

#### [NEW] EchoNovelApplication.java
- Main application class

#### Cấu hình (config/)
| File | Mô tả |
|------|--------|
| `application.properties` | DB connection, JPA config, JWT secret, server port 8080 |
| `application-example.properties` | Template rỗng hướng dẫn |

#### Entities (entity/)
| Entity | Quan hệ | Đặc biệt |
|--------|---------|-----------|
| `User` | - | `role` (ADMIN/MEMBER), `isVip` (boolean), `password` (encoded) |
| `Genre` | ManyToMany với Story | Thể loại truyện |
| `Author` | OneToMany với Story | Tác giả |
| `Story` | ManyToOne Author, ManyToMany Genre | Truyện, `status` (ONGOING/COMPLETED) |
| `Chapter` | ManyToOne Story | `accessLevel` enum (PUBLIC/MEMBER/VIP), `chapterNumber` |

#### Enums (enums/)
- `Role`: ADMIN, MEMBER
- `AccessLevel`: PUBLIC, MEMBER, VIP
- `StoryStatus`: ONGOING, COMPLETED

#### DTOs (dto/request/ & dto/response/)
- `LoginRequest`, `RegisterRequest`
- `StoryRequest`, `ChapterRequest`
- `UserResponse`, `StoryResponse`, `ChapterResponse`
- `AuthResponse` (chứa JWT token + user info)

#### Core Response & Exception (dto/ & exception/)
| File | Mô tả |
|------|--------|
| `ApiResponse<T>` | Chuẩn hóa response: `{status, message, data}` |
| `ErrorResponse` | Response lỗi: `{status, errorCode, message, details}` |
| `AppException` | Custom RuntimeException với ErrorCode |
| `ErrorCode` | Enum chứa (code, message, httpStatus) |
| `GlobalExceptionHandler` | `@RestControllerAdvice` bắt tất cả exception |

#### Security (security/)
| File | Mô tả |
|------|--------|
| `SecurityConfig` | SecurityFilterChain, CORS, route permissions |
| `JwtTokenProvider` | Generate/validate JWT token bằng JJWT |
| `JwtAuthenticationFilter` | OncePerRequestFilter, đọc token từ header |
| `CustomUserDetailsService` | Load user từ DB |

#### 🆕 Seeding Data (config/)
| File | Mô tả |
|------|--------|
| `DataSeeder` | `CommandLineRunner` - tạo tài khoản Admin mặc định khi chạy lần đầu |

```java
// DataSeeder.java - Logic chính
@Component
public class DataSeeder implements CommandLineRunner {
    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@echonovel.com")) {
            User admin = User.builder()
                .username("admin")
                .email("admin@echonovel.com")
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .isVip(true)
                .build();
            userRepository.save(admin);
            log.info("✅ Default admin created: admin@echonovel.com / Admin@123");
        }
    }
}
```

#### Repository (repository/)
- `UserRepository`, `GenreRepository`, `AuthorRepository`, `StoryRepository`, `ChapterRepository`

#### Service (service/)
- `AuthService` (login, register)
- `StoryService` (CRUD)
- `ChapterService` (CRUD)

#### Controller (controller/)
- `AuthController` (`/api/auth/login`, `/api/auth/register`)
- `StoryController` (`/api/admin/stories/**`, `/api/stories/**`)
- `ChapterController` (`/api/admin/chapters/**`, `/api/chapters/**`)

---

### 3. Frontend - React + Vite + TypeScript

#### Cấu trúc thư mục
```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page components
│   ├── services/         # API calls (Axios)
│   ├── utils/            # Helpers, constants
│   ├── context/          # React Context (Auth)
│   ├── hooks/            # Custom hooks
│   ├── types/            # TypeScript interfaces
│   ├── App.tsx
│   └── main.tsx
├── .env
├── .env.example
├── package.json
└── vite.config.ts
```

#### Axios Setup
- `services/api.ts`: Axios instance, interceptor tự động gắn JWT
- Response interceptor xử lý 401 → redirect login

#### Auth Context
- `context/AuthContext.tsx`: Quản lý trạng thái đăng nhập, token storage

---

### 4. Documentation

#### [NEW] README.md
- Hướng dẫn chạy Docker, Backend, Frontend step-by-step
- **Thông tin tài khoản Admin mặc định** (email + password)
- Liệt kê các key/biến cần điền
- Mô tả cấu trúc project

---

## Verification Plan

### Automated Tests
```bash
# 1. Docker MySQL khởi chạy thành công
docker-compose up -d
docker-compose ps

# 2. Backend build thành công
cd backend
./mvnw clean compile

# 3. Frontend build thành công
cd frontend
npm install
npm run build
```

### Manual Verification
- Backend khởi động tại `http://localhost:8080`
- Frontend dev server tại `http://localhost:3000`
- Console hiển thị log: `✅ Default admin created: admin@echonovel.com / Admin@123`
- API `POST /api/auth/login` với `admin@echonovel.com` / `Admin@123` → trả JWT token
- API route admin bị chặn khi không có JWT / role không phải ADMIN
- Hibernate tự động tạo bảng trong MySQL

---

## Thứ tự triển khai (8 bước)

1. **Bước 1**: Docker + `.gitignore` + `.env` files
2. **Bước 2**: Backend `pom.xml` + `application.properties` + Main class
3. **Bước 3**: Entities + Enums + Repositories
4. **Bước 4**: `ApiResponse` + `ErrorResponse` + `AppException` + `ErrorCode` + `GlobalExceptionHandler`
5. **Bước 5**: Security (JWT + Filter + Config + CORS)
6. **Bước 6**: DTOs + Services + Controllers + **DataSeeder**
7. **Bước 7**: Frontend init (Vite + Tailwind + Axios + Auth Context)
8. **Bước 8**: `README.md`

---

## 📋 Đối chiếu với Đề Bài & Gợi Ý Các Bước Tiếp Theo

> Tôi đã đọc file [de-bai-website-nghe-doc-truyen 1.md](file:///c:/Study/FresherFS/EchoNovel/de-bai-website-nghe-doc-truyen%201.md). Dưới đây là phân tích và roadmap gợi ý.

### ✅ Setup hiện tại (Tuần 1) sẽ hoàn thành:
- [x] Thiết kế CSDL (entities cho users, genres, authors, stories, chapters)
- [x] Spring Security + JWT (đăng ký/đăng nhập/phân quyền Member/Admin)
- [x] CRUD truyện + chương phía Admin (REST endpoint)
- [x] Đặt mức khóa chương (accessLevel: PUBLIC/MEMBER/VIP)
- [x] DataSeeder tạo admin mặc định
- [x] Frontend skeleton (React + Vite + TypeScript + Tailwind + Axios)

### 🔜 Gợi ý các bước tiếp theo sau khi setup xong:

#### Tuần 1 (phần còn lại) - Hoàn thiện Backend CRUD
| # | Việc cần làm | Mức độ | Trạng thái |
|---|-------------|--------|------------|
| 1 | CRUD Thể loại (`Genre`) & Tác giả (`Author`) cho Admin | [BB] | ✅ Đã xong |
| 2 | Admin cấp/thu hồi VIP cho Member | [BB] | ✅ Đã xong |
| 3 | API danh sách truyện có phân trang, lọc, sắp xếp | [BB] | ✅ Đã xong |
| 4 | API chi tiết truyện + danh sách chương | [BB] | ✅ Đã xong |
| 5 | API đọc chương có kiểm tra quyền (access_level vs role/isVip) | [BB] | ✅ Đã xong |

#### Tuần 2 - Frontend cơ bản + luồng đọc
| # | Việc cần làm | Mức độ | Trạng thái |
|---|-------------|--------|------------|
| 1 | Routing, Layouts (MainLayout/AdminLayout), Trang đăng nhập / đăng ký | [BB] | ✅ Đã xong |
| 2 | Trang danh sách truyện (tìm kiếm/lọc/phân trang) | [BB] | ✅ Đã xong |
| 3 | Trang chi tiết truyện + danh sách chương (icon khóa) | [BB] | ✅ Đã xong |
| 4 | Trang đọc chương (chuyển chương trước/sau) | [BB] | ✅ Đã xong |
| 5 | Xử lý 403 → hiển thị yêu cầu đăng nhập/nâng cấp VIP | [BB] | ✅ Đã xong |

#### Tuần 3 - Audio & TTS
| # | Việc cần làm | Mức độ |
|---|-------------|--------|
| 1 | Entity `AudioFile` (chapter_id, file_path, source UPLOAD/TTS) | [BB] |
| 2 | Admin upload audio cho chương | [BB] |
| 3 | Trình phát audio HTML5 trên React | [BB] |
| 4 | Tích hợp FPT.AI TTS API | [BB] |
| 5 | Cache file audio đã tạo | [BB] |
| 6 | Kiểm tra quyền trước khi phát/tạo audio | [BB] |

#### Tuần 4 - Tính năng nâng cao
| # | Việc cần làm | Mức độ |
|---|-------------|--------|
| 1 | Gợi ý truyện tương tự theo thể loại | [NC] |
| 2 | Trang thống kê Admin (Chart.js) | [NC] |
| 3 | Đánh giá/bình luận, yêu thích | [NC] |
| 4 | Chế độ nghe liên tục | [NC] |

#### Tuần 5 - Hoàn thiện
| # | Việc cần làm | Mức độ |
|---|-------------|--------|
| 1 | Viết unit test (JUnit 5 + Mockito) | [BB] |
| 2 | Sửa lỗi, tối ưu giao diện | [BB] |
| 3 | Dark mode, tùy chỉnh cỡ chữ | [NC] |
| 4 | README + báo cáo + video demo | [BB] |

> [!TIP]
> **Lưu ý từ đề bài**: Nếu sau 2-3 tuần tiến độ chậm, nên cắt các mục [NC] để đảm bảo hoàn thành [BB]. Hai chức năng trọng tâm không nên cắt: **Khóa chương** và **TTS**.
