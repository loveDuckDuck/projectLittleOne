# CV Builder

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Job seekers creating their own CVs. The primary job is to assemble, edit, and
export a personal curriculum through a visual editor.

## Product Purpose

Help users turn their professional information into a CV they control and can
revise. A successful workflow produces an A4 PDF for sharing and an editable
JSON project for later changes.

## Product Mechanism

Users compose their CV from editable content blocks arranged in rows with one
to three columns. They can change content, order, column widths, and document
or block styling while inspecting the document. This describes the existing
mechanism; a competitive differentiation claim remains undecided.

## Operating Context

- The user confirmed the current scope: Italian interface copy, a browser-only
  application without a backend, local saving, editable JSON, and A4 PDF export.
- Users can start from an example or an empty document, add blocks, edit them,
  preview the result, and export it.
- Desktop uses a block library, document canvas, and properties panel. The app
  also supports tablet and phone layouts.
- Autosave retains the current document in the browser's localStorage. Exported
  JSON is the portable project file; undo history lasts only for the session.
- The existing codebase uses React, TypeScript, and Vite. Development starts
  with `npm run dev`; `npm run build` produces a static build in `dist/`.

## Capabilities and Constraints

- Preserve Italian copy, operation without a backend, local autosave, JSON
  import/export, and A4 PDF export in future work unless the user changes scope.
- Content blocks include personal information, experience, education, headings,
  text, lists, skills, hobbies, languages, projects, certifications, custom
  sections, images, dividers, and spacers.
- Existing editing supports drag and drop, click controls, layout presets,
  resizable columns and panels, inline text editing, and undo/redo.
- Users can customize document and block styles and upload images or fonts.
  Uploaded assets are included in the saved document and exported JSON.
- JSON import validates documents and supports versions 1 and 2, migrating
  version 1 blocks into the current row-based structure.
- The canvas is continuous with A4 boundary indicators. PDF pagination tries
  to break between rows; a row or block taller than a page can be split.
- Current PDF export rasterizes content. Text is not selectable; do not claim
  searchable, accessible, or ATS-compatible PDF output without further proof.
- Local storage can fail. Preserve visible save status and portable project
  export rather than promising permanent storage or cross-device sync.

## Evidence on Hand

- `README.md` documents workflows, supported features, and current limitations.
- `src/components/editor/Toolbar.tsx` identifies the product as CV Builder,
  currently Beta 0.1.0, and supplies Italian action labels.
- `src/store/initialDocument.ts` contains the demonstration document.
- `src/models/randomDocument.ts` generates fictional CVs locally for layout
  evaluation. Generated identities, contacts, and careers are examples, not
  customer evidence.
- `tests/layout-check.mjs` and `tests/random-document-check.mjs` provide
  implementation checks; they are not usability research or market proof.

## Product Principles

1. Keep the job seeker's CV content and composition under their control.
2. Keep the core workflow usable in the browser without a backend dependency.
3. Make changes recoverable through undo and portable editable project files.
4. Make saving and export limitations clear so users can preserve their work.
5. Preserve the path from editable content to an A4 document for sharing.

## Open Decisions

- Competitive positioning beyond the existing visual block editor.
- Additional product requirements beyond the scope confirmed above.
- Product-specific accessibility standards or audience needs.
