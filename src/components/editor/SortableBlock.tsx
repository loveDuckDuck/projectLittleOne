import { useDraggable } from '@dnd-kit/core';
import { ArrowDown, ArrowUp, Copy, Hand, Trash2 } from 'lucide-react';
import type { CVBlock } from '../../models/cv';
import { BlockPreview } from './BlockPreview';
import { colorWithOpacity } from '../../utils/color';
import { backgroundImageStyle } from '../../utils/background';

interface Props { block: CVBlock; index: number; count: number; selected: boolean; preview: boolean; onSelect: () => void; onEditText: (value: string) => void; onMove: (direction: -1 | 1) => void; onDuplicate: () => void; onDelete: () => void }

export function SortableBlock({ block, index, count, selected, preview, onSelect, onEditText, onMove, onDuplicate, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({ id: block.id, disabled: preview });
  const hasBackground = Boolean(block.style.backgroundColor || block.style.backgroundImage);
  return <div ref={setNodeRef} data-block-id={block.id} className={`canvas-block ${selected && !preview ? 'is-selected' : ''} ${isDragging ? 'is-dragging' : ''}`} style={{ backgroundColor: block.style.backgroundColor ? colorWithOpacity(block.style.backgroundColor, block.style.backgroundOpacity) : undefined, padding: hasBackground ? 8 : undefined }} onClick={preview ? undefined : onSelect} onPointerDown={preview ? undefined : (event) => {
    if ((event.target as HTMLElement).closest('button, a, input, textarea, select, [contenteditable="true"]')) return;
    listeners?.onPointerDown?.(event);
  }} onKeyDown={preview ? undefined : (event) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter') { event.preventDefault(); onSelect(); }
    else listeners?.onKeyDown?.(event);
  }} {...(preview ? {} : attributes)} tabIndex={preview ? undefined : 0} role={preview ? undefined : 'button'} aria-label={preview ? undefined : `Blocco ${index + 1}: clicca per selezionare o trascina per spostare`}>
    {block.style.backgroundImage && <span className="block-background-image" aria-hidden="true" style={{ ...backgroundImageStyle(block.style.backgroundImage, block.style.backgroundMode), opacity: (block.style.backgroundOpacity ?? 100) / 100 }} />}
    <BlockPreview block={block} backgroundOnParent editable={!preview && (block.type === 'text' || block.type === 'heading')} onEditText={onEditText} />
    {!preview && <div className="block-controls" onClick={(event) => event.stopPropagation()}>
      <button ref={setActivatorNodeRef} type="button" className="block-drag-button" title="Trascina blocco" aria-label={`Trascina blocco ${index + 1}`} {...attributes} {...listeners}><Hand size={15} /></button>
      <button type="button" title="Sposta sopra" aria-label="Sposta blocco sopra" disabled={index === 0} onClick={() => onMove(-1)}><ArrowUp size={15} /></button>
      <button type="button" title="Sposta sotto" aria-label="Sposta blocco sotto" disabled={index === count - 1} onClick={() => onMove(1)}><ArrowDown size={15} /></button>
      <button type="button" title="Duplica" aria-label="Duplica blocco" onClick={onDuplicate}><Copy size={15} /></button>
      <button type="button" title="Elimina" aria-label="Elimina blocco" onClick={onDelete}><Trash2 size={15} /></button>
    </div>}
  </div>;
}
