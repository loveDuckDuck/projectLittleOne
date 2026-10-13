import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { ArrowLeft, ArrowRight, Copy, GripVertical, Trash2 } from 'lucide-react';
import type { CVBlockType, CVDocument, CVRow } from '../../models/cv';
import { sideColumnLayout, type DropTarget } from '../../utils/layout';
import { blockCatalog } from '../../models/blockCatalog';
import { type PageSlice } from '../../utils/pagination';
import { measurePages } from '../../utils/pageGeometry';
import { PdfPreview } from './PdfPreview';
import { LayoutPicker } from './LayoutPicker';
import { SortableBlock } from './SortableBlock';
import { CUSTOM_FONT_FAMILY } from '../../utils/assets';
import { pageBackground } from '../../utils/color';
import { backgroundImageStyle } from '../../utils/background';

export interface CVCanvasProps {
  document: CVDocument; projectId: string; selectedBlockId: string | null; dragId: string | null; dropTarget: DropTarget | null; preview: boolean;
  onSelectBlock: (id: string | null, field?: string) => void;
  guideStep: 'data' | 'experience' | 'review'; onGuideStep: (step: 'data' | 'experience' | 'review') => void;
  onMoveBlockTo: (id: string, target: DropTarget) => void; onMoveBlock: (id: string, direction: -1 | 1) => void;
  onEditText: (id: string, value: string) => void; onOpenProperties: () => void;
  onStartExample: () => void; onStartEmpty: () => void; onImportProject: () => void;
  onAddBlock: (type: CVBlockType) => void;
  onDuplicateBlock: (id: string) => void; onDeleteBlock: (id: string) => void;
  onPreset: (rowId: string, widths: readonly number[]) => void; onDuplicateRow: (rowId: string) => void;
  onDeleteRow: (rowId: string) => void; onResize: (rowId: string, leftIndex: number, width: number) => void;
  onMoveColumn: (rowId: string, columnId: string, direction: -1 | 1) => void;
  onPlaceSelectedBlock: (rowId: string, columnId: string) => void;
}

function Column({ row, columnIndex, props, beginResize }: { row: CVRow; columnIndex: number; props: CVCanvasProps; beginResize: (event: PointerEvent<HTMLButtonElement>, index: number) => void }) {
  const column = row.columns[columnIndex];
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({ id: `column:${row.id}:${column.id}`, disabled: props.preview });
  const { preview, dropTarget } = props;
  const isBlankStarter = props.document.rows.length === 1 && row.columns.length === 1 && column.blocks.length === 0;
  return <div ref={setNodeRef} data-column-id={column.id} className={`cv-column ${isDragging ? 'is-dragging' : ''} ${dropTarget?.kind === 'column' && dropTarget.columnId === column.id ? 'is-drop-column' : ''}`}>
    {!preview && row.columns.length > 1 && <div className="column-tools" onClick={(event) => event.stopPropagation()}><button ref={setActivatorNodeRef} type="button" className="column-handle" title="Riordina con trascinamento o tastiera" aria-label={`Riordina colonna ${columnIndex + 1}; usa Spazio e le frecce`} {...attributes} {...listeners}><GripVertical size={14} aria-hidden="true" /><span>Colonna {columnIndex + 1}</span></button><button type="button" disabled={columnIndex === 0} title="Sposta colonna a sinistra" aria-label={`Sposta colonna ${columnIndex + 1} a sinistra`} onClick={() => props.onMoveColumn(row.id, column.id, -1)}><ArrowLeft size={14} /></button><button type="button" disabled={columnIndex === row.columns.length - 1} title="Sposta colonna a destra" aria-label={`Sposta colonna ${columnIndex + 1} a destra`} onClick={() => props.onMoveColumn(row.id, column.id, 1)}><ArrowRight size={14} /></button></div>}
    {column.blocks.map((block, index) => <div key={block.id} className="block-slot">
      {dropTarget?.kind === 'column' && dropTarget.columnId === column.id && dropTarget.index === index && !preview && !props.dragId?.startsWith('column:') && <div className="column-drop-line">Rilascia qui</div>}
      <SortableBlock block={block} index={index} count={column.blocks.length} selected={block.id === props.selectedBlockId} preview={preview} onSelect={(field) => props.onSelectBlock(block.id, field)} destinations={[
        ...props.document.rows.flatMap((destination, rowIndex) => destination.columns.map((column, columnIndex) => ({ label: `Riga ${rowIndex + 1} · colonna ${columnIndex + 1}`, target: { kind: 'column' as const, rowId: destination.id, columnId: column.id, index: column.blocks.length } }))),
        { label: 'Nuova riga sopra questa', target: { kind: 'row' as const, rowId: row.id, side: 'above' as const } },
        { label: 'Nuova riga sotto questa', target: { kind: 'row' as const, rowId: row.id, side: 'below' as const } },
      ]} onMoveTo={(target) => props.onMoveBlockTo(block.id, target)} onEditText={(value) => props.onEditText(block.id, value)} onMove={(direction) => props.onMoveBlock(block.id, direction)} onDuplicate={() => props.onDuplicateBlock(block.id)} onDelete={() => props.onDeleteBlock(block.id)} />
    </div>)}
    {dropTarget?.kind === 'column' && dropTarget.columnId === column.id && dropTarget.index === column.blocks.length && !preview && !props.dragId?.startsWith('column:') && <div className="column-drop-line">Rilascia qui</div>}
    {column.blocks.length === 0 && !preview && (props.selectedBlockId
      ? <button type="button" className="empty-column" onClick={(event) => { event.stopPropagation(); props.onPlaceSelectedBlock(row.id, column.id); }}>Sposta qui la sezione selezionata</button>
      : isBlankStarter
        ? <button type="button" className="empty-column" onClick={() => props.onAddBlock('personal')}>Aggiungi i tuoi dati personali</button>
        : <div className="empty-column empty-column-hint">Scegli una sezione dal pannello a sinistra</div>)}
    {!preview && columnIndex < row.columns.length - 1 && <button type="button" className="column-divider" onPointerDown={(event) => beginResize(event, columnIndex)} title="Trascina per cambiare la larghezza delle colonne" aria-label={`Ridimensiona colonne ${columnIndex + 1} e ${columnIndex + 2}`}><span className="column-divider-grip" aria-hidden="true" /></button>}
  </div>;
}

