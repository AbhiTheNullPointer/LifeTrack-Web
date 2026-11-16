# ✅ To-Do · Life Tracker

> A free, beautifully designed task manager and daily planner  built for real life.

![Made with React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?style=flat-square&logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss) ![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite) ![Material Design 3](https://img.shields.io/badge/Design-Material%203-pink?style=flat-square) ![License: MIT](https://img.shields.io/badge/License-MIT-pink?style=flat-square)

---

## 🌸 Overview

**To-Do · Life Tracker** is a modern, responsive productivity app that helps you manage your tasks, deadlines, and priorities  all in one clean interface. Built on the [Material Design 3](https://m3.material.io/) system, it looks great on every device and adapts to your style with a sleek **pink-rose** color palette and full **dark mode** support.

No sign-up. No server. Your data lives only in your browser - private by default.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📋 **Smart Views** | Today, Upcoming (7 days), Overdue, Priority, Completed, All Tasks |
| 🗂 **Custom Categories** | Create your own categories with 6 color tones |
| 📅 **Due Date Picker** | Inline calendar with quick presets: Today, Tomorrow, Next Week |
| ⭐ **Priority Tracking** | Mark tasks as high priority and filter by them |
| 🔍 **Search** | Instant full-text search across title, notes, and category |
| 🔀 **Sort & Filter** | Sort by due date, category, priority, or created date |
| 🌙 **Dark Mode** | Full dark theme, toggled with one tap |
| ↩️ **Undo Actions** | Undo task completion, deletion, and bulk clear |
| ⌨️ **Keyboard Shortcuts** | `/` to search · `n` to create a new task |
| 💾 **Offline First** | 100% client-side - works without internet after first load |
| 📱 **Fully Responsive** | Optimized for Android phones, tablets, and desktops |

---

## 🎨 Design

This app follows the **Material Design 3** spec with a custom **pink-rose** color palette.

### Typography

| Role | Font | Usage |
|---|---|---|
| **Display / Headings** | [Nunito](https://fonts.google.com/specimen/Nunito) - 600–800 | App title, dialog headings, section labels |
| **Body / UI** | [Inter](https://fonts.google.com/specimen/Inter) - 400–600 | Task titles, notes, buttons, inputs |
| **Tabular / Mono** | [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) - 400–500 | Dates, counts, numeric badges |

Nunito gives the headings a friendly, rounded feel. Inter keeps the body text crisp and readable at every size. JetBrains Mono ensures dates and numbers stay perfectly aligned.

### Color Palette

| Token | Light | Dark | Usage |
|---|---|---|---|
| Primary | `#c2185b` | `#f48fb1` | Buttons, active states, checkboxes |
| Background | `#f9f9f9` | `#111111` | Page background - clean neutral |
| Surface | `#ffffff` | `#1a1a1a` | Cards, dialogs |
| Secondary Container | `#fce4ec` | `#4a1a2e` | Active nav items, selected states |
| Error | `#b00020` | `#ffb4ab` | Overdue dates, delete actions |
| Warning | `#e65100` | `#ffb74d` | Tomorrow dates, priority labels |

---

## 📁 Project Structure

```
LifeTrack-Web/
├── index.html                    # Entry HTML - SEO, fonts, structured data
├── src/
│   ├── main.tsx                  # App bootstrap
│   ├── App.tsx                   # Root component - all state, CRUD, routing
│   ├── index.css                 # Tailwind v4 + MD3 color tokens + base styles
│   ├── components/
│   │   ├── NavigationSidebar.tsx # Left sidebar / mobile drawer
│   │   ├── TaskRow.tsx           # Individual task row
│   │   ├── TaskDialog.tsx        # Create / edit task modal / bottom sheet
│   │   ├── QuickAddBar.tsx       # Inline quick-add form
│   │   ├── MaterialDatePicker.tsx# Calendar date picker component
│   │   ├── MaterialSelect.tsx    # Custom dropdown / bottom sheet select
│   │   └── Snackbar.tsx          # Toast notification with undo
│   ├── data/
│   │   └── initialData.ts        # Category tone styles & default categories
│   ├── types/
│   │   └── todo.ts               # All TypeScript interfaces & types
│   └── utils/
│       └── dateUtils.ts          # Date arithmetic, formatting, calendar grid
├── .github/
│   └── workflows/
│       ├── ci.yml                # CI pipeline
│       └── deploy.yml            # Deployment workflow
├── package.json
├── tsconfig.json
├── vite.config.ts
└── metadata.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/AbhiTheNullPointer/LifeTrack-Web.git
cd LifeTrack-Web

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app opens at **http://localhost:3000**.

### Build for Production

```bash
npm run build
```

Output goes to the `dist/` folder. Deploy it to any static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages).

### Preview Production Build

```bash
npm run preview
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `/` | Focus the search bar |
| `n` | Open the "New Task" dialog |
| `Escape` | Close dialogs / date picker |
| `↑` / `↓` | Navigate dropdown options |

---

## 🔒 Privacy

All task data is stored **exclusively in your browser's `localStorage`**. No data is sent to any server, no account required, and nothing leaves your device. Clearing site data in your browser settings will remove all tasks.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome! Open an [issue](https://github.com/AbhiTheNullPointer/LifeTrack-Web/issues) or submit a pull request.

---

<p align="center">Made with 🌸 and a lot of ☕</p>
