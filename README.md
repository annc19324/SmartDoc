# SmartDoc - AI-Powered Intelligent Learning & RAG Platform

> **Đồ Án Tốt Nghiệp / Graduation Thesis Project**  
> Hệ thống học tập thông minh sử dụng Trí Tuệ Nhân Tạo (AI) để biến tài liệu học tập tĩnh thành một môi trường học tập tương tác toàn diện.

---

## 🌟 1. Tổng Quan Dự Án

**SmartDoc** cho phép người dùng tải lên tài liệu học tập (PDF, Word, TXT, Hình ảnh), tự động xử lý văn bản, chia đoạn (chunking), tạo embedding thông qua mô hình ngôn ngữ lớn của Google Gemini và lưu trữ vector vào **Neon PostgreSQL với pgvector**.

Từ đó, sinh viên và giảng viên có thể:
1. **Tìm kiếm ngữ nghĩa (Semantic Smart Search):** Tìm tài liệu dựa trên ý nghĩa câu hỏi chứ không chỉ từ khóa tiêu đề.
2. **Hỏi đáp RAG (Retrieval-Augmented Generation):** Chat trực tiếp với tài liệu, câu trả lời bám sát ngữ cảnh kèm trích dẫn chính xác số trang.
3. **Tóm tắt AI (Summary):** Tóm tắt chi tiết, tóm tắt ngắn, trích xuất luận điểm cốt lõi và bảng thuật ngữ chuyên ngành.
4. **Luyện tập trắc nghiệm (AI Quiz):** Tự động sinh đề thi trắc nghiệm theo độ khó (Dễ / Trung bình / Khó), chấm điểm và giải thích chi tiết.
5. **Thẻ ghi nhớ (Flashcards):** Ôn tập ngắt quãng (Spaced Repetition) với hiệu ứng lật thẻ 3D trực quan.
6. **Sơ đồ tư duy (Mindmap):** Khái quát cấu trúc kiến thức phân cấp dạng cây (Tree), hỗ trợ phóng to, thu nhỏ và đóng mở nhánh.
7. **Kế hoạch học tập (Study Plan):** AI lập lộ trình học tập tối ưu theo từng ngày dựa trên ngày thi và mục tiêu điểm số.
8. **Phân tích học tập (Learning Analytics):** Theo dõi tiến độ, phát hiện chủ đề còn yếu và đưa ra lời khuyên học tập cá nhân hóa từ AI.

---

## 🏗️ 2. Kiến Trúc Hệ Thống (Architecture)

```
                            SMARTDOC
                               │
                     ┌─────────▼─────────┐
                     │   React + Vite    │
                     │    TypeScript     │
                     │    TailwindCSS    │
                     └─────────┬─────────┘
                               │ REST API
                               ▼
                     ┌───────────────────┐
                     │   Express + TS    │
                     │      Backend      │
                     └─────┬───────┬─────┘
                           │       │
                  ┌────────┘       └─────────┐
                  ▼                          ▼
           ┌──────────────┐          ┌──────────────┐
           │     Neon     │          │    Gemini    │
           │  PostgreSQL  │          │      AI      │
           │  + pgvector  │          └──────────────┘
           └──────────────┘
                  ▲
                  │
           ┌──────┴───────┐
           │  Cloudinary  │
           │ File Storage │
           └──────────────┘
```

---

## 💻 3. Tech Stack

### Frontend:
- **Framework:** React 18, TypeScript, Vite
- **Styling:** TailwindCSS, Lucide React Icons
- **State Management & Data Fetching:** TanStack Query v5
- **Routing:** React Router v7
- **Form & Validation:** React Hook Form, Zod
- **HTTP Client:** Axios (Interceptors xử lý Refresh Token & JWT tự động)

### Backend:
- **Runtime:** Node.js (v20+ / v24+), Express.js, TypeScript
- **ORM:** Prisma ORM 6 (hỗ trợ PostgreSQL extensions: pgvector)
- **Database:** Neon Serverless PostgreSQL + pgvector
- **AI & Embedding:** Google Gemini SDK (`@google/generative-ai`, `text-embedding-004`, `gemini-1.5-flash`)
- **File Storage:** Cloudinary SDK
- **Document Processing:** `pdf-parse`, `mammoth` (Word docx), `multer`
- **Security:** JWT (Access Token 1h, Refresh Token 7d), bcrypt, Helmet, CORS

---

## 🚀 4. Cấu Trúc Thư Mục (Project Structure)