function Row({ row, number, props }: { row: CVRow; number: number; props: CVCanvasProps }) {
  const { preview, dropTarget } = props;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `row:${row.id}`, disabled: preview });
  const sideTarget = !preview && dropTarget?.kind === 'side' && dropTarget.rowId === row.id && !props.dragId?.startsWith('row:') && !props.dragId?.startsWith('column:') ? dropTarget : null;
  const sideLayout = sideTarget ? sideColumnLayout(row, sideTarget.columnId, sideTarget.side) : null;
  const draggedLabel = props.dragId?.startsWith('palette:') ? blockCatalog.find((item) => item.type === props.dragId?.slice(8))?.label : 'Blocco';
  const columns = row.columns.map((column, columnIndex) => <Column key={column.id} row={row} columnIndex={columnIndex} props={props} beginResize={beginResize} />);
  if (sideLayout) columns.splice(sideLayout.insertionIndex, 0, <div key="drop-preview" className="cv-column-drop-preview"><span>{draggedLabel}</span><small>{sideTarget?.side === 'left' ? 'A sinistra' : 'A destra'}</small></div>);
  function beginResize(event: PointerEvent<HTMLButtonElement>, index: number) {
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    event.preventDefault(); event.stopPropagation();
    const grid = event.currentTarget.closest<HTMLElement>('.cv-row-grid');
    if (!grid) return;
    const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
    const usableWidth = grid.getBoundingClientRect().width - gap * (row.columns.length - 1);
    if (usableWidth <= 0) return;
    const start = event.clientX;
    const initial = row.columns[index].width;
    const total = initial + row.columns[index + 1].width;
    const originalTemplate = grid.style.gridTemplateColumns;
    const previousCursor = document.body.style.cursor;
    const previousSelection = document.body.style.userSelect;
    let next = initial;
    const pointerId = event.pointerId;
    const move = (pointer: globalThis.PointerEvent) => {
      if (pointer.pointerId !== pointerId) return;
      next = Math.max(20, Math.min(total - 20, initial + Math.round((pointer.clientX - start) / usableWidth * 100)));
      grid.style.gridTemplateColumns = row.columns.map((column, columnIndex) => `${columnIndex === index ? next : columnIndex === index + 1 ? total - next : column.width}fr`).join(' ');
    };
    const end = (pointer: globalThis.PointerEvent) => {
      if (pointer.pointerId !== pointerId) return;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      grid.classList.remove('is-resizing');
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousSelection;
      if (pointer.type === 'pointercancel') grid.style.gridTemplateColumns = originalTemplate;
      else if (next !== initial) props.onResize(row.id, index, next);
    };
    grid.classList.add('is-resizing');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  }
  return <div className={`cv-row ${isDragging ? 'is-dragging' : ''} ${sideLayout ? 'is-side-preview' : ''}`} data-row-id={row.id}>
    {!preview && <div className="row-controls" onClick={(event) => event.stopPropagation()}>
      <button ref={setNodeRef} type="button" className="row-handle" title="Riordina con trascinamento o tastiera" aria-label={`Riordina riga ${number}; usa Spazio e le frecce`} {...attributes} {...listeners}><GripVertical size={15} aria-hidden="true" /><span>Riga {number}</span></button>
      <LayoutPicker widths={row.columns.map((column) => column.width)} rowNumber={number} onChange={(widths) => props.onPreset(row.id, widths)} />
      <button type="button" title="Duplica riga" aria-label={`Duplica riga ${number}`} onClick={() => props.onDuplicateRow(row.id)}><Copy size={14} /></button>
      <button type="button" title="Elimina riga" aria-label={`Elimina riga ${number}`} onClick={() => props.onDeleteRow(row.id)}><Trash2 size={14} /></button>
    </div>}
    {dropTarget?.kind === 'row' && dropTarget.rowId === row.id && !preview && <div className={`row-drop row-drop-${dropTarget.side}`}>Rilascia {dropTarget.side === 'above' ? 'sopra' : 'sotto'}</div>}
    <div className="cv-row-grid" style={{ gridTemplateColumns: (sideLayout?.widths ?? row.columns.map((column) => column.width)).map((width) => `${width}fr`).join(' ') }}>
      {columns}
    </div>
  </div>;
}

