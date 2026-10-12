# Repository Guidelines

## Project Structure

This is a browser-only CV editor built with React, TypeScript, and Vite. Application code lives in `src/`: `components/` contains editor, sidebar, and property-panel UI; `models/` defines CV data and creation logic; `hooks/` handles document state and panel layout; `utils/` contains layout, storage, assets, and PDF export; `styles/` holds application styling. `tests/` contains standalone checks. `README.md` documents product behavior and JSON format. `tmp/` contains local screenshots and PDF review artifacts, not application source.

## Build and Development

Run `npm install` to install dependencies and `npm run dev` to start Vite locally. Run `npm run build` for TypeScript project checks and a production build in `dist/`. Run `npm run preview` to serve that build locally. Set `VITE_BASE_PATH` when building for a non-root deployment path, as shown in `README.md`.

## Style and Naming

Use TypeScript and React function components. Match the existing two-space indentation and nearby formatting. Use `PascalCase` for components and types, and `camelCase` for functions, variables, and hooks (`use...`). Keep document transformations in `models/` or `utils/`, and UI in the relevant `components/` area. No formatter or linter is configured; keep changes consistent with adjacent files.

## Testing

Ask before running
Run `npm run test:layout` and `npm run test:random` for the layout and random-document checks. These are plain Node scripts in `tests/` (`*.mjs`); there is no test framework or coverage threshold. For changes to document import/export or layout, run both checks and verify the affected editor flow locally.

## Commits and Pull Requests

Recent history uses short, informal subjects without a consistent prefix. Keep commit subjects concise and action-oriented. Pull requests should describe the behavior changed, list relevant validation commands, link a related issue when available, and include screenshots for visible UI changes. Call out changes to the versioned CV JSON format or browser storage behavior.

## Configuration

The app has no backend; user documents and preferences are stored in browser `localStorage`. Do not commit personal CV data, secrets, or generated review artifacts.
