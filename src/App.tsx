import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, closestCenter, defaultKeyboardCoordinateGetter, useSensor, useSensors, type DragEndEvent, type DragMoveEvent, type DragStartEvent } from '@dnd-kit/core';
import { CVCanvas } from './components/editor/CVCanvas';
import { BlockPreview } from './components/editor/BlockPreview';
import { PanelResizeHandle } from './components/editor/PanelResizeHandle';
import { NewCVDialog } from './components/editor/NewCVDialog';
import { ProjectsDialog } from './components/editor/ProjectsDialog';
import { createTemplate, type TemplateId } from './models/templates';
import { Toolbar } from './components/editor/Toolbar';
import { PropertiesPanel } from './components/properties/PropertiesPanel';
import { BlocksSidebar } from './components/sidebar/BlocksSidebar';
import { blockCatalog } from './models/blockCatalog';
import { createBlock, createStarterDocument } from './models/createBlock';
import { createRandomDocument, type RandomCVOptions } from './models/randomDocument';
import type { BlockStyle, CVBlock, CVBlockType, GlobalCVStyle } from './models/cv';
import { useCVDocument } from './hooks/useCVDocument';
import { usePanelLayout } from './hooks/usePanelLayout';
import { useTheme } from './hooks/useTheme';
import { blocksOf, locateBlock, mapBlock, moveBlockTo, moveColumn, placeBlock, removeBlock, resizeColumns, setRowPreset, type DropTarget } from './utils/layout';
import { downloadProject, parseDocument } from './utils/documentStorage';
import { exportPdf } from './utils/exportPdf';
import { CUSTOM_FONT_FAMILY } from './utils/assets';

