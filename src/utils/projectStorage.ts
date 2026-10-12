import type { CVDocument } from '../models/cv';
import { loadSavedDocument, parseDocument } from './documentStorage';

const INDEX_KEY = 'cv-builder-projects-v1';
const ACTIVE_KEY = 'cv-builder-active-project-v1';
const projectKey = (id: string) => `cv-builder-project-v1:${id}`;
export interface ProjectSummary { id: string; name: string; updatedAt: string }

export function listProjects(): ProjectSummary[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(INDEX_KEY) ?? '[]');
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is ProjectSummary => item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.updatedAt === 'string');
  } catch { return []; }
}

export function readProject(id: string): CVDocument {
  const raw = localStorage.getItem(projectKey(id));
  if (!raw) throw new Error('Questo progetto non è più disponibile nel browser.');
  return parseDocument(JSON.parse(raw));
}

export function writeProject(id: string, document: CVDocument): void {
  // Write the document first: a failed save must never point the index at missing data.
  localStorage.setItem(projectKey(id), JSON.stringify(document));
  const summary = { id, name: document.name || 'Il mio CV', updatedAt: new Date().toISOString() };
  localStorage.setItem(INDEX_KEY, JSON.stringify([summary, ...listProjects().filter((project) => project.id !== id)]));
  localStorage.setItem(ACTIVE_KEY, id);
}

export function loadWorkspace(): { id: string; document: CVDocument } {
  const candidates = listProjects();
  let active: string | null = null;
  try { active = localStorage.getItem(ACTIVE_KEY); } catch { /* Storage may be blocked. */ }
  const ids = [...new Set([...(active ? [active] : []), ...candidates.map((project) => project.id)])];
  for (const id of ids) {
    try { return { id, document: readProject(id) }; } catch { /* Try the next saved project, then the legacy document. */ }
  }
  return { id: crypto.randomUUID(), document: loadSavedDocument() };
}