export function CVCanvas(props: CVCanvasProps) {
  const { document, preview, onSelectBlock } = props;
  const isEmpty = document.rows.every((row) => row.columns.every((column) => column.blocks.length === 0)) && !preview;
  const { globalStyle } = document;
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [slices, setSlices] = useState<PageSlice[]>([{ start: 0, end: 0 }]);
  const [zoomed, setZoomed] = useState(false);
  const { setNodeRef } = useDroppable({ id: 'canvas' });
  useEffect(() => {
    pageRef.current?.parentElement?.scrollTo({ top: 0, left: 0 });
  }, [props.projectId]);
  useEffect(() => {
    if (!props.selectedBlockId || preview) return;
    const block = Array.from(pageRef.current?.querySelectorAll<HTMLElement>('[data-block-id]') ?? []).find((item) => item.dataset.blockId === props.selectedBlockId);
    block?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [props.selectedBlockId, preview]);
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const measure = () => {
      setSlices(measurePages(page).slices);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(page);
    page.querySelectorAll('.cv-row').forEach((row) => observer.observe(row));
    measure();
    return () => observer.disconnect();
  }, [document.rows, globalStyle.pageMargin]);
  const style = { fontFamily: globalStyle.fontFamily === CUSTOM_FONT_FAMILY ? '"CV Custom Font", Arial, sans-serif' : globalStyle.fontFamily, color: globalStyle.textColor, backgroundColor: pageBackground(globalStyle.backgroundColor, globalStyle.backgroundOpacity), fontSize: `${globalStyle.baseFontSize}pt`, padding: `${globalStyle.pageMargin}mm`, '--page-margin': `${globalStyle.pageMargin}mm`, '--cv-accent': globalStyle.accentColor, '--section-spacing': `${globalStyle.sectionSpacing}px` } as CSSProperties;
  return <main className={`canvas-workspace ${preview ? 'is-preview' : ''} ${zoomed ? 'is-zoomed' : ''} ${isEmpty ? 'is-empty' : ''}`} onClick={(event) => { if (!preview && (event.target as HTMLElement).classList.contains('cv-page')) onSelectBlock(null); }}>
    {globalStyle.customFont && <style>{`@font-face { font-family: "${CUSTOM_FONT_FAMILY}"; src: url("${globalStyle.customFont.dataUrl}"); font-display: block; }`}</style>}
    <nav className="cv-guide" aria-label="Passaggi per creare il CV">{(['data', 'experience', 'review'] as const).map((step, index) => <button type="button" key={step} aria-current={(preview ? step === 'review' : props.guideStep === step) ? 'step' : undefined} onClick={() => props.onGuideStep(step)}><span>{index + 1}</span>{['Dati', 'Esperienze', 'Revisione'][index]}</button>)}</nav>
    <div className="canvas-topline"><div><h2>Il tuo CV</h2></div><div className="canvas-top-actions">{!isEmpty && <><span className="page-size-label">A4 · {slices.length} {slices.length === 1 ? 'pagina' : 'pagine'}</span>{!preview && <button type="button" className="page-zoom-button" aria-pressed={zoomed} onClick={() => setZoomed(!zoomed)}>{zoomed ? 'Adatta pagina' : 'Ingrandisci pagina'}</button>}</>}{!preview && <button type="button" className="edit-panel-button" onClick={props.onOpenProperties}>{props.selectedBlockId ? 'Modifica sezione' : 'Personalizza aspetto'}</button>}</div></div>
    {isEmpty ? <section className="empty-start" aria-labelledby="empty-start-title">
      <h3 id="empty-start-title">Crea il tuo CV</h3>
      <p>Scegli un modello oppure inserisci i tuoi dati. La guida ti accompagna fino al PDF.</p>
      <div className="empty-start-actions">
        <button type="button" className="button-primary" onClick={props.onStartExample}>Scegli un modello</button>
        <button type="button" onClick={() => props.onGuideStep('data')}>Inserisci i tuoi dati</button>
        <button type="button" className="empty-start-import" onClick={props.onImportProject}>Apri copia modificabile</button>
      </div>
      <ol className="empty-start-steps"><li>Inserisci i tuoi dati personali</li><li>Aggiungi esperienze e formazione</li><li>Controlla l’anteprima e scarica il PDF</li></ol>
      <p className="empty-start-note">Il CV si salva in questo browser. Scarica una copia modificabile per conservarla anche altrove.</p>
    </section> : <>
      {preview && <PdfPreview document={document} />}
      <div className={`canvas-scroll ${preview ? 'preview-source' : ''}`} aria-hidden={preview || undefined}><div id="cv-print-area" ref={(node) => { pageRef.current = node; setNodeRef(node); }} className="cv-page" style={style}>
        {globalStyle.backgroundImage && <span className="page-background-image" aria-hidden="true" style={{ ...backgroundImageStyle(globalStyle.backgroundImage, globalStyle.backgroundMode, 'page'), opacity: (globalStyle.backgroundOpacity ?? 100) / 100 }} />}
        {document.rows.map((row, index) => <Row key={row.id} row={row} number={index + 1} props={props} />)}
        {slices.slice(0, -1).map((slice, index) => <div className="page-break-indicator" style={{ top: `${slice.end}px` }} key={index}><span>Pagina {index + 2}</span></div>)}
      </div></div>
      {!preview && <details className="canvas-help"><summary>Guida rapida: modifica, layout e salvataggio</summary>
        <p><strong>Modifica.</strong> Clicca un contenuto nel CV e scrivi nel pannello Proprietà. Premi + nella libreria per aggiungere una sezione. Per cambiare font, colori e sfondo di tutto il documento, apri «Altre azioni» → «Stile del CV».</p>
        <p><strong>Organizza.</strong> Seleziona una sezione e usa le frecce per riordinarla o «Sposta in…» per cambiare riga o colonna. Il menu Layout della riga crea da una a tre colonne. Puoi anche trascinare le sezioni.</p>
        <p><strong>Conserva.</strong> Il salvataggio automatico resta in questo browser. In «Altre azioni», scarica una copia modificabile per avere un backup o continuare su un altro dispositivo. Il PDF serve per condividere il CV; per riprendere le modifiche, riapri la copia JSON.</p>
      </details>}
    </>}
  </main>;
}
