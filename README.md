# 🎓 Student Information & Certificate Management System (SICMS) — Frontend

A modern, responsive, role-based React web application for managing student admissions, academic section assignments, digital ID cards, and official document/certificate verifications.

---

## 🚀 Features

- **🔐 Authentication & RBAC**:
  - Email/Password login, Google OAuth2 Single Sign-On, and 2FA OTP verification.
  - Role-protected routes (`ROLE_ADMIN` vs `ROLE_FACULTY`).
- **👨‍🎓 Student Management System**:
  - Multi-tab student registration (Personal, Identification, Contact, Parent, Academic).
  - Server-side paginated tables with filter controls (Department, Academic Year, Section, Status, Search).
  - Interactive Digital ID Cards with dynamic verification QR code rendering.
- **👨‍🏫 Faculty & Section Mapping**:
  - Directory of faculty staff and primary departments.
  - Section mapping and scoped student permissions.
- **📜 Document & Certificate Management**:
  - File upload interface for official student certificates (PDF format).
  - Multi-status verification flow (`PENDING`, `VERIFIED`, `REJECTED`).
  - Inline PDF viewer & certificate download manager.
- **🎨 UI / UX Excellence**:
  - Modern dashboard widgets, vibrant gradient cards, dark mode toggle, and smooth micro-animations.

---

## 🛠️ Technology Stack

- **Framework**: React 18 with Vite
- **Styling**: Vanilla Tailwind CSS v3
- **Icons**: Lucide Icons (`lucide-react`)
- **Routing**: `react-router-dom` v6
- **HTTP Client**: Axios with automated Bearer JWT request headers and silent 401 refresh token interceptors

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js 18+ installed
- npm or yarn

### 2. Installation
```bash
# Navigate to frontend project directory
cd Frontend/student-managemnt-system

# Install dependencies
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your `.env`:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 4. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 📦 Production Build & Vercel Deployment

### Build Locally
```bash
npm run build
```
Outputs the production bundle to `dist/`.

### Deploy to Vercel
1. Push this repository (`Studnet-Managament-System-Frontend`) to GitHub.
2. Log into [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your frontend repository.
4. Set Build Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable in Vercel:
   - `VITE_API_BASE_URL` = `https://api.yourdomain.com/api` (your deployed Spring Boot backend URL)
6. Click **Deploy**. Vercel will automatically handle SPA client routing via `vercel.json`.

---

## 📂 Project Structure

```
src/
├── assets/          # Static assets & illustrations
├── components/      # Reusable UI components (Modals, Tables, Forms, Navigation)
│   ├── academic/    # Group & Section components
│   ├── certificates/# Document upload & status modals
│   ├── common/      # Delete confirmation modal & topbars
│   ├── dashboard/   # Summary statistic cards
│   ├── faculty/     # Faculty forms & section assignments
│   ├── profile/     # User profile components
│   └── students/    # Student registration & ID card components
├── context/         # AuthContext provider
├── layouts/         # AdminLayout & Sidebar navigation wrapper
├── pages/           # Application views by role (admin, faculty, auth, common)
├── services/        # Axios API instances & endpoint services
└── utils/           # Token utilities & storage helpers
```

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
