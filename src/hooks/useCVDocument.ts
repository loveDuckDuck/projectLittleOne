import { useEffect, useReducer, useState } from 'react';
import type { CVDocument } from '../models/cv';
import { listProjects, loadWorkspace, readProject, writeProject } from '../utils/projectStorage';

interface HistoryState {
  past: CVDocument[];
  present: CVDocument;
  future: CVDocument[];
}

type Action =
  | { type: 'commit'; document: CVDocument }
  | { type: 'replace'; document: CVDocument }
  | { type: 'open'; document: CVDocument }
  | { type: 'undo' }
  | { type: 'redo' };

function reducer(state: HistoryState, action: Action): HistoryState {
  switch (action.type) {
    case 'commit':
      if (action.document === state.present) return state;
      return { past: [...state.past, state.present].slice(-50), present: action.document, future: [] };
    case 'replace':
      return { past: [...state.past, state.present].slice(-50), present: action.document, future: [] };
    case 'open':
      return { past: [], present: action.document, future: [] };
    case 'undo':
      if (state.past.length === 0) return state;
      return { past: state.past.slice(0, -1), present: state.past[state.past.length - 1], future: [state.present, ...state.future].slice(0, 50) };
    case 'redo':
      if (state.future.length === 0) return state;
      return { past: [...state.past, state.present].slice(-50), present: state.future[0], future: state.future.slice(1) };
  }
}

export function useCVDocument() {
  const [workspace] = useState(loadWorkspace);
  const [projectId, setProjectId] = useState(workspace.id);
  const [projects, setProjects] = useState(listProjects);
  const [history, dispatch] = useReducer(reducer, workspace.document, (document): HistoryState => ({ past: [], present: document, future: [] }));
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saving');

  useEffect(() => {
    setSaveStatus('saving');
    const timer = window.setTimeout(() => {
      try { writeProject(projectId, history.present); setProjects(listProjects()); setSaveStatus('saved'); }
      catch { setSaveStatus('error'); }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [history.present, projectId]);

  useEffect(() => {
    const flush = () => { try { writeProject(projectId, history.present); } catch { /* Keep the last successful save. */ } };
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, [history.present, projectId]);

  function openProject(id: string) {
    if (id === projectId) return;
    const document = readProject(id);
    writeProject(projectId, history.present);
    writeProject(id, document);
    setProjectId(id);
    setProjects(listProjects());
    dispatch({ type: 'open', document });
  }

  function newProject(document: CVDocument) {
    // Flush pending edits before switching; keep every previous CV in the library.
    writeProject(projectId, history.present);
    const id = crypto.randomUUID();
    writeProject(id, document);
    setProjectId(id);
    setProjects(listProjects());
    dispatch({ type: 'open', document });
  }

  return {
    document: history.present,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    saveStatus,
    projectId, projects, openProject, newProject,
    commit: (document: CVDocument) => dispatch({ type: 'commit', document }),
    replace: (document: CVDocument) => dispatch({ type: 'replace', document }),
    undo: () => dispatch({ type: 'undo' }),
    redo: () => dispatch({ type: 'redo' }),
  };
}
