import { useEffect, useRef } from 'react';
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

export function BlocksSidebar({ onAdd, collapsed, onToggle, open, onClose }: { open: boolean; onClose: () => void; onAdd: (type: CVBlockType) => void; collapsed: boolean; onToggle: () => void }) {
  const panel = useRef<HTMLElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open || !window.matchMedia('(max-width: 900px)').matches) return;
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLButtonElement>('.library-close')?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close.current(); return; }
      if (event.key !== 'Tab') return;
      const controls = Array.from(panel.current?.querySelectorAll<HTMLElement>('button, summary') ?? []).filter((element) => element.getClientRects().length > 0);
      const first = controls[0]; const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); previous?.focus({ preventScroll: true }); };
  }, [open]);
  const primaryTypes = new Set<CVBlockType>(['personal', 'experience', 'education', 'skills', 'languages']);
  const primaryItems = blockCatalog.filter((item) => primaryTypes.has(item.type));
  const additionalItems = blockCatalog.filter((item) => !primaryTypes.has(item.type));
  return <aside ref={panel} className={`side-panel blocks-panel ${collapsed ? 'is-collapsed' : ''} ${open ? 'is-library-open' : ''}`} aria-labelledby="blocks-title">
    <button type="button" className="panel-rail-button" onClick={onToggle} aria-label="Espandi libreria sezioni" aria-expanded={false} title="Espandi libreria sezioni"><ChevronRight size={18} /><span>Sezioni</span></button>
    <div className="panel-heading"><button type="button" className="library-close" aria-label="Chiudi libreria" onClick={onClose}>×</button><span className="eyebrow">Contenuto</span><h2 id="blocks-title">Aggiungi una sezione</h2><p>Premi + per aggiungere. Puoi anche trascinare e riordinare.</p><button type="button" className="panel-collapse-button" onClick={onToggle} aria-label="Comprimi libreria sezioni" aria-expanded={true} title="Comprimi libreria sezioni"><ChevronLeft size={17} /></button></div>
    <div className="panel-body"><div className="block-list">
      <h3 className="block-group-title">Sezioni principali</h3>
      {primaryItems.map((item) => <PaletteItem key={item.type} item={item} onAdd={onAdd} />)}
      <details className="other-sections"><summary>Altre sezioni <span>({additionalItems.length})</span></summary><div className="other-section-list">{additionalItems.map((item) => <PaletteItem key={item.type} item={item} onAdd={onAdd} />)}</div></details>
    </div></div>
  </aside>;
}
