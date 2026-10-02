# Repository Guidelines

## Project Structure & Module Organization

This is a browser-only CV editor built with React, TypeScript, and Vite. `src/App.tsx` coordinates editing and drag and drop. UI code lives in `src/components/editor/`, `sidebar/`, and `properties/`; document types and block factories are in `src/models/`; the starter CV is in `src/store/`. Use `src/hooks/` for document state and `src/utils/` for layout, storage, pagination, and PDF export. Global CSS is in `src/styles/index.css`. The current automated check is `tests/layout-check.mjs`. `dist/` and `tmp/check/` are generated output.

## Build, Test, and Development Commands

- `pnpm install` installs dependencies from `pnpm-lock.yaml`.
- `pnpm run dev` starts the Vite development server, normally at `http://localhost:5173/`.
- `pnpm run build` runs TypeScript project checks and creates the static site in `dist/`.
- `pnpm run test:layout` checks row and column operations plus document migration.
- `pnpm run preview` serves the built site locally for a final browser check.

For GitHub Pages, set `VITE_BASE_PATH` to the repository path before building (for example, `/CVDevelopment/`).

## Coding Style & Naming Conventions

Follow the existing two-space indentation, single quotes, and semicolons in TypeScript and TSX. Use PascalCase for React components and exported types, camelCase for functions and variables, and descriptive file names such as `documentStorage.ts` and `CVCanvas.tsx`. Keep document transformations in utilities and treat input documents as immutable. TypeScript is configured with `strict` and unused-code checks. There is no configured formatter or linter; match nearby code and ensure `pnpm run build` passes.

## Testing Guidelines

Run `pnpm run test:layout` and `pnpm run build` before submitting changes. Add focused assertions to `tests/layout-check.mjs` when changing layout rules, block creation, or JSON migration. For UI or PDF changes, also check the relevant workflow in the browser; the repository has no automated UI or coverage threshold. Ask me before launching the test, just to check if make sense

## Commits & Pull Requests

The short Git history has no consistent message convention. Use a concise imperative subject that names the change, such as `Fix column resize bounds`. In pull requests, describe the behavior changed, include test results, link a related issue when one exists, and attach screenshots for visible UI changes. Mention any changes to saved document format or PDF output.
