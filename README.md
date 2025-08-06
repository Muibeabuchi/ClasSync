---
# 🎓 ClassSync — Smart Attendance for Smart Classrooms

ClassSync is a modern, scalable web app designed to digitize attendance for Nigerian universities and beyond. It allows lecturers to easily take attendance using GPS verification and code input, while students check in from their own devices — all powered by intuitive UI and secure backend architecture.

Built with ❤️ for HACK4FUTO, but structured for real-world scale.
---

## 🚀 Features

### 🧑‍🏫 For Lecturers

- Google OAuth login & onboarding
- Create and manage courses
- Upload reusable classlists
- Share attendance codes with students
- Verify student join requests
- View detailed attendance logs & analytics
- Soft-delete or archive courses
- Customize attendance time window & GPS radius
- **📊 Export attendance data** (PDF, CSV, Excel) for archived courses

### 👨‍🎓 For Students

- Google OAuth login & onboarding
- Search courses by code & send join requests
- Check-in to live sessions with GPS validation
- View personal attendance history & stats
- Receive notifications from lecturers

---

## 🛠️ Tech Stack

| Layer                  | Tools                                       |
| ---------------------- | ------------------------------------------- |
| **Frontend**           | React + Next.js, Tailwind CSS, Shadcn UI    |
| **Backend**            | Convex (fully typed backend with live sync) |
| **UI Prototypes**      | Lovable AI, v0 by Vercel                    |
| **Auth**               | Google OAuth                                |
| **State Management**   | Convex React hooks                          |
| **Design**             | Figma + AI wireframes                       |
| **Push Notifications** | (Upcoming) FCM / Web Push APIs              |

---

## 🧭 Routing & User Flow

### Common

- `/onboarding`
- `/settings`
- `/inbox`
- `/profile`

### Lecturer

- `/dashboard`
- `/courses`, `/courses/new`, `/courses/[id]`
- `/courses/[id]/analytics`, `/sessions`, `/students`
- `/classlists`, `/classlists/[id]`
- `/students/[id]`

### Student

- `/student/dashboard`
- `/student/courses`
- `/student/attendance`, `/attendance/check-in`
- `/student/course/[id]`

### Flow Overview

> See [`docs/routing.md`](docs/routing.md) for the full route map and diagrams.

---

## 📦 Installation & Setup

```bash
# 1. Clone the repo
git clone https://github.com/Muibeabuchi/ClasSync.git
cd classsync

# 2. Install dependencies
pnpm install

# 3. Setup environment variables
cp .env.example .env.local
# Add your Google OAuth + Convex keys here

# 4. Start the dev server
pnpm run dev
```

---

## 🤝 Contributing

### 🔀 Branching Strategy

- `main` → stable production code
- `dev` → main development branch
- `feature/*` → feature-specific branches
- `hotfix/*` → urgent production fixes

Please see [`CONTRIBUTING.md`](CONTRIBUTING.md) for details.

---

## 📚 Documentation

- [Architecture Overview](docs/architecture.md)
- [Design Guidelines](docs/design.md)
- [Routing & User Flow](docs/routing.md)
- [Feature Roadmap](#roadmap)

---

## 🌱 Roadmap

> Features marked 🔒 are being deliberated for future inclusion.

- ✅ Reusable classlists
- ✅ Role-based onboarding flows
- ✅ GPS-based attendance with session code
- ✅ Join requests + student verification
- ✅ Student attendance stats
- 🔒 Device Binding (anti-cheat)
- 🔒 Push Notifications (via FCM/Web Push)
- 🔒 Attendance Session Scheduler
- 🔒 Admin Panel (Role: SuperAdmin)
- 🔒 Student Engagement Dashboard
- 🔒 Team collaboration for courses

---

## 🧑‍💻 Author

**Miracle (Chiki)**  
React Developer | AI-Powered Builder  
💬 Let's connect: [GitHub](https://github.com/Muibeabuchi)

---

## 📄 License

This project is MIT Licensed.

---

```

---
```
