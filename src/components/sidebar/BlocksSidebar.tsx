import { useDraggable } from '@dnd-kit/core';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { blockCatalog, type BlockCatalogItem } from '../../models/blockCatalog';
import type { CVBlockType } from '../../models/cv';

function PaletteItem({ item, onAdd }: { item: BlockCatalogItem; onAdd: (type: CVBlockType) => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({ id: `palette:${item.type}`, data: { type: item.type, source: 'palette' } });
  return <div ref={setNodeRef} className={`block-catalog-item ${isDragging ? 'is-dragging' : ''}`}>
    <button ref={setActivatorNodeRef} type="button" className="palette-drag" title={`Trascina ${item.label} nel CV`} aria-label={`Sposta ${item.label} nel CV`} {...attributes} {...listeners}>
      <span className="block-icon" aria-hidden="true">{item.icon}</span>
      <span className="block-catalog-copy"><strong>{item.label}</strong><small>{item.description}</small></span>
      <span className="palette-grip" aria-hidden="true">⋮⋮</span>
    </button>
    <button type="button" className="palette-add-button" onClick={() => onAdd(item.type)} title={`Aggiungi ${item.label}`} aria-label={`Aggiungi ${item.label}`}>+</button>
  </div>;
}

export function BlocksSidebar({ onAdd, collapsed, onToggle }: { onAdd: (type: CVBlockType) => void; collapsed: boolean; onToggle: () => void }) {
  const primaryTypes = new Set<CVBlockType>(['personal', 'experience', 'education', 'skills', 'languages']);
  const primaryItems = blockCatalog.filter((item) => primaryTypes.has(item.type));
  const additionalItems = blockCatalog.filter((item) => !primaryTypes.has(item.type));
  return <aside className={`side-panel blocks-panel ${collapsed ? 'is-collapsed' : ''}`} aria-labelledby="blocks-title">
    <button type="button" className="panel-rail-button" onClick={onToggle} aria-label="Espandi libreria sezioni" aria-expanded={false} title="Espandi libreria sezioni"><ChevronRight size={18} /><span>Sezioni</span></button>
    <div className="panel-heading"><span className="eyebrow">Contenuto</span><h2 id="blocks-title">Aggiungi una sezione</h2><p>Premi + per aggiungere. Puoi anche trascinare e riordinare.</p><button type="button" className="panel-collapse-button" onClick={onToggle} aria-label="Comprimi libreria sezioni" aria-expanded={true} title="Comprimi libreria sezioni"><ChevronLeft size={17} /></button></div>
    <div className="panel-body"><div className="block-list">
      <h3 className="block-group-title">Sezioni principali</h3>
      {primaryItems.map((item) => <PaletteItem key={item.type} item={item} onAdd={onAdd} />)}
      <details className="other-sections"><summary>Altre sezioni <span>({additionalItems.length})</span></summary><div className="other-section-list">{additionalItems.map((item) => <PaletteItem key={item.type} item={item} onAdd={onAdd} />)}</div></details>
    </div></div>
  </aside>;
}
