import { useEffect, useRef, useState, type MouseEvent } from 'react';
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
  documentName: string;
  onRename: (name: string) => void;
  onNewCV: () => void;
  onProjects: () => void;
  onGlobalStyle: () => void;
  onRandomCV: (options: RandomCVOptions) => boolean;
}

export function Toolbar({ theme, onThemeChange, blockCount, saveStatus, preview, canUndo, canRedo, exporting, onPreviewChange, onUndo, onRedo, onExportProject, onImportClick, onExportPdf, onNewCV, onRandomCV, documentName, onRename, onProjects, onGlobalStyle }: ToolbarProps) {
  const [showRandomDialog, setShowRandomDialog] = useState(false);
  const moreMenu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !moreMenu.current?.contains(event.target)) moreMenu.current?.removeAttribute('open');
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !moreMenu.current?.open) return;
      event.preventDefault();
      moreMenu.current.removeAttribute('open');
      moreMenu.current.querySelector('summary')?.focus();
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);
  const hasContent = blockCount > 0;
  function runMoreAction(event: MouseEvent<HTMLButtonElement>, action: () => void) {
    event.currentTarget.closest('details')?.removeAttribute('open');
    action();
  }
  return <>
    <header className="toolbar">
      <div className="toolbar-brand"><img className="brand-mark" src={`${import.meta.env.BASE_URL}otter-logo.svg`} width={36} height={36} alt="" /><div><strong>Otter Builder</strong></div>
        <button type="button" className="theme-toggle" role="switch" aria-checked={theme === 'dark'} aria-label="Modalità scura" title={theme === 'dark' ? 'Passa alla modalità chiara' : 'Passa alla modalità scura'} onClick={onThemeChange}>
          <span className="theme-toggle-track" aria-hidden="true"><Sun className="theme-toggle-sun" size={16} /><Moon className="theme-toggle-moon" size={16} /><span className="theme-toggle-thumb" /></span>
        </button>
      </div>
      <div className="toolbar-document"><span className={`document-dot ${saveStatus}`} aria-hidden="true" /><input key={documentName} className="project-name-input" aria-label="Nome del progetto" maxLength={120} defaultValue={documentName} onBlur={(event) => { const name = event.target.value.trim() || documentName; event.target.value = name; if (name !== documentName) onRename(name); }} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }} /><span className="toolbar-count">{blockCount} {blockCount === 1 ? 'sezione' : 'sezioni'} · {saveStatus === 'saved' ? 'Salvato in questo browser' : saveStatus === 'saving' ? 'Salvataggio...' : 'Salvataggio non riuscito'}</span></div>
      <div className="toolbar-actions">
        {preview ? <><button type="button" title="Esci dall’anteprima (Esc)" onClick={() => onPreviewChange(false)}>Torna all'editor <span className="shortcut-hint">Esc</span></button><button type="button" className="button-primary" onClick={onExportPdf} disabled={exporting || !hasContent} title={hasContent ? 'Scarica il CV in PDF' : 'Aggiungi una sezione prima di scaricare il PDF'}>{exporting ? 'Preparazione PDF...' : 'Scarica PDF'}</button></> : <>
        <button type="button" className="desktop-project-action" onClick={onNewCV}>Nuovo CV</button><button type="button" className="desktop-project-action" onClick={onProjects}>I miei CV</button>
        <button type="button" title={hasContent ? 'Vedi il CV senza strumenti di modifica (Alt+P)' : 'Aggiungi una sezione per vedere l’anteprima'} disabled={!hasContent} onClick={() => onPreviewChange(!preview)}>Anteprima <span className="shortcut-hint">Alt+P</span></button>
        <span className="toolbar-separator" aria-hidden="true" />
        <button type="button" className="history-action" aria-label="Annulla" onClick={onUndo} disabled={!canUndo} title="Annulla (Ctrl+Z)">↶ <span>Annulla</span></button>
        <button type="button" className="history-action" aria-label="Ripristina" onClick={onRedo} disabled={!canRedo} title="Ripristina (Ctrl+Shift+Z)">↷ <span>Ripristina</span></button>
        <button type="button" className="button-primary" onClick={onExportPdf} disabled={exporting || !hasContent} title={hasContent ? 'Scarica il CV in PDF' : 'Aggiungi una sezione prima di scaricare il PDF'}>{exporting ? 'Preparazione PDF...' : 'Scarica PDF'}</button>
        <details ref={moreMenu} className="toolbar-more"><summary aria-label="Altre azioni"><span className="more-label">Altre azioni</span><span className="mobile-more-label">Altro</span></summary><div className="toolbar-more-menu">
          <button type="button" className="mobile-project-action" onClick={(event) => runMoreAction(event, onNewCV)}>Nuovo CV</button>
          <button type="button" className="mobile-project-action" onClick={(event) => runMoreAction(event, onProjects)}>I miei CV</button>
          <button type="button" onClick={(event) => runMoreAction(event, onGlobalStyle)}>Stile del CV<small>Font, colori e sfondo di tutto il documento</small></button>
          <button type="button" aria-label="Scarica copia modificabile" title="Progetto in formato JSON" onClick={(event) => runMoreAction(event, onExportProject)}>Scarica copia modificabile<small>Backup da riaprire e modificare, anche su un altro dispositivo</small></button>
          <button type="button" aria-label="Apri copia modificabile" title="Progetto in formato JSON" onClick={(event) => runMoreAction(event, onImportClick)}>Apri copia modificabile<small>Importa un backup JSON come nuovo CV</small></button>
          <button type="button" aria-label="Genera un CV fittizio per provare l’editor" onClick={(event) => runMoreAction(event, () => setShowRandomDialog(true))}>Genera CV fittizio</button>
        </div></details>
        </>}
      </div>
    </header>
    {showRandomDialog && <RandomCVDialog hasCurrentCV={hasContent} onGenerate={onRandomCV} onClose={() => setShowRandomDialog(false)} />}
  </>;
}
