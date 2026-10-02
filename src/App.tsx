import { useEffect, useRef, useState } from 'react';
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, closestCenter, defaultKeyboardCoordinateGetter, useSensor, useSensors, type DragEndEvent, type DragMoveEvent, type DragStartEvent } from '@dnd-kit/core';
import { CVCanvas } from './components/editor/CVCanvas';
import { BlockPreview } from './components/editor/BlockPreview';
import { Toolbar } from './components/editor/Toolbar';
import { PropertiesPanel } from './components/properties/PropertiesPanel';
import { BlocksSidebar } from './components/sidebar/BlocksSidebar';
import { blockCatalog } from './models/blockCatalog';
import { createBlock, createStarterDocument } from './models/createBlock';
import type { BlockStyle, CVBlock, CVBlockType, GlobalCVStyle } from './models/cv';
import { useCVDocument } from './hooks/useCVDocument';
import { blocksOf, locateBlock, mapBlock, moveBlockTo, moveColumn, placeBlock, removeBlock, resizeColumns, setRowPreset, type DropTarget } from './utils/layout';
import { downloadProject, parseDocument } from './utils/documentStorage';
import { exportPdf } from './utils/exportPdf';

interface Toast { id: number; message: string; error?: boolean }

export default function App() {
  const { document, canUndo, canRedo, saveStatus, commit, replace, undo, redo } = useCVDocument();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = window.localStorage.getItem('cv-builder-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* The editor remains usable when storage is unavailable. */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const lastSaveStatus = useRef(saveStatus);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: defaultKeyboardCoordinateGetter }));
  const allBlocks = blocksOf(document);
  const selectedBlock = allBlocks.find((block) => block.id === selectedBlockId) ?? null;
  const activeBlock = allBlocks.find((block) => block.id === dragId);

  function notify(message: string, error = false) { setToast({ id: Date.now(), message, error }); }
  useEffect(() => {
    try { window.localStorage.setItem('cv-builder-theme', theme); }
    catch { /* The theme still works for this session. */ }
  }, [theme]);
  useEffect(() => {
    if (lastSaveStatus.current === 'saving' && saveStatus === 'saved' && canUndo) notify('CV salvato');
    if (saveStatus === 'error' && lastSaveStatus.current !== 'error') notify('Salvataggio locale non riuscito', true);
    lastSaveStatus.current = saveStatus;
  }, [saveStatus, canUndo]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast((current) => current?.id === toast.id ? null : current), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.target as HTMLElement | null)?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z') return;
      event.preventDefault();
      if (event.shiftKey) redo(); else undo();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

  function addBlock(type: CVBlockType, target?: DropTarget | null) {
    const block = createBlock(type);
    const selected = selectedBlockId && locateBlock(document, selectedBlockId);
    const destination = target === undefined && selected ? { kind: 'column' as const, rowId: selected.row.id, columnId: selected.column.id, index: selected.index + 1 } : target ?? null;
    commit(placeBlock(document, block, destination));
    setSelectedBlockId(block.id);
    setPropertiesOpen(true);
    notify('Blocco aggiunto');
  }
  function moveBlock(id: string, direction: -1 | 1) {
    const found = locateBlock(document, id);
    if (!found) return;
    const next = found.index + direction;
    if (next < 0 || next >= found.column.blocks.length) return;
    const rows = document.rows.map((row) => ({ ...row, columns: row.columns.map((column) => column.id === found.column.id ? { ...column, blocks: column.blocks.map((block) => block) } : column) }));
    const column = rows.find((row) => row.id === found.row.id)!.columns.find((column) => column.id === found.column.id)!;
    [column.blocks[found.index], column.blocks[next]] = [column.blocks[next], column.blocks[found.index]];
    commit({ ...document, rows });
  }
  function duplicateBlock(id: string) {
    const found = locateBlock(document, id);
    if (!found) return;
    const copy = structuredClone(found.column.blocks[found.index]);
    copy.id = crypto.randomUUID();
    commit(placeBlock(document, copy, { kind: 'column', rowId: found.row.id, columnId: found.column.id, index: found.index + 1 }));
    setSelectedBlockId(copy.id);
  }
  function deleteBlock(id: string) {
    if (!locateBlock(document, id)) return;
    commit(removeBlock(document, id));
    if (selectedBlockId === id) setSelectedBlockId(null);
    notify('Blocco eliminato · Annulla per ripristinarlo');
  }
  function duplicateRow(id: string) {
    const index = document.rows.findIndex((row) => row.id === id);
    if (index < 0) return;
    const copy = structuredClone(document.rows[index]);
    copy.id = crypto.randomUUID();
    copy.columns.forEach((column) => { column.id = crypto.randomUUID(); column.blocks.forEach((block) => { block.id = crypto.randomUUID(); }); });
    const rows = [...document.rows]; rows.splice(index + 1, 0, copy); commit({ ...document, rows });
  }
  function deleteRow(id: string) { commit({ ...document, rows: document.rows.filter((row) => row.id !== id) }); setSelectedBlockId(null); }
  function updateSelectedData(data: CVBlock['data']) { if (selectedBlockId) commit(mapBlock(document, selectedBlockId, (block) => ({ ...block, data } as CVBlock))); }
  function updateInlineText(id: string, value: string) {
    const current = allBlocks.find((block) => block.id === id);
    if (!current || (current.type !== 'text' && current.type !== 'heading') || current.data.text === value) return;
    commit(mapBlock(document, id, (block) => block.type === 'text' || block.type === 'heading' ? { ...block, data: { ...block.data, text: value } } as CVBlock : block));
  }
  function updateSelectedStyle(style: Partial<BlockStyle>) { if (selectedBlockId) commit(mapBlock(document, selectedBlockId, (block) => ({ ...block, style: { ...block.style, ...style } }))); }
  function updateGlobalStyle(style: Partial<GlobalCVStyle>) { commit({ ...document, globalStyle: { ...document.globalStyle, ...style } }); }

  function targetAt(event: DragMoveEvent | DragEndEvent): DropTarget | null {
    const page = globalThis.document.getElementById('cv-print-area');
    if (!page || !(event.activatorEvent instanceof MouseEvent)) return null;
    const x = event.activatorEvent.clientX + event.delta.x;
    const y = event.activatorEvent.clientY + event.delta.y;
    const pageRect = page.getBoundingClientRect();
    if (x < pageRect.left || x > pageRect.right || y < pageRect.top || y > pageRect.bottom) return null;
    const rows = Array.from(page.querySelectorAll<HTMLElement>('.cv-row'));
    if (!rows.length) return null;
    const activeId = String(event.active.id);
    if (activeId.startsWith('column:')) {
      const [, sourceRowId, sourceColumnId] = activeId.split(':');
      const sourceRow = rows.find((item) => item.dataset.rowId === sourceRowId);
      if (!sourceRow) return null;
      const rect = sourceRow.getBoundingClientRect();
      if (y < rect.top - 24 || y > rect.bottom + 12) return null;
      const columns = Array.from(sourceRow.querySelectorAll<HTMLElement>('.cv-column'));
      const column = columns.find((item) => x < item.getBoundingClientRect().right) ?? columns[columns.length - 1];
      if (!column?.dataset.columnId || column.dataset.columnId === sourceColumnId) return null;
      return { kind: 'column', rowId: sourceRowId, columnId: column.dataset.columnId, index: 0 };
    }
    let row = rows.find((item) => y < item.getBoundingClientRect().bottom) ?? rows[rows.length - 1];
    const rowRect = row.getBoundingClientRect();
    const rowId = row.dataset.rowId!;
    if (y < rowRect.top + Math.min(12, rowRect.height * .12)) return { kind: 'row', rowId, side: 'above' };
    if (y > rowRect.bottom - Math.min(12, rowRect.height * .12)) return { kind: 'row', rowId, side: 'below' };
    const columns = Array.from(row.querySelectorAll<HTMLElement>('.cv-column'));
    const column = columns.find((item) => x < item.getBoundingClientRect().right) ?? columns[columns.length - 1];
    if (!column) return { kind: 'row', rowId, side: 'below' };
    const columnId = column.dataset.columnId!;
    const blocks = Array.from(column.querySelectorAll<HTMLElement>('.canvas-block'));
    const columnRect = column.getBoundingClientRect();
    const zoom = Number.parseFloat(getComputedStyle(page).zoom) || 1;
    const sideZone = Math.min(72 * zoom, columnRect.width * .22);
    if (columns.length < 3 && blocks.length && x < columnRect.left + sideZone) return { kind: 'side', rowId, columnId, side: 'left' };
    if (columns.length < 3 && blocks.length && x > columnRect.right - sideZone) return { kind: 'side', rowId, columnId, side: 'right' };
    const index = blocks.findIndex((block) => y < block.getBoundingClientRect().top + block.getBoundingClientRect().height / 2);
    return { kind: 'column', rowId, columnId, index: index < 0 ? blocks.length : index };
  }
  function onDragStart(event: DragStartEvent) { setDragId(String(event.active.id)); setDropTarget(null); }
  function onDragMove(event: DragMoveEvent) { setDropTarget(targetAt(event)); }
  function onDragEnd(event: DragEndEvent) {
    const id = String(event.active.id);
    const target = event.activatorEvent instanceof MouseEvent ? targetAt(event) : dropTarget;
    setDragId(null); setDropTarget(null);
    if (id.startsWith('column:')) {
      const [, rowId, columnId] = id.split(':');
      if (target?.kind === 'column' && target.rowId === rowId) commit(moveColumn(document, rowId, columnId, target.columnId));
      return;
    }
    if (id.startsWith('palette:')) {
      const type = id.slice(8) as CVBlockType;
      const page = globalThis.document.getElementById('cv-print-area');
      const point = event.activatorEvent instanceof MouseEvent ? { x: event.activatorEvent.clientX + event.delta.x, y: event.activatorEvent.clientY + event.delta.y } : null;
      const rect = page?.getBoundingClientRect();
      const inEmptyPage = !document.rows.length && point && rect && point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
      if (blockCatalog.some((item) => item.type === type) && (target || inEmptyPage)) addBlock(type, target);
      return;
    }
    if (id.startsWith('row:')) {
      if (!target) return;
      const sourceId = id.slice(4);
      if (sourceId === target.rowId) return;
      const moving = document.rows.find((row) => row.id === sourceId);
      if (!moving) return;
      const rows = document.rows.filter((row) => row.id !== sourceId);
      const index = rows.findIndex((row) => row.id === target.rowId);
      rows.splice(index + (target.kind === 'row' && target.side === 'above' ? 0 : 1), 0, moving);
      commit({ ...document, rows });
      return;
    }
    const block = allBlocks.find((item) => item.id === id);
    if (block && target) commit(moveBlockTo(document, block, target));
  }

  async function importProject(file: File) {
    try { const parsed: unknown = JSON.parse(await file.text()); replace(parseDocument(parsed)); setSelectedBlockId(null); setPreview(false); notify('Progetto importato'); }
    catch (error) { notify(error instanceof Error ? error.message : 'File JSON non valido.', true); }
  }
  async function downloadPdf() {
    setExporting(true);
    try { await exportPdf(); notify('PDF esportato'); }
    catch (error) { notify(error instanceof Error ? `PDF: ${error.message}` : 'Esportazione PDF non riuscita.', true); }
    finally { setExporting(false); }
  }
  return <div className={`app-shell ${preview ? 'preview-mode' : ''}`} data-theme={theme}>
    <Toolbar theme={theme} onThemeChange={() => setTheme((current) => current === 'light' ? 'dark' : 'light')} blockCount={allBlocks.length} saveStatus={saveStatus} preview={preview} canUndo={canUndo} canRedo={canRedo} exporting={exporting} onPreviewChange={(value) => { setPreview(value); setSelectedBlockId(null); }} onUndo={undo} onRedo={redo} onExportProject={() => { downloadProject(document); notify('Progetto esportato'); }} onImportProject={importProject} onExportPdf={downloadPdf} onNewCV={(empty) => { replace(createStarterDocument(empty)); setSelectedBlockId(null); setPreview(false); notify('Nuovo CV creato'); }} />
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd} onDragCancel={() => { setDragId(null); setDropTarget(null); }}>
      <div className="editor-layout">
        {!preview && <BlocksSidebar onAdd={addBlock} />}
        <CVCanvas document={document} selectedBlockId={selectedBlockId} dragId={dragId} dropTarget={dropTarget} preview={preview} onSelectBlock={(id) => { setSelectedBlockId(id); if (id && !['text', 'heading'].includes(allBlocks.find((block) => block.id === id)?.type ?? '')) setPropertiesOpen(true); }} onEditText={updateInlineText} onOpenProperties={() => setPropertiesOpen(true)} onMoveBlock={moveBlock} onDuplicateBlock={duplicateBlock} onDeleteBlock={deleteBlock} onPreset={(id, widths) => commit(setRowPreset(document, id, widths))} onDuplicateRow={duplicateRow} onDeleteRow={deleteRow} onResize={(id, index, width) => commit(resizeColumns(document, id, index, width))} onMoveColumn={(rowId, columnId, direction) => { const row = document.rows.find((item) => item.id === rowId); const index = row?.columns.findIndex((column) => column.id === columnId) ?? -1; const neighbor = row?.columns[index + direction]; if (neighbor) commit(moveColumn(document, rowId, columnId, neighbor.id)); }} onPlaceSelectedBlock={(rowId, columnId) => { if (selectedBlock) commit(moveBlockTo(document, selectedBlock, { kind: 'column', rowId, columnId, index: 0 })); }} />
        {!preview && <PropertiesPanel selectedBlock={selectedBlock} globalStyle={document.globalStyle} open={propertiesOpen} onClose={() => setPropertiesOpen(false)} onDataChange={updateSelectedData} onStyleChange={updateSelectedStyle} onGlobalStyleChange={updateGlobalStyle} onDuplicate={() => { if (selectedBlockId) duplicateBlock(selectedBlockId); }} onDelete={() => { if (selectedBlockId) deleteBlock(selectedBlockId); }} />}
      </div>
      <DragOverlay>{activeBlock ? <div className="drag-overlay-block"><BlockPreview block={activeBlock} /></div> : dragId?.startsWith('column:') ? <div className="drag-overlay">Colonna · rilascia su un'altra colonna della riga</div> : dragId?.startsWith('row:') ? <div className="drag-overlay">⠿ Riga completa</div> : dragId?.startsWith('palette:') ? <div className="drag-overlay">{blockCatalog.find((item) => item.type === dragId.slice(8))?.label}</div> : null}</DragOverlay>
    </DndContext>
    {toast && <div className={`toast ${toast.error ? 'is-error' : ''}`} role="status">{toast.message}</div>}
  </div>;
}
