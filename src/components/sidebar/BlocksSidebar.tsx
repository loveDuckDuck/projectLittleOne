import { useDraggable } from '@dnd-kit/core';
import { useState } from 'react';
import { blockCatalog, type BlockCatalogItem } from '../../models/blockCatalog';
import type { CVBlockType } from '../../models/cv';

function PaletteItem({ item, onAdd }: { item: BlockCatalogItem; onAdd: (type: CVBlockType) => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({ id: `palette:${item.type}`, data: { type: item.type, source: 'palette' } });
  return <div ref={setNodeRef} className={`block-catalog-item ${isDragging ? 'is-dragging' : ''}`}>
    <button ref={setActivatorNodeRef} type="button" className="palette-drag" title={`Trascina ${item.label} nel CV`} aria-label={`Trascina ${item.label} nel CV`} {...attributes} {...listeners}>
      <span className="block-icon" aria-hidden="true">{item.icon}</span>
      <span className="block-catalog-copy"><strong>{item.label}</strong><small>{item.description}</small></span>
      <span className="palette-grip" aria-hidden="true">⋮⋮</span>
    </button>
    <button type="button" className="palette-add-button" onClick={() => onAdd(item.type)} title={`Aggiungi ${item.label} sotto il blocco selezionato`} aria-label={`Aggiungi ${item.label} sotto il blocco selezionato`}>+</button>
  </div>;
}

export function BlocksSidebar({ onAdd }: { onAdd: (type: CVBlockType) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  return <aside className="side-panel blocks-panel" aria-labelledby="blocks-title">
    <div className="panel-heading"><span className="eyebrow">Libreria</span><h2 id="blocks-title">Blocchi</h2><p>Trascina un blocco nel CV oppure premi + per aggiungerlo sotto quello selezionato.</p><button type="button" className="panel-toggle" onClick={() => setCollapsed(!collapsed)} aria-expanded={!collapsed}>{collapsed ? 'Mostra blocchi' : 'Nascondi blocchi'}</button></div>
    <div className={`panel-body ${collapsed ? 'is-collapsed' : ''}`}><div className="block-list">{blockCatalog.map((item) => <PaletteItem key={item.type} item={item} onAdd={onAdd} />)}</div></div>
  </aside>;
}
