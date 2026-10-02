import { useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import packageInfo from '../../../package.json';

interface ToolbarProps {
  theme: 'light' | 'dark';
  onThemeChange: () => void;
  blockCount: number;
  saveStatus: 'saved' | 'saving' | 'error';
  preview: boolean;
  canUndo: boolean;
  canRedo: boolean;
  exporting: boolean;
  onPreviewChange: (preview: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  onExportProject: () => void;
  onImportProject: (file: File) => void;
  onExportPdf: () => void;
  onNewCV: (empty: boolean) => void;
}

export function Toolbar({ theme, onThemeChange, blockCount, saveStatus, preview, canUndo, canRedo, exporting, onPreviewChange, onUndo, onRedo, onExportProject, onImportProject, onExportPdf, onNewCV }: ToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  return <>
    <header className="toolbar">
      <div className="toolbar-brand"><span className="brand-mark" aria-hidden="true">CV</span><div><strong>CV Builder</strong><span>Beta {packageInfo.version}</span></div><button type="button" className="theme-toggle" role="switch" aria-checked={theme === 'dark'} aria-label="Modalità scura" title={theme === 'dark' ? 'Passa alla modalità chiara' : 'Passa alla modalità scura'} onClick={onThemeChange}><Sun size={15} aria-hidden="true" /><Moon size={15} aria-hidden="true" /><span className="theme-toggle-thumb" aria-hidden="true" /></button></div>
      <div className="toolbar-document"><span className={`document-dot ${saveStatus}`} aria-hidden="true" />Il mio curriculum<span className="toolbar-count">{blockCount} blocchi · {saveStatus === 'saved' ? 'Salvato' : saveStatus === 'saving' ? 'Salvataggio...' : 'Errore salvataggio'}</span></div>
      <div className="toolbar-actions">
        {preview ? <><button type="button" onClick={() => onPreviewChange(false)}>Torna all'editor</button><button type="button" className="button-primary" onClick={onExportPdf} disabled={exporting}>{exporting ? 'Esportazione...' : 'Esporta PDF'}</button></> : <>
        <button type="button" onClick={() => setShowNewDialog(true)}>Nuovo CV</button>
        <button type="button" onClick={() => onPreviewChange(!preview)}>{preview ? 'Modifica' : 'Anteprima'}</button>
        <span className="toolbar-separator" aria-hidden="true" />
        <button type="button" onClick={onUndo} disabled={!canUndo} title="Annulla (Ctrl+Z)">↶ <span>Annulla</span></button>
        <button type="button" onClick={onRedo} disabled={!canRedo} title="Ripristina (Ctrl+Shift+Z)">↷ <span>Ripristina</span></button>
        <span className="toolbar-separator" aria-hidden="true" />
        <button type="button" onClick={onExportProject}>Esporta JSON</button>
        <button type="button" onClick={() => fileRef.current?.click()}>Importa JSON</button>
        <input ref={fileRef} className="visually-hidden" type="file" accept=".json,application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) onImportProject(file); event.target.value = ''; }} />
        <button type="button" className="button-primary" onClick={onExportPdf} disabled={exporting}>{exporting ? 'Esportazione...' : 'Esporta PDF'}</button>
        </>}
      </div>
    </header>
    {showNewDialog && <div className="modal-backdrop" role="presentation" onClick={() => setShowNewDialog(false)}><div className="new-cv-dialog" role="dialog" aria-modal="true" aria-labelledby="new-cv-title" onClick={(event) => event.stopPropagation()}><h2 id="new-cv-title">Creare un nuovo CV?</h2><p>Il CV attuale sarà sostituito. Puoi recuperarlo con Annulla finché la pagina rimane aperta; esportalo in JSON se vuoi conservarlo.</p><div className="dialog-actions"><button type="button" onClick={() => setShowNewDialog(false)}>Annulla</button><button type="button" onClick={() => { onNewCV(true); setShowNewDialog(false); }}>CV vuoto</button><button type="button" className="button-primary" onClick={() => { onNewCV(false); setShowNewDialog(false); }}>Con esempio</button></div></div></div>}
  </>;
}
