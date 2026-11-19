# LifeTrack Web

LifeTrack Web is a responsive task manager for organizing everyday work. Create tasks, group them into categories, set due dates and priorities, and review them through focused views. The application runs in the browser and saves tasks, categories, and theme preferences locally.

## Features

- **Task management:** Create, edit, complete, delete, and restore supported actions with undo.
- **Focused views:** Review all tasks, tasks due today, upcoming tasks, overdue tasks, high-priority tasks, and completed tasks.
- **Categories:** Organize tasks with built-in or custom categories and color tones.
- **Due dates and priorities:** Set due dates and mark important tasks as high priority.
- **Search, sorting, and filtering:** Find tasks by their details, choose a sort order, and filter by completion status.
- **Light and dark themes:** Switch between display themes; the selection is saved in the browser.
- **Responsive interface:** Use the application on desktop, tablet, and mobile screens.
- **Keyboard shortcuts:** Press `/` to focus search or `n` to open the new-task dialog.

## Technology

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Lucide React

## Getting Started

### Requirements

- Node.js 18 or later
- npm

### Install and run

```bash
git clone https://github.com/AbhiTheNullPointer/LifeTrack-Web.git
cd LifeTrack-Web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server on port 3000. |
| `npm run build` | Create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run the TypeScript compiler without emitting files. |

## Production Deployment

Run `npm run build` and deploy the generated `dist/` directory to a static hosting provider. A GitHub Actions workflow is included to build and deploy the site to GitHub Pages when changes are pushed to the `main` or `master` branch. It also supports manual runs from the Actions tab.

## Data and Privacy

Tasks, categories, and theme preferences are stored in the browser's `localStorage`. The application does not require an account or a backend to manage this data. Data is scoped to the current browser and origin; clearing browser site data will remove it. Browser storage is not a substitute for a backup.

## Project Structure

```text
src/
  components/      Reusable task, navigation, form, and notification components
  data/             Default category definitions
  types/            TypeScript models
  utils/            Date and calendar helpers
  App.tsx           Application state and task workflows
  index.css         Global styles and design tokens
  main.tsx          Application entry point
.github/workflows/  CI and GitHub Pages deployment workflows
```

## Contributing

Bug reports, feature suggestions, and pull requests are welcome. Please open an issue to discuss substantial changes before submitting a pull request.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