```
SmartDoc/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema với 19+ entities & pgvector
│   │   └── seed.ts             # Dữ liệu mẫu (Admin, Teacher, Student, Docs, Quiz)
│   ├── src/
│   │   ├── config/             # env, prisma, cloudinary, gemini setup
│   │   ├── controllers/        # Express route controllers
│   │   ├── middlewares/        # auth, rbac, validation, upload, error
│   │   ├── routes/             # API routes definition
│   │   ├── services/
│   │   │   ├── ai/             # gemini, embedding, rag, quiz, mindmap, summary...
│   │   │   ├── auth.service.ts
│   │   │   ├── document.service.ts
│   │   │   └── document-processor.service.ts # Extract text, chunking, vector indexing
│   │   ├── utils/              # api-response, jwt, password helpers
│   │   └── server.ts           # Express server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/         # Layout, Sidebar, Header, UI widgets
│   │   ├── context/            # AuthContext (state & session management)
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register
│   │   │   ├── dashboard/      # Modern Learning Dashboard
│   │   │   ├── documents/      # List, Detail (Tabs), Upload
│   │   │   ├── search/         # Semantic Vector Search Page
│   │   │   ├── chat/           # RAG Chat Assistant with Citations
│   │   │   ├── summary/        # Multi-type AI Document Summary
│   │   │   ├── quiz/           # Quiz Generation & Interactive Player
│   │   │   ├── flashcards/     # 3D Flip Card Spaced Repetition
│   │   │   ├── mindmap/        # Interactive Zoomable Tree Mindmap
│   │   │   ├── study-plan/     # AI Exam Roadmap Planner
│   │   │   ├── analytics/      # Progress & Pedagogical AI Advice
│   │   │   ├── teacher/        # Course & Document Management
│   │   │   └── admin/          # System Metrics & RBAC User Management
│   │   ├── services/api/       # Axios client & typed API calls
│   │   ├── types/              # Comprehensive TypeScript interfaces
│   │   ├── routes/             # AppRouter, ProtectedRoute, RoleRoute
│   │   ├── App.tsx & main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── package.json                # Root package.json with monorepo scripts
├── .gitignore
├── .env.example
└── README.md
```

---

## ⚙️ 5. Cài Đặt & Chạy Cục Bộ (Local Development)

### 1. Chuẩn bị biến môi trường
Tạo file `backend/.env` dựa theo mẫu `backend/.env.example`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Neon PostgreSQL Connection String
DATABASE_URL="postgresql://username:password@ep-your-host.us-east-2.aws.neon.tech/smartdoc?sslmode=require"

# JWT Secret Keys
JWT_SECRET=super_secret_smartdoc_access_token_jwt_key_2026
JWT_REFRESH_SECRET=super_secret_smartdoc_refresh_token_jwt_key_2026

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 2. Cài đặt dependencies
Tại thư mục gốc:
```bash
# Cài đặt backend
cd backend
npm install

# Cài đặt frontend
cd ../frontend
npm install
```

### 3. Thiết lập Cơ sở dữ liệu Prisma
Kích hoạt extension `vector` trên Neon PostgreSQL (chỉ cần chạy lệnh SQL: `CREATE EXTENSION IF NOT EXISTS vector;` trên Neon SQL Editor), sau đó:
```bash
cd backend
# Đồng bộ schema với database
npm run prisma:push

# Nạp dữ liệu mẫu khởi tạo (Admin, Teacher, Student, Documents, Quiz, Flashcards, Mindmap)
npm run prisma:seed
```

### 4. Tài khoản Demo mặc định sau khi Seed:
| Vai trò (Role) | Email | Mật khẩu |
|---|---|---|
| **Sinh viên (Student)** | `student@smartdoc.edu.vn` | `Student@123456` |
| **Giảng viên (Teacher)** | `teacher@smartdoc.edu.vn` | `Teacher@123456` |
| **Quản trị viên (Admin)** | `admin@smartdoc.edu.vn` | `Admin@123456` |

*(Có thể sử dụng nút Đăng nhập nhanh 1-Click tại trang Login).*

### 5. Khởi chạy Ứng dụng
```bash
# Chạy Backend (Port 5000)
cd backend
npm run dev

# Chạy Frontend (Port 5173) trong terminal khác
cd frontend
npm run dev
```

Truy cập giao diện tại: **http://localhost:5173**

---

## 🌐 6. Hướng Dẫn Triển Khai (Deployment)

### Frontend (Vercel)
1. Kết nối repository GitHub với Vercel.
2. Root Directory: `frontend`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variables:
   - `VITE_API_URL`: URL backend trên Render (ví dụ: `https://smartdoc-backend.onrender.com/api`)

### Backend (Render)
1. Tạo **Web Service** trên Render kết nối với GitHub.
2. Root Directory: `backend`
3. Environment: `Node`
4. Build Command: `npm install && npm run build`
5. Start Command: `npm run start`
6. Thêm đầy đủ các biến môi trường trong tab **Environment**:
   - `DATABASE_URL` (Từ Neon)
   - `JWT_SECRET`, `JWT_REFRESH_SECRET`
   - `GEMINI_API_KEY`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `CLIENT_URL` (URL frontend Vercel)

---

## 🔒 7. Tính Năng Bảo Mật & Best Practices
- **Role-Based Access Control (RBAC):** Phân quyền nghiêm ngặt giữa Student, Teacher và Admin ở cả Backend Middleware lẫn Frontend Route Guards.
- **Xử lý Token An Toàn:** Access Token thời gian sống ngắn, Refresh Token được lưu trữ và quay vòng (token rotation) trong database.
- **Ngăn chặn Hallucination trong RAG:** Prompting khoa học bắt buộc Gemini chỉ trả lời dựa trên các đoạn trích từ tài liệu đã được index bởi pgvector kèm citation số trang rõ ràng.
- **Không expose API Keys:** Gemini API Key và Database URL chỉ nằm ở server backend.

---
*Được phát triển và hoàn thiện cho Đồ Án Tốt Nghiệp ngành Công Nghệ Thông Tin.*
