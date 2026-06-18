# FoodLens AI - Smart Food Calorie Analyzer

**FoodLens AI** is a production-ready, full-stack diet and nutrition tracking web application. It uses **Next.js 15 App Router** for a responsive, modern frontend and **Express.js with TypeScript** and **Prisma ORM** for a clean-architecture backend. Using **Google Gemini AI**, the application lets users take or upload photos of their plates to instantly count calories, identify foods, estimate weights/macronutrients, and scan nutritional packaging labels.

---

## 🌟 Key Features

1. **AI Food Recognition**: Upload food photos to identify dish name, estimated weight, calories, macronutrients, and confidence scores (Gemini Vision API).
2. **Dynamic Dashboard Tracker**: Track daily caloric budgets dynamically compared against computed personal **TDEE** (Total Daily Energy Expenditure) goals.
3. **Macronutrient Split**: Gorgeous visual breakdown of protein, carbohydrates, and fat distributions.
4. **Nutrition Label Scanner**: Extract sugars, sodium, protein, fat, and serving calories from packed food nutrition tables.
5. **AI Recommendations**: Review Gemini-generated healthy substitutes and calorie savings based on logged meals.
6. **Detailed Food History**: Search, paginate, date-filter, and delete past logged meals.
7. **Progress Trends**: Interactive daily, weekly, and monthly caloric charts (Chart.js).
8. **Secure Authentication**: Protected routes, JWT access/refresh token rotation, and password hashing (bcrypt).

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 App Router (TypeScript)
- **Styling**: Tailwind CSS
- **State & Fetching**: React Query (TanStack Query v5)
- **Icons**: Lucide React
- **Graphs**: Chart.js & React-Chartjs-2

### Backend
- **Server**: Node.js & Express.js (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Access (JWT in headers) + Refresh (JWT in HttpOnly cookies)
- **Storage Service**: Modular Local Disk (`/public/uploads`) or Supabase Storage bucket
- **AI Engine**: Google Gemini 1.5 Flash API SDK
- **API Spec**: Swagger UI

---

## 📂 Project Structure

```
/FoodLensAI
  /backend
    /prisma
      - schema.prisma         # PostgreSQL Schema
      - seed.ts               # Database Seeding script
    /src
      /config                 # Database, Storage, and Env configs
      /controllers            # Route controllers
      /dtos                   # Request type schemas (Zod)
      /middlewares            # Auth checking, uploads, errors
      /repositories           # DB CRUD patterns (Prisma)
      /services               # BMR/TDEE calculation & Gemini AI calls
      /routes                 # Express route paths
      - app.ts                # Express application bootstrap
      - server.ts             # Server launcher
    - tsconfig.json
    - Dockerfile
    - docker-compose.yml      # local PostgreSQL container definition
  /frontend
    /src
      /app                    # Next.js App Router Page components
      /components             # Reusable widgets (ImageSelector, Charts)
      /context                # Auth state tracking
      /hooks                  # React Hooks
      /lib                    # HTTP API fetch utils (auto refresh token)
    - tailwind.config.ts
    - Dockerfile
```

---

## 🚀 Setup & Installation

### 1. Database Setup

To run a PostgreSQL instance locally, navigate to the `backend/` directory and spin up the database container:

```bash
cd backend
docker-compose up -d
```
*If you are using an external database (e.g. Supabase DB), skip this and simply supply your `DATABASE_URL` in `backend/.env`.*

### 2. Backend Installation & Migration

Configure your environment:
1. Copy `backend/.env.example` to `backend/.env`.
2. Provide your `GEMINI_API_KEY` (if empty, the app runs in mock mode for quick testing!).
3. Run the following commands:

```bash
# Install dependencies
npm install

# Run database migrations to create tables
npx prisma migrate dev --name init

# Seed the database with 10 days of rich meal data and a demo user
npm run prisma:seed
```

Start the backend API server in development mode:
```bash
npm run dev
```
The backend server runs at `http://localhost:5000`. You can access the **Swagger Docs** at `http://localhost:5000/api-docs`.

**Demo Credentials:**
- **Email**: `demo@foodlens.ai`
- **Password**: `password123`

---

### 3. Frontend Installation & Startup

1. Navigate to the `frontend/` directory.
2. Copy `frontend/.env.example` to `frontend/.env`.
3. Run the following commands:

```bash
cd ../frontend

# Install dependencies (utilize legacy peer deps for React 19 package tree validation)
npm install --legacy-peer-deps

# Start development Next.js app
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## ⚡ Deployment & Production

Both directories contain production-ready `Dockerfile` configurations:
- **Backend Port**: `5000`
- **Frontend Port**: `3000`

Simply deploy `backend/` to Railway/Render (linking to Supabase PostgreSQL) and `frontend/` to Vercel. Ensure your `NEXT_PUBLIC_API_URL` environment variable on Vercel points to your live backend endpoint.
