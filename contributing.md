# 🤝 Contributing to ClassSync

Welcome! We're thrilled you're interested in contributing to **ClassSync**, a modern attendance management system built for real-world education needs in Nigeria and beyond.

Please take a moment to review this guide before contributing.

---

## 🧱 Project Overview

ClassSync is built with:

- **Frontend**: React (TANSTACK-START),
- **Backend**: Convex
- **Auth**: Google OAuth
- **UI/UX**: TailwindCSS, Radix UI, Shadcn UI

This is a role-based application supporting both **Lecturers** and **Students**, with onboarding flows, session attendance, and data analytics.

---

## 📦 Getting Started

1. **Fork the repo**
2. **Clone your fork**

```bash
git clone https://github.com/your-username/classsync.git
cd classsync
```

1.  **Install dependencies**

`   pnpm install   `

1.  **Create a .env.local**

Copy the example file:

`   cp .env.example .env.local   `

1.  **Start the dev server**

`   pnpm run dev   `

## 🔀 Branching Strategy

We follow a **trunk-based flow with feature branches**.

## 📝 Commit Message Format

We use **Conventional Commits**.

`feat: add new join request UI  fix: prevent duplicate check-ins  refactor: move session logic to separate hook  `

Prefixes to use:

- feat: – New features
- fix: – Bug fixes
- refactor: – Code structure changes
- docs: – Documentation updates
- chore: – Tooling/config changes

## ✅ Pull Request Guidelines

- PRs must target the dev branch.
- Use **descriptive titles** and summaries.
- Keep PRs small and scoped to one task.
- Screenshots or videos are appreciated!
- Tag a maintainer (e.g. @ChikiDev) for review.

## 🧹 Code Style

We enforce consistent styling using:

- **Prettier** for formatting
- **ESLint** with custom rules

Please run before pushing:

`npm run lint  npm run format   `

## 🧪 Testing

> (Add test instructions once tests are in place — placeholder for future)

## 🙏 Thank You

Thanks again for being part of this project. Your support helps bring better tools to classrooms around the world 🌍

Happy hacking! ✨— **Chiki (Miracle)**