interface Toast { id: number; message: string; error?: boolean; action?: () => void }
interface DragGeometry {
  page: { left: number; top: number; right: number; bottom: number };
  rows: { id: string; top: number; bottom: number; columns: { id: string; left: number; right: number; top: number; bottom: number; blocks: { id: string; left: number; right: number; top: number; bottom: number }[] }[] }[];
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { document, canUndo, canRedo, saveStatus, commit, undo, redo, projectId, projects, newProject, openProject: loadProject } = useCVDocument();
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const documentRef = useRef(document);
  documentRef.current = document;
  const [showNewDialog, setShowNewDialog] = useState(projects.length === 0);
  const [showProjects, setShowProjects] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [editRequest, setEditRequest] = useState<{ field?: string; token: number }>({ token: 0 });
  const [guideStep, setGuideStep] = useState<'data' | 'experience' | 'review'>('data');
  const [preview, setPreview] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const { layout: panelLayout, togglePanel, setPanelWidth } = usePanelLayout();
  const lastSaveStatus = useRef(saveStatus);
  const dragGeometry = useRef<DragGeometry | null>(null);
  const editorLayoutRef = useRef<HTMLDivElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: defaultKeyboardCoordinateGetter }));
  const allBlocks = blocksOf(document);
  const selectedBlock = allBlocks.find((block) => block.id === selectedBlockId) ?? null;
  const activeBlock = allBlocks.find((block) => block.id === dragId);

  function notify(message: string, error = false, action?: () => void) { setToast({ id: Date.now(), message, error, action }); }
  useEffect(() => {
    if (saveStatus === 'error' && lastSaveStatus.current !== 'error') notify('Salvataggio locale non riuscito', true);
    lastSaveStatus.current = saveStatus;
  }, [saveStatus, canUndo]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast((current) => current?.id === toast.id ? null : current), toast.action ? 10000 : 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (event.key === 'Escape' && preview) {
        event.preventDefault();
        setPreview(false);
        setSelectedBlockId(null);
        return;
      }
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (allBlocks.length > 0 && event.altKey && !event.ctrlKey && !event.metaKey && (event.code === 'KeyP' || event.key.toLowerCase() === 'p')) {
        event.preventDefault();
        setPreview((current) => !current);
        setSelectedBlockId(null);
        return;
      }
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z') return;
      event.preventDefault();
      if (event.shiftKey) redo(); else undo();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo, preview, allBlocks.length]);

  function addBlock(type: CVBlockType, target?: DropTarget | null) {
    const block = createBlock(type);
    const selected = selectedBlockId && locateBlock(document, selectedBlockId);
    const destination = target === undefined && selected ? { kind: 'column' as const, rowId: selected.row.id, columnId: selected.column.id, index: selected.index + 1 } : target ?? null;
    commit(placeBlock(document, block, destination));
    setSelectedBlockId(block.id);
    setPropertiesOpen(true);
    if (panelLayout.propertiesCollapsed) togglePanel('properties');
    setLibraryOpen(false);
    setEditRequest({ token: Date.now() });
    notify('Sezione aggiunta');
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
    const found = locateBlock(document, id);
    if (!found) return;
    const removed = found.column.blocks[found.index];
    const next = removeBlock(document, id);
    commit(next);
    if (selectedBlockId === id) setSelectedBlockId(null);
    notify('Sezione eliminata', false, () => {
      if (documentRef.current === next) undo();
      else if (!locateBlock(documentRef.current, id)) {
        const exists = documentRef.current.rows.some((row) => row.id === found.row.id && row.columns.some((column) => column.id === found.column.id));
        commit(placeBlock(documentRef.current, removed, exists ? { kind: 'column', rowId: found.row.id, columnId: found.column.id, index: found.index } : null));
      }
    });
  }
  function duplicateRow(id: string) {
    const index = document.rows.findIndex((row) => row.id === id);
    if (index < 0) return;
    const copy = structuredClone(document.rows[index]);
    copy.id = crypto.randomUUID();
    copy.columns.forEach((column) => { column.id = crypto.randomUUID(); column.blocks.forEach((block) => { block.id = crypto.randomUUID(); }); });
    const rows = [...document.rows]; rows.splice(index + 1, 0, copy); commit({ ...document, rows });
  }
  function deleteRow(id: string) {
    const row = document.rows.find((item) => item.id === id);
    if (!row) return;
    const index = document.rows.indexOf(row);
    const next = { ...document, rows: document.rows.filter((item) => item.id !== id) };
    commit(next); setSelectedBlockId(null);
    notify('Riga eliminata', false, () => {
      if (documentRef.current === next) undo();
      else if (!documentRef.current.rows.some((item) => item.id === id)) {
        const rows = [...documentRef.current.rows]; rows.splice(index, 0, row); commit({ ...documentRef.current, rows });
      }
    });
  }
  function updateSelectedData(data: CVBlock['data']) {
    if (!selectedBlockId) return;
    commit(mapBlock(document, selectedBlockId, (block) => {
      if (block.type === 'personal' && 'contactsLayout' in data && (block.data.contactsLayout !== data.contactsLayout || block.data.contactsColumns !== data.contactsColumns)) {
        return { ...block, data, style: { ...block.style, contactLayout: undefined } } as CVBlock;
      }
      return { ...block, data } as CVBlock;
    }));
  }
  function updateInlineText(id: string, value: string) {
    const current = allBlocks.find((block) => block.id === id);
    if (!current || (current.type !== 'text' && current.type !== 'heading') || current.data.text === value) return;
    commit(mapBlock(document, id, (block) => block.type === 'text' || block.type === 'heading' ? { ...block, data: { ...block.data, text: value } } as CVBlock : block));
  }
  function updateSelectedStyle(style: Partial<BlockStyle>) { if (selectedBlockId) commit(mapBlock(document, selectedBlockId, (block) => ({ ...block, style: { ...block.style, ...style } }))); }
  function updateGlobalStyle(style: Partial<GlobalCVStyle>) { commit({ ...document, globalStyle: { ...document.globalStyle, ...style } }); }
  function loadFontForSelectedBlock(font: { name: string; dataUrl: string }) {
    if (!selectedBlockId) return;
    commit({ ...document, globalStyle: { ...document.globalStyle, customFont: font }, rows: document.rows.map((row) => ({ ...row, columns: row.columns.map((column) => ({ ...column, blocks: column.blocks.map((block) => block.id === selectedBlockId ? { ...block, style: { ...block.style, fontFamily: CUSTOM_FONT_FAMILY } } as CVBlock : block) })) })) });
  }
  function removeCustomFont() {
    commit({ ...document, globalStyle: { ...document.globalStyle, customFont: undefined, fontFamily: document.globalStyle.fontFamily === CUSTOM_FONT_FAMILY ? 'Arial' : document.globalStyle.fontFamily }, rows: document.rows.map((row) => ({ ...row, columns: row.columns.map((column) => ({ ...column, blocks: column.blocks.map((block) => block.style.fontFamily === CUSTOM_FONT_FAMILY ? { ...block, style: { ...block.style, fontFamily: undefined } } : block) })) })) });
  }

  function targetAt(event: DragMoveEvent | DragEndEvent): DropTarget | null {
    const page = globalThis.document.getElementById('cv-print-area');
    if (!page || !(event.activatorEvent instanceof MouseEvent)) return null;
    const geometry = dragGeometry.current;
    if (!geometry) return null;
    const pageRect = page.getBoundingClientRect();
    const x = event.activatorEvent.clientX + event.delta.x - (pageRect.left - geometry.page.left);
    const y = event.activatorEvent.clientY + event.delta.y - (pageRect.top - geometry.page.top);
    if (x < geometry.page.left || x > geometry.page.right || y < geometry.page.top || y > geometry.page.bottom) return null;
    const rows = geometry.rows;
    if (!rows.length) return null;
    const activeId = String(event.active.id);
    if (activeId.startsWith('column:')) {
      const [, sourceRowId, sourceColumnId] = activeId.split(':');
      const sourceRow = rows.find((item) => item.id === sourceRowId);
      if (!sourceRow) return null;
      if (y < sourceRow.top - 24 || y > sourceRow.bottom + 12) return null;
      const column = sourceRow.columns.find((item) => x < item.right) ?? sourceRow.columns[sourceRow.columns.length - 1];
      if (!column || column.id === sourceColumnId) return null;
      return { kind: 'column', rowId: sourceRowId, columnId: column.id, index: 0 };
    }
    const row = rows.reduce((closest, item) => {
      const distance = y < item.top ? item.top - y : y > item.bottom ? y - item.bottom : 0;
      const closestDistance = y < closest.top ? closest.top - y : y > closest.bottom ? y - closest.bottom : 0;
      return distance < closestDistance ? item : closest;
    });
    const rowId = row.id;
    if (activeId.startsWith('row:')) return { kind: 'row', rowId, side: y < (row.top + row.bottom) / 2 ? 'above' : 'below' };
    const column = row.columns.find((item) => x < item.right) ?? row.columns[row.columns.length - 1];
    if (!column) return { kind: 'row', rowId, side: 'below' };
    const blockIndex = column.blocks.findIndex((block) => x >= block.left && x <= block.right && y >= block.top && y <= block.bottom);
    if (blockIndex >= 0) {
      const block = column.blocks[blockIndex];
      const source = locateBlock(document, activeId);
      const movingAcrossColumns = source && row.columns.length > 1 && source.column.id !== column.id;
      const edgeZone = Math.min(34, (block.right - block.left) * .16);
      if (block.id !== activeId && row.columns.length < 3 && !movingAcrossColumns) {
        if (x - block.left <= edgeZone) return { kind: 'side', rowId, columnId: column.id, side: 'left' };
        if (block.right - x <= edgeZone) return { kind: 'side', rowId, columnId: column.id, side: 'right' };
      }
      return { kind: 'column', rowId, columnId: column.id, index: blockIndex + (y >= (block.top + block.bottom) / 2 ? 1 : 0) };
    }
    if (column.blocks.length === 0 && x >= column.left && x <= column.right && y >= column.top && y <= column.bottom) {
      return { kind: 'column', rowId, columnId: column.id, index: 0 };
    }
    return { kind: 'row', rowId, side: y < (row.top + row.bottom) / 2 ? 'above' : 'below' };
  }
  function onDragStart(event: DragStartEvent) {
    const page = globalThis.document.getElementById('cv-print-area');
    const pageRect = page?.getBoundingClientRect();
    dragGeometry.current = page && pageRect ? {
      page: { left: pageRect.left, top: pageRect.top, right: pageRect.right, bottom: pageRect.bottom },
      rows: Array.from(page.querySelectorAll<HTMLElement>('.cv-row')).map((row) => {
        const rect = row.getBoundingClientRect();
        return { id: row.dataset.rowId!, top: rect.top, bottom: rect.bottom, columns: Array.from(row.querySelectorAll<HTMLElement>('.cv-column')).map((column) => {
          const bounds = column.getBoundingClientRect();
          return { id: column.dataset.columnId!, left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom, blocks: Array.from(column.querySelectorAll<HTMLElement>('.canvas-block')).map((block) => { const blockRect = block.getBoundingClientRect(); return { id: block.dataset.blockId!, left: blockRect.left, right: blockRect.right, top: blockRect.top, bottom: blockRect.bottom }; }) };
        }) };
      }),
    } : null;
    setDragId(String(event.active.id)); setDropTarget(null);
  }
  function onDragMove(event: DragMoveEvent) { setDropTarget(targetAt(event)); }
  function onDragEnd(event: DragEndEvent) {
    const id = String(event.active.id);
    const target = event.activatorEvent instanceof MouseEvent ? targetAt(event) : dropTarget;
    dragGeometry.current = null;
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

  function generateRandomCV(options: RandomCVOptions): boolean {
    try {
      newProject({ ...createRandomDocument(options), name: 'CV fittizio' });
      setSelectedBlockId(null);
      setPropertiesOpen(false);
      setPreview(false);
      notify('CV fittizio creato · Il precedente è in I miei CV');
      return true;
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Generazione del CV non riuscita.', true);
      return false;
    }
  }

  async function importProject(file: File) {
    try { const parsed: unknown = JSON.parse(await file.text()); newProject(parseDocument(parsed)); setSelectedBlockId(null); setPreview(false); notify('Progetto importato'); }
    catch (error) { notify(error instanceof Error ? error.message : 'File JSON non valido.', true); }
  }
  function openProject() { importFileRef.current?.click(); }
  async function downloadPdf() {
    setExporting(true);
    try { await exportPdf(document.name); notify('PDF esportato'); }
    catch (error) { notify(error instanceof Error ? `PDF: ${error.message}` : 'Esportazione PDF non riuscita.', true); }
    finally { setExporting(false); }
  }
  function selectBlock(id: string | null, field?: string) {
    setSelectedBlockId(id);
    if (!id) return;
    setPropertiesOpen(true);
    if (panelLayout.propertiesCollapsed) togglePanel('properties');
    setEditRequest({ field, token: Date.now() });
    const block = allBlocks.find((item) => item.id === id);
    if (block?.type === 'personal') setGuideStep('data');
    else setGuideStep('experience');
  }
  function createProject(template: TemplateId | 'empty') {
    try {
      newProject(template === 'empty' ? { ...createStarterDocument(true), name: 'Nuovo CV' } : createTemplate(template));
      setShowNewDialog(false); setSelectedBlockId(null); setPropertiesOpen(false); setPreview(false); setGuideStep('data'); setToast(null);
    } catch { notify('Impossibile creare il progetto. Scarica una copia modificabile e libera spazio nel browser.', true); }
  }
  function openSavedProject(id: string): boolean {
    try { loadProject(id); setSelectedBlockId(null); setPropertiesOpen(false); setPreview(false); setToast(null); return true; }
    catch (error) { notify(error instanceof Error ? error.message : 'Impossibile aprire il progetto.', true); return false; }
  }
  function goToStep(step: 'data' | 'experience' | 'review') {
    setGuideStep(step);
    setPreview(step === 'review');
    if (step === 'review') { setSelectedBlockId(null); return; }
    const type = step === 'data' ? 'personal' : 'experience';
    const block = allBlocks.find((item) => item.type === type);
    if (block) selectBlock(block.id); else addBlock(type);
  }
  return <div className={`app-shell ${preview ? 'preview-mode' : ''}`}>
    <Toolbar onGlobalStyle={() => { setSelectedBlockId(null); setPropertiesOpen(true); if (panelLayout.propertiesCollapsed) togglePanel('properties'); }} theme={theme} onThemeChange={toggleTheme} onRandomCV={generateRandomCV} blockCount={allBlocks.length} saveStatus={saveStatus} preview={preview} canUndo={canUndo} canRedo={canRedo} exporting={exporting} onPreviewChange={(value) => { setPreview(value); setSelectedBlockId(null); }} onUndo={undo} onRedo={redo} onExportProject={() => { downloadProject(document); notify('Progetto scaricato'); }} onImportClick={openProject} onExportPdf={downloadPdf} documentName={document.name || 'Il mio CV'} onRename={(name) => commit({ ...document, name })} onProjects={() => setShowProjects(true)} onNewCV={() => setShowNewDialog(true)} />
    {showNewDialog && <NewCVDialog onCreate={createProject} onClose={() => setShowNewDialog(false)} />}
    {showProjects && <ProjectsDialog projects={projects} activeId={projectId} onOpen={openSavedProject} onClose={() => setShowProjects(false)} />}
    {!preview && <button type="button" className="mobile-add-section" onClick={() => setLibraryOpen(true)}>+ Aggiungi sezione</button>}
    {libraryOpen && <button type="button" className="library-backdrop" aria-label="Chiudi libreria sezioni" onClick={() => setLibraryOpen(false)} />}
    <input ref={importFileRef} className="visually-hidden" type="file" accept=".json,application/json" aria-label="Apri progetto JSON" tabIndex={-1} onChange={(event) => { const file = event.target.files?.[0]; if (file) void importProject(file); event.target.value = ''; }} />
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd} onDragCancel={() => { dragGeometry.current = null; setDragId(null); setDropTarget(null); }}>
      <div ref={editorLayoutRef} className="editor-layout" style={{ '--blocks-panel-width': `${panelLayout.blocksCollapsed ? 48 : panelLayout.blocksWidth}px`, '--properties-panel-width': `${panelLayout.propertiesCollapsed ? 48 : panelLayout.propertiesWidth}px` } as CSSProperties}>
        {!preview && <BlocksSidebar open={libraryOpen} onClose={() => setLibraryOpen(false)} onAdd={addBlock} collapsed={panelLayout.blocksCollapsed} onToggle={() => togglePanel('blocks')} />}
        {!preview && <PanelResizeHandle side="blocks" width={panelLayout.blocksWidth} disabled={panelLayout.blocksCollapsed} layoutRef={editorLayoutRef} onResize={(width) => setPanelWidth('blocks', width)} />}
        <CVCanvas projectId={projectId} document={document} selectedBlockId={selectedBlockId} dragId={dragId} dropTarget={dropTarget} preview={preview} onSelectBlock={selectBlock} onEditText={updateInlineText} onOpenProperties={() => { setPropertiesOpen(true); if (panelLayout.propertiesCollapsed) togglePanel('properties'); }} guideStep={guideStep} onGuideStep={goToStep} onStartExample={() => setShowNewDialog(true)} onStartEmpty={() => createProject('empty')} onImportProject={openProject} onAddBlock={addBlock} onMoveBlock={moveBlock} onMoveBlockTo={(id, target) => { const block = allBlocks.find((item) => item.id === id); if (block) commit(moveBlockTo(document, block, target)); }} onDuplicateBlock={duplicateBlock} onDeleteBlock={deleteBlock} onPreset={(id, widths) => commit(setRowPreset(document, id, widths))} onDuplicateRow={duplicateRow} onDeleteRow={deleteRow} onResize={(id, index, width) => commit(resizeColumns(document, id, index, width))} onMoveColumn={(rowId, columnId, direction) => { const row = document.rows.find((item) => item.id === rowId); const index = row?.columns.findIndex((column) => column.id === columnId) ?? -1; const neighbor = row?.columns[index + direction]; if (neighbor) commit(moveColumn(document, rowId, columnId, neighbor.id)); }} onPlaceSelectedBlock={(rowId, columnId) => { if (selectedBlock) commit(moveBlockTo(document, selectedBlock, { kind: 'column', rowId, columnId, index: 0 })); }} />
        {!preview && <PanelResizeHandle side="properties" width={panelLayout.propertiesWidth} disabled={panelLayout.propertiesCollapsed} layoutRef={editorLayoutRef} onResize={(width) => setPanelWidth('properties', width)} />}
        {!preview && <PropertiesPanel editRequest={editRequest} selectedBlock={selectedBlock} globalStyle={document.globalStyle} open={propertiesOpen} onClose={() => setPropertiesOpen(false)} collapsed={panelLayout.propertiesCollapsed} onToggle={() => togglePanel('properties')} onDataChange={updateSelectedData} onStyleChange={updateSelectedStyle} onGlobalStyleChange={updateGlobalStyle} onLoadFontForBlock={loadFontForSelectedBlock} onRemoveFont={removeCustomFont} onDuplicate={() => { if (selectedBlockId) duplicateBlock(selectedBlockId); }} onDelete={() => { if (selectedBlockId) deleteBlock(selectedBlockId); }} />}
      </div>
      <DragOverlay>{activeBlock ? <div className="drag-overlay-block"><BlockPreview block={activeBlock} /></div> : dragId?.startsWith('column:') ? <div className="drag-overlay">Colonna · rilascia su un'altra colonna della riga</div> : dragId?.startsWith('row:') ? <div className="drag-overlay">⠿ Riga completa</div> : dragId?.startsWith('palette:') ? <div className="drag-overlay">{blockCatalog.find((item) => item.type === dragId.slice(8))?.label}</div> : null}</DragOverlay>
    </DndContext>
    {toast && <div className={`toast ${toast.error ? 'is-error' : ''}`} role="status"><span>{toast.message}</span>{toast.action && <button type="button" onClick={() => { toast.action?.(); setToast(null); }}>Annulla</button>}</div>}
  </div>;
}
