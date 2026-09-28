import { useEffect, useReducer, useState } from 'react';
import type { CVDocument } from '../models/cv';
import { loadSavedDocument, saveDocument } from '../utils/documentStorage';

interface HistoryState {
  past: CVDocument[];
  present: CVDocument;
  future: CVDocument[];
}

type Action =
  | { type: 'commit'; document: CVDocument }
  | { type: 'replace'; document: CVDocument }
  | { type: 'undo' }
  | { type: 'redo' };

function reducer(state: HistoryState, action: Action): HistoryState {
  switch (action.type) {
    case 'commit':
      if (action.document === state.present) return state;
      return { past: [...state.past, state.present].slice(-50), present: action.document, future: [] };
    case 'replace':
      return { past: [...state.past, state.present].slice(-50), present: action.document, future: [] };
    case 'undo':
      if (state.past.length === 0) return state;
      return { past: state.past.slice(0, -1), present: state.past[state.past.length - 1], future: [state.present, ...state.future].slice(0, 50) };
    case 'redo':
      if (state.future.length === 0) return state;
      return { past: [...state.past, state.present].slice(-50), present: state.future[0], future: state.future.slice(1) };
  }
}

export function useCVDocument() {
  const [history, dispatch] = useReducer(reducer, undefined, (): HistoryState => ({ past: [], present: loadSavedDocument(), future: [] }));
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  useEffect(() => {
    setSaveStatus('saving');
    const timer = window.setTimeout(() => {
      try { saveDocument(history.present); setSaveStatus('saved'); }
      catch { setSaveStatus('error'); }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [history.present]);

  return {
    document: history.present,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    saveStatus,
    commit: (document: CVDocument) => dispatch({ type: 'commit', document }),
    replace: (document: CVDocument) => dispatch({ type: 'replace', document }),
    undo: () => dispatch({ type: 'undo' }),
    redo: () => dispatch({ type: 'redo' }),
  };
}
