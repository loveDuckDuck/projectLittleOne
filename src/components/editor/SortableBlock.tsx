import { useDraggable } from '@dnd-kit/core';
import { ArrowDown, ArrowUp, Copy, Hand, Trash2 } from 'lucide-react';
import type { CVBlock } from '../../models/cv';
import type { DropTarget } from '../../utils/layout';
import { BlockPreview } from './BlockPreview';
import { colorWithOpacity } from '../../utils/color';
import { backgroundImageStyle } from '../../utils/background';

interface Props { block: CVBlock; index: number; count: number; selected: boolean; preview: boolean; onSelect: (field?: string) => void; destinations: { label: string; target: DropTarget }[]; onMoveTo: (target: DropTarget) => void; onEditText: (value: string) => void; onMove: (direction: -1 | 1) => void; onDuplicate: () => void; onDelete: () => void }

export function SortableBlock({ block, index, count, selected, preview, onSelect, onEditText, onMove, onDuplicate, onDelete, destinations, onMoveTo }: Props) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({ id: block.id, disabled: preview });
  const hasBackground = Boolean(block.style.backgroundColor || block.style.backgroundImage);
  return <div ref={setNodeRef} data-block-id={block.id} className={`canvas-block ${selected && !preview ? 'is-selected' : ''} ${isDragging ? 'is-dragging' : ''}`} style={{ backgroundColor: block.style.backgroundColor ? colorWithOpacity(block.style.backgroundColor, block.style.backgroundOpacity) : undefined, padding: hasBackground ? 8 : undefined }} onClick={preview ? undefined : (event) => { if ((event.target as HTMLElement).closest('a')) event.preventDefault(); onSelect((event.target as HTMLElement).closest<HTMLElement>('[data-edit-field]')?.dataset.editField); }} onPointerDown={preview ? undefined : (event) => {
    if ((event.target as HTMLElement).closest('button, a, input, textarea, select, [contenteditable="true"]')) return;
    listeners?.onPointerDown?.(event);
  }} onKeyDown={preview ? undefined : (event) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter') { event.preventDefault(); onSelect(); }
    else listeners?.onKeyDown?.(event);
  }} {...(preview ? {} : attributes)} tabIndex={preview ? undefined : 0} role={preview ? undefined : 'button'} aria-label={preview ? undefined : `Sezione ${index + 1}: seleziona per modificare`}>
    {block.style.backgroundImage && <span className="block-background-image" aria-hidden="true" style={{ ...backgroundImageStyle(block.style.backgroundImage, block.style.backgroundMode), opacity: (block.style.backgroundOpacity ?? 100) / 100 }} />}
    <BlockPreview block={block} backgroundOnParent editable={false} onEditText={onEditText} />
    {!preview && <div className="block-controls" onClick={(event) => event.stopPropagation()}>
      <button ref={setActivatorNodeRef} type="button" className="block-drag-button" title="Trascina per spostare" aria-label={`Sposta sezione ${index + 1}`} {...attributes} {...listeners}><Hand size={15} /></button>
      <button type="button" title="Sposta sopra" aria-label="Sposta sezione sopra" disabled={index === 0} onClick={() => onMove(-1)}><ArrowUp size={15} /></button>
      <button type="button" title="Sposta sotto" aria-label="Sposta sezione sotto" disabled={index === count - 1} onClick={() => onMove(1)}><ArrowDown size={15} /></button>
      <select aria-label="Sposta sezione in" value="" onChange={(event) => { const destination = destinations[Number(event.target.value)]; if (destination) onMoveTo(destination.target); }}><option value="" disabled>Sposta in…</option>{destinations.map((destination, i) => <option key={i} value={i}>{destination.label}</option>)}</select>
      <button type="button" onClick={() => onSelect()} className="block-edit-button">Modifica</button>
      <button type="button" title="Duplica" aria-label="Duplica sezione" onClick={onDuplicate}><Copy size={15} /></button>
      <button type="button" title="Elimina" aria-label="Elimina sezione" onClick={onDelete}><Trash2 size={15} /></button>
    </div>}
  </div>;
}
