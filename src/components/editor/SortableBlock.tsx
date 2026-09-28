import { useDraggable } from '@dnd-kit/core';
import type { CVBlock } from '../../models/cv';
import { BlockPreview } from './BlockPreview';

interface Props { block: CVBlock; index: number; count: number; selected: boolean; preview: boolean; onSelect: () => void; onEditText: (value: string) => void; onMove: (direction: -1 | 1) => void; onDuplicate: () => void; onDelete: () => void }

export function SortableBlock({ block, index, count, selected, preview, onSelect, onEditText, onMove, onDuplicate, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({ id: block.id, disabled: preview });
  return <div ref={setNodeRef} data-block-id={block.id} className={`canvas-block ${selected && !preview ? 'is-selected' : ''} ${isDragging ? 'is-dragging' : ''}`} onClick={preview ? undefined : onSelect} onKeyDown={preview ? undefined : (event) => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onSelect(); } }} tabIndex={preview ? undefined : 0} role={preview ? undefined : 'group'} aria-label={preview ? undefined : `Seleziona blocco ${index + 1}`}>
    {!preview && <div className="block-controls" onClick={(event) => event.stopPropagation()}>
      <button ref={setActivatorNodeRef} type="button" className="drag-handle" title="Trascina blocco" aria-label={`Trascina blocco ${index + 1}`} {...attributes} {...listeners}>⋮⋮</button>
      <button type="button" title="Sposta sopra" disabled={index === 0} onClick={() => onMove(-1)}>↑</button>
      <button type="button" title="Sposta sotto" disabled={index === count - 1} onClick={() => onMove(1)}>↓</button>
      <button type="button" title="Duplica" onClick={onDuplicate}>⧉</button>
      <button type="button" title="Elimina" onClick={onDelete}>×</button>
    </div>}
    <BlockPreview block={block} editable={!preview && (block.type === 'text' || block.type === 'heading')} onEditText={onEditText} />
  </div>;
}
