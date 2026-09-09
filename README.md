# Awd Course - Interactive Learning Platform & Structured Practice

**Awd Course** is a modern, interactive web learning platform built with [Astro](https://astro.build), designed for mastering software engineering, programming, and data science analysis.

It features an in-browser WebAssembly-based execution environment (**Pyodide**), integrated smart AI assistant (**Cloudflare Workers AI / Mistral AI**), classroom projector presentation mode (*Interactive Slide Presentation Mode*), progress tracking with **Supabase**, and Git-based content management (**Keystatic CMS**).

---

## 🌟 Key Features

- **Interactive In-Browser Code Runner**:
  - Execute Python code directly in the browser via WebAssembly (Pyodide) without requiring any local compiler/runtime installation on student machines.
  - Automatic interception of `!pip install`, `%pip install`, and auto-import package resolution for popular data science libraries (NumPy, Pandas, Matplotlib, Seaborn, and SciPy).
- **Integrated AI Learning Assistant (AwdBot)**:
  - Powered by Cloudflare Workers AI (Llama 3.1 8B / Llama 3.3 70B) with automatic failover to Mistral AI.
  - Built-in rate limiting, message length constraints, and user-friendly error filtering.
- **Interactive Presentation Mode (*Presenter Slide Mode*)**:
  - Press <kbd>P</kbd> on any lesson to launch full-screen classroom projector slides.
  - Equipped with Virtual Laser Pointer (<kbd>L</kbd>), Spotlight Focus (<kbd>S</kbd>), Blackout Screen (<kbd>B</kbd>), Theme Toggle Dark/Light (<kbd>T</kbd>), and live code execution within slides (<kbd>Ctrl</kbd> + <kbd>Enter</kbd>).
- **Learner Dashboard & 1-Click Google Authentication**:
  - Unified `/login` page featuring 1-click Google SSO via Supabase Auth.
  - Student progress tracking dashboard at `/dashboard` that automatically persists course completion percentages protected by Row Level Security (RLS).
- **Protected Content Management with Keystatic CMS**:
  - Visually manage course catalogs and lesson modules via the `/keystatic` route.
  - **Strict Production Security**: Only GitHub accounts listed as repository owners or collaborators can access the Keystatic admin panel.
- **Comprehensive SEO & Open Graph**:
  - Official Open Graph & Twitter Cards metadata (`/images/og-banner.jpg`).
  - Google Search structured data (Schema.org `Course`, `CourseInstance`, `BreadcrumbList`, and `WebSite`).
  - Full Dark Mode & Light Mode support with smooth theme transitions.

---

## 📚 Course Curriculum: Python Basics & Data Analysis

The curriculum is organized into **17 Focused Learning Modules** across 3 Chapters:

### Chapter 1: Python Programming Fundamentals
1. Python Comments & Code Formatting
2. Python Data Types and Variables
3. Arithmetic, Comparison, & Logical Operators
4. Conditional Statements (`If`, `Elif`, `Else`, `Match-Case`)
5. Looping Structures (`For` & `While` Loops)
6. Defining & Calling Functions
7. Document Module: Python Fundamentals (Interactive PDF)
8. Practical Assignment: Building an Interactive Calculator

### Chapter 2: Introduction to Python Packages
9. Package Management & Libraries with Pip
10. Introduction to NumPy & Array Computing
11. Introduction to Pandas Data Structures (*Series & DataFrame*)
12. Basic Data Visualization with Matplotlib
13. Statistical Data Visualization with Seaborn
14. Data Import & Export Techniques (*URL, Google Drive, Git, CSV*)

### Chapter 3: Exploratory Data Analysis (EDA)
15. Dataframe Inspection & Structural Preparation (`head()` & `info()`)
16. Descriptive Statistics Summary & EDA Plot Visualization
17. Column Selection & Boolean Filtering

---

## 🛠️ Local Development Setup

### 1. System Prerequisites
- **Node.js**: Version `>= 22.12.0` (Node.js 24 LTS recommended)
- **NPM** or **PNPM**
- [Supabase](https://supabase.com/) account (Free tier for authentication & progress persistence)

### 2. Clone Repository & Install Dependencies
```bash
git clone https://github.com/putuwahyu29/awd-course.git
cd awd-course
npm install
```

### 3. Environment Variable Configuration (`.env`)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your environment variables in `.env`:
```env
# 1. Supabase Authentication & Database
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here

# 2. Keystatic CMS GitHub OAuth (Production / Vercel)
PUBLIC_KEYSTATIC_GITHUB_OWNER=putuwahyu29
PUBLIC_KEYSTATIC_GITHUB_REPO=awd-course
KEYSTATIC_GITHUB_CLIENT_ID=your-github-oauth-client-id
KEYSTATIC_GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
KEYSTATIC_SECRET=your-random-32-character-secret-key-here

# 3. AI Assistant Integration
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
CLOUDFLARE_AI_MODEL=@cf/meta/llama-3.1-8b-instruct
MISTRAL_API_KEY=your-mistral-api-key-here
MISTRAL_MODEL=mistral-small-latest

# 4. Instructor / Admin Access Keys
ADMIN_EMAILS=iputuagus.wahyu@gmail.com
ADMIN_PASSKEY=your-secure-production-passkey-here

# 5. In-Browser Python Runner (Pyodide)
PUBLIC_ENABLE_CODE_RUNNER=false
```

### 4. Supabase Database Setup
Execute the [supabase_schema.sql](supabase_schema.sql) script in the **Supabase Dashboard -> SQL Editor -> New Query** to create user profiles (`profiles`), progress tracking (`course_progress`) tables, and Row Level Security (RLS) policies.

### 5. Running the Development Server
```bash
npm run dev
```
Open your browser at [http://localhost:4321](http://localhost:4321).
- **Home**: [http://localhost:4321](http://localhost:4321)
- **Course Catalog**: [http://localhost:4321/courses](http://localhost:4321/courses)
- **Student Dashboard**: [http://localhost:4321/dashboard](http://localhost:4321/dashboard)
- **Keystatic Admin Panel**: [http://localhost:4321/keystatic](http://localhost:4321/keystatic) (Runs locally without requiring GitHub login)

---

## 🔒 Production Security Setup for Keystatic CMS (Vercel)

In local development, Keystatic writes directly to the local filesystem. When deployed to production (e.g., Vercel), Keystatic switches to **GitHub Storage Mode**, requiring GitHub OAuth authorization so only the repository owner or collaborators can access the admin panel.

### Steps to Configure GitHub OAuth App:
1. Go to **GitHub** &rarr; **Settings** &rarr; **Developer Settings** &rarr; **OAuth Apps** &rarr; **New OAuth App**.
2. Fill in the following parameters:
   - **Application Name**: `Awd Course CMS`
   - **Homepage URL**: `https://course.awd.my.id` (or your production domain)
   - **Authorization callback URL**: `https://course.awd.my.id/api/keystatic/github/oauth/callback`
3. Save the **Client ID** and generate a **Client Secret**.
4. Add these credentials to **Environment Variables** in your hosting dashboard (Vercel).

---

## 📂 Project Directory Structure

```
awd-course/
├── public/
│   ├── docs/                   # Official PDF course documents
│   ├── images/
│   │   ├── instructors/        # Instructor profile images
│   │   └── og-banner.jpg       # Open Graph & Social Card banner
│   ├── notebooks/              # Jupyter Notebook (.ipynb) per module
│   └── robots.txt              # Search engine crawler configuration
├── src/
│   ├── components/             # UI Components (Header, CourseCard, PresentationMode, etc.)
│   ├── content/
│   │   ├── courses/            # Course catalog metadata (JSON)
│   │   └── lessons/            # Lesson content modules (MDX)
│   ├── layouts/                # Layout templates (BaseLayout, CourseLayout)
│   ├── lib/                    # Utilities (Supabase, Mistral, Cloudflare AI, Solutions)
│   ├── pages/                  # Page routes & API endpoints (/api/chat, /api/admin)
│   └── styles/                 # Design system & theme tokens (global.css)
├── scripts/                    # Utility scripts for notebook execution & PDF generator
├── supabase_schema.sql         # Supabase database schema & RLS policies
├── keystatic.config.ts         # Keystatic CMS Admin configuration
├── astro.config.mjs            # Astro configuration, Tailwind v4, & Vercel adapter
├── vercel.json                 # Production security headers (CSP, X-Frame, etc.)
└── package.json
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local development server on port `4321` |
| `npm run build` | Compiles static pages & serverless functions into `./dist` |
| `npm run preview` | Previews the production build locally |
| `npm run notebooks:run` | Executes and tests code across all Jupyter Notebooks |
| `npm run notebooks:bundle` | Automatically bundles submodule notebooks into complete chapter notebooks |
| `npm run notebooks:clear` | Clears execution outputs across all Jupyter Notebooks |
| `npm run generate:docs` | Compiles lesson modules into official PDF documents |

---

## 🤝 Contributing

Contributions to curriculum content, bug fixes, or new features are warmly welcomed:

1. **Fork** this repository to your GitHub account.
2. Create a new branch for your feature or bug fix (`git checkout -b feature/your-feature-name`).
3. Commit your changes (`git commit -m 'feat: add new lesson content'`).
4. Ensure the build passes without errors (`npm run build`).
5. **Push** the branch to your repository (`git push origin feature/your-feature-name`).
6. Open a new **Pull Request (PR)** with a clear description of your changes.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). You are free to use, modify, and distribute this codebase for educational or commercial purposes, provided the original copyright attribution is retained.

---

## 👤 Instructor & Curriculum Author

- **Instructor**: I Putu Agus Wahyu Dupayana
- **Role**: Computer Specialist (Pranata Komputer Ahli Pertama) • BPS - Statistics of East Java Province
- **Website**: [course.awd.my.id](https://course.awd.my.id)
