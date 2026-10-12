import { useState, type MouseEvent } from 'react';
import { Moon, Sun } from 'lucide-react';
import type { Theme } from '../../hooks/useTheme';
import { RandomCVDialog } from './RandomCVDialog';
import type { RandomCVOptions } from '../../models/randomDocument';

interface ToolbarProps {
  theme: Theme;
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
  onImportClick: () => void;
  onExportPdf: () => void;
  onNewCV: (empty: boolean) => void;
  onRandomCV: (options: RandomCVOptions) => boolean;
}

export function Toolbar({ theme, onThemeChange, blockCount, saveStatus, preview, canUndo, canRedo, exporting, onPreviewChange, onUndo, onRedo, onExportProject, onImportClick, onExportPdf, onNewCV, onRandomCV }: ToolbarProps) {
  const [showRandomDialog, setShowRandomDialog] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const hasContent = blockCount > 0;
  function runMoreAction(event: MouseEvent<HTMLButtonElement>, action: () => void) {
    event.currentTarget.closest('details')?.removeAttribute('open');
    action();
  }
  return <>
    <header className="toolbar">
      <div className="toolbar-brand"><span className="brand-mark" aria-hidden="true">CV</span><div><strong>CV Builder</strong></div>
        <button type="button" className="theme-toggle" role="switch" aria-checked={theme === 'dark'} aria-label="Modalità scura" title={theme === 'dark' ? 'Passa alla modalità chiara' : 'Passa alla modalità scura'} onClick={onThemeChange}>
          <span className="theme-toggle-track" aria-hidden="true"><Sun className="theme-toggle-sun" size={16} /><Moon className="theme-toggle-moon" size={16} /><span className="theme-toggle-thumb" /></span>
        </button>
      </div>
      <div className="toolbar-document"><span className={`document-dot ${saveStatus}`} aria-hidden="true" /><span>Il mio CV</span><span className="toolbar-count">{blockCount} {blockCount === 1 ? 'sezione' : 'sezioni'} · {saveStatus === 'saved' ? 'Salvato in questo browser' : saveStatus === 'saving' ? 'Salvataggio...' : 'Salvataggio non riuscito'}</span></div>
      <div className="toolbar-actions">
        {preview ? <><button type="button" title="Esci dall’anteprima (Esc)" onClick={() => onPreviewChange(false)}>Torna all'editor <span className="shortcut-hint">Esc</span></button><button type="button" className="button-primary" onClick={onExportPdf} disabled={exporting || !hasContent} title={hasContent ? 'Scarica il CV in PDF' : 'Aggiungi una sezione prima di scaricare il PDF'}>{exporting ? 'Preparazione PDF...' : 'Scarica PDF'}</button></> : <>
        <button type="button" onClick={() => setShowNewDialog(true)}>Nuovo CV</button>
        <button type="button" title={hasContent ? 'Vedi il CV senza strumenti di modifica (Ctrl+A)' : 'Aggiungi una sezione per vedere l’anteprima'} disabled={!hasContent} onClick={() => onPreviewChange(!preview)}>Anteprima <span className="shortcut-hint">Ctrl+A</span></button>
        <span className="toolbar-separator" aria-hidden="true" />
        <button type="button" onClick={onUndo} disabled={!canUndo} title="Annulla (Ctrl+Z)">↶ <span>Annulla</span></button>
        <button type="button" onClick={onRedo} disabled={!canRedo} title="Ripristina (Ctrl+Shift+Z)">↷ <span>Ripristina</span></button>
        <button type="button" className="button-primary" onClick={onExportPdf} disabled={exporting || !hasContent} title={hasContent ? 'Scarica il CV in PDF' : 'Aggiungi una sezione prima di scaricare il PDF'}>{exporting ? 'Preparazione PDF...' : 'Scarica PDF'}</button>
        <details className="toolbar-more"><summary>Altre azioni</summary><div className="toolbar-more-menu">
          <button type="button" aria-label="Scarica progetto in formato JSON" onClick={(event) => runMoreAction(event, onExportProject)}>Scarica progetto (JSON)</button>
          <button type="button" aria-label="Apri un progetto in formato JSON" onClick={(event) => runMoreAction(event, onImportClick)}>Apri progetto (JSON)</button>
          <button type="button" aria-label="Genera un CV fittizio per provare l’editor" onClick={(event) => runMoreAction(event, () => setShowRandomDialog(true))}>Genera CV fittizio</button>
        </div></details>
        </>}
      </div>
    </header>
    {showRandomDialog && <RandomCVDialog hasCurrentCV={hasContent} onGenerate={onRandomCV} onClose={() => setShowRandomDialog(false)} />}
    {showNewDialog && <div className="modal-backdrop" role="presentation" onClick={() => setShowNewDialog(false)}><div className="new-cv-dialog" role="dialog" aria-modal="true" aria-labelledby="new-cv-title" onClick={(event) => event.stopPropagation()}><h2 id="new-cv-title">{hasContent ? 'Sostituire il CV attuale?' : 'Come vuoi iniziare?'}</h2><p>{hasContent ? 'Puoi recuperare il CV attuale con Annulla finché la pagina rimane aperta.' : 'Scegli un esempio da personalizzare o parti da una pagina vuota.'}</p><div className="dialog-actions"><button type="button" onClick={() => setShowNewDialog(false)}>{hasContent ? 'Tieni il CV attuale' : 'Chiudi'}</button><button type="button" onClick={() => { onNewCV(true); setShowNewDialog(false); }}>{hasContent ? 'Sostituisci con un CV vuoto' : 'Crea CV vuoto'}</button><button type="button" className="button-primary" onClick={() => { onNewCV(false); setShowNewDialog(false); }}>{hasContent ? 'Sostituisci con l’esempio' : 'Parti da un esempio'}</button></div></div></div>}
  </>;
}
