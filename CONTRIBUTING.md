# CONTRIBUTING GUIDE — SEAL System

Tài liệu này mô tả quy trình làm việc với Git và GitHub cho toàn team.

---

## Cấu trúc repo

```
seal-system/
├── frontend/        ← React app
├── backend/         ← Java Spring Boot
├── .gitignore
├── README.md
└── CONTRIBUTING.md  ← file này
```

---

## Quy ước đặt tên branch

feature/<tên-tính-năng>     ← thêm tính năng mới

> **Quy tắc:** Tên branch dùng chữ thường, ngăn cách bằng dấu `-`, không dùng tiếng Việt.

**Ví dụ:**
- `feature/user-registration`
- `feature/team-creation`
- `feature/scoring-rubric`
- `feature/judge-assignment`

---

## Quy trình làm việc hàng ngày

### Bước 1 — Trước khi bắt đầu task mới: lấy code mới nhất

```bash
git checkout main
git pull origin main
```

### Bước 2 — Tạo hoặc chuyển sang branch feature của mình

**Nếu branch chưa tồn tại (task mới):**
```bash
git checkout -b feature/ten-tinh-nang
```

**Nếu branch đã có rồi (tiếp tục làm dở):**
```bash
git checkout feature/ten-tinh-nang
```

**Kiểm tra mình đang ở branch nào:**
```bash
git branch
# Branch đang active sẽ có dấu * phía trước
```

### Bước 3 — Làm việc, commit thường xuyên

```bash
# Kiểm tra những file thay đổi
git status

# Thêm tất cả vào staging
git add .

# Hoặc thêm từng file cụ thể
git add backend/src/...

# Commit
git commit -m "feat: add user registration API"
```

### Bước 4 — Push branch lên GitHub

```bash
git push origin feature/ten-tinh-nang
```

### Bước 5 — Tạo Pull Request (PR) trên GitHub

1. Vào repo trên GitHub
2. Click **"Compare & pull request"** (sẽ tự hiện sau khi push)
3. Điền mô tả ngắn: đã làm gì, tại sao
4. Assign **1 người review**
5. Click **"Create pull request"**

### Bước 6 — Sau khi PR được approve

- Người review click **"Merge pull request"** trên GitHub
- Sau khi merge: xóa branch cũ (GitHub có nút xóa tự động)
- Người vừa merge: chạy lại `git pull origin main` để cập nhật local

---

## Quy ước Commit Message

Format: `<type>: <mô tả ngắn gọn bằng tiếng Anh>`
```
feat: thêm tính năng mới
fix: sửa bug
chore: setup, cấu hình
docs: cập nhật tài liệu
refactor: cải thiện code không thêm tính năng
test: Thêm hoặc sửa test
```

**Ví dụ thực tế:**
```
feat: add JWT authentication
feat: implement team creation API
feat: add scoring rubric management
fix: correct total score calculation
chore: add .gitignore and .env.example
chore: configure CORS for frontend
docs: update API endpoint documentation
refactor: simplify ranking logic
```

> **Lưu ý:** Commit message nên trả lời câu hỏi "Commit này làm gì?"
> Ví dụ: `feat: add login endpoint` 
> Không nên viết đại hay quá chung chung: `update code` / `fix bug` / `asdfjkl`

---

## Quy tắc bắt buộc
Nên:
- **Luôn `git pull origin main`** trước khi tạo branch mới
- **Một branch = một task**, không gộp nhiều task vào một branch
- **Commit nhỏ, thường xuyên**
- **Xóa branch sau khi merge** để repo gọn gàng

Không nên:
- **Không push thẳng vào `main`** — luôn tạo branch riêng và tạo PR
- **Không commit file `.env`** — chỉ commit `.env.example`
- **Không commit thư mục `node_modules/` hay `target/`**

---

## Setup môi trường local

### Backend (Spring Boot)

```bash
cd backend
cp .env.example .env
# Điền thông tin DB local vào file .env
mvn spring-boot:run
```

### Frontend (React)

```bash
cd frontend
npm install
cp .env.example .env
# Điền API URL vào file .env
npm start
```

---

## Gặp conflict thì làm gì?

Khi merge bị conflict:

```bash
# 1. Lấy code mới nhất từ main
git pull origin main

# 2. Git sẽ báo file bị conflict — mở file đó ra sửa
# Tìm đoạn có <<<<<<< HEAD ... >>>>>>> và chọn giữ code nào

# 3. Sau khi sửa xong
git add .
git commit -m "fix: resolve merge conflict"
git push origin <ten-branch>
```

> Nếu không chắc sửa conflict kiểu gì, hỏi mọi người trước khi tự sửa.

---

*Cập nhật lần cuối: 20/05/2026 — SWP391-GR06*
