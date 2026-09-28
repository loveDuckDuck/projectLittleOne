import { createBlock } from '../../models/createBlock';
import type { BlockHeaderStyle, BlockStyle, CVBlock } from '../../models/cv';
import { cvIcons, iconOptions } from '../../utils/icons';

const sectionTypes = new Set(['experience', 'education', 'skills', 'hobbies', 'languages', 'projects', 'certifications', 'custom']);

export function HeaderProperties({ block, onStyleChange }: { block: CVBlock; onStyleChange: (style: Partial<BlockStyle>) => void }) {
  if (!sectionTypes.has(block.type)) return null;
  const header = block.style.header;
  const update = (patch: Partial<BlockHeaderStyle>) => { if (header) onStyleChange({ header: { ...header, ...patch } }); };
  return <section className="property-section"><h3>Intestazione e icona</h3><p className="property-help">Per aggiungere un’icona, attiva “Mostra icona” e scegli un simbolo qui sotto. L’icona appare accanto al titolo della sezione.</p>
    {!header ? <button type="button" className="text-action" onClick={() => { const next = createBlock(block.type).style.header; onStyleChange({ header: next && block.type === 'custom' ? { ...next, title: block.data.title } : next }); }}>Aggiungi intestazione</button> : <>
      <label className="form-field"><span>Testo</span><input value={header.title} onChange={(event) => update({ title: event.target.value })} /></label>
      <label className="check-field"><input type="checkbox" checked={header.showIcon} onChange={(event) => update({ showIcon: event.target.checked })} />Mostra icona</label>
      {header.showIcon && <>
        <div className="icon-picker" role="group" aria-label="Scegli icona">
          {iconOptions.map((name) => { const Icon = cvIcons[name]; return <button key={name} type="button" className={header.icon === name ? 'is-active' : ''} title={name} aria-label={name} aria-pressed={header.icon === name} onClick={() => update({ icon: name })}><Icon size={17} /></button>; })}
        </div>
        <label className="form-field"><span>Posizione icona</span><select value={header.iconPosition} onChange={(event) => update({ iconPosition: event.target.value as BlockHeaderStyle['iconPosition'] })}><option value="left">Sinistra</option><option value="right">Destra</option></select></label>
        <label className="form-field"><span>Dimensione icona (px)</span><input type="number" min="10" max="32" value={header.iconSize} onChange={(event) => update({ iconSize: Math.max(10, Math.min(32, Number(event.target.value))) })} /></label>
        <label className="form-field"><span>Distanza icona (px)</span><input type="number" min="0" max="24" value={header.iconGap} onChange={(event) => update({ iconGap: Math.max(0, Math.min(24, Number(event.target.value))) })} /></label>
        <label className="check-field"><input type="checkbox" checked={Boolean(header.iconColor)} onChange={(event) => update({ iconColor: event.target.checked ? '#315d91' : undefined })} />Colore icona personalizzato</label>
        {header.iconColor && <label className="form-field color-field"><span>Colore icona</span><input type="color" value={header.iconColor} onChange={(event) => update({ iconColor: event.target.value })} /></label>}
      </>}
      <label className="form-field"><span>Dimensione titolo (pt)</span><input type="number" min="7" max="30" value={header.fontSize} onChange={(event) => update({ fontSize: Math.max(7, Math.min(30, Number(event.target.value))) })} /></label>
      <label className="form-field"><span>Peso</span><select value={header.fontWeight} onChange={(event) => update({ fontWeight: Number(event.target.value) as BlockHeaderStyle['fontWeight'] })}><option value={400}>Normale</option><option value={500}>Medio</option><option value={600}>Semibold</option><option value={700}>Grassetto</option></select></label>
      <label className="form-field"><span>Maiuscole/minuscole</span><select value={header.textTransform} onChange={(event) => update({ textTransform: event.target.value as BlockHeaderStyle['textTransform'] })}><option value="none">Normale</option><option value="uppercase">Maiuscolo</option><option value="lowercase">Minuscolo</option></select></label>
      <label className="form-field"><span>Allineamento</span><select value={header.textAlign} onChange={(event) => update({ textAlign: event.target.value as BlockHeaderStyle['textAlign'] })}><option value="left">Sinistra</option><option value="center">Centro</option><option value="right">Destra</option></select></label>
      <label className="check-field"><input type="checkbox" checked={Boolean(header.color)} onChange={(event) => update({ color: event.target.checked ? '#315d91' : undefined })} />Colore titolo personalizzato</label>
      {header.color && <label className="form-field color-field"><span>Colore titolo</span><input type="color" value={header.color} onChange={(event) => update({ color: event.target.value })} /></label>}
      <label className="check-field"><input type="checkbox" checked={Boolean(header.backgroundColor)} onChange={(event) => update({ backgroundColor: event.target.checked ? '#f0f4f8' : undefined })} />Sfondo titolo</label>
      {header.backgroundColor && <label className="form-field color-field"><span>Colore sfondo</span><input type="color" value={header.backgroundColor} onChange={(event) => update({ backgroundColor: event.target.value })} /></label>}
      <label className="check-field"><input type="checkbox" checked={header.bottomBorder} onChange={(event) => update({ bottomBorder: event.target.checked })} />Bordo inferiore</label>
      <label className="check-field"><input type="checkbox" checked={header.dividerLine} onChange={(event) => update({ dividerLine: event.target.checked })} />Linea divisoria</label>
      <label className="form-field"><span>Spazio sopra (px)</span><input type="number" min="0" max="80" value={header.spacingAbove} onChange={(event) => update({ spacingAbove: Math.max(0, Math.min(80, Number(event.target.value))) })} /></label>
      <label className="form-field"><span>Spazio sotto (px)</span><input type="number" min="0" max="80" value={header.spacingBelow} onChange={(event) => update({ spacingBelow: Math.max(0, Math.min(80, Number(event.target.value))) })} /></label>
      <button type="button" className="text-action" onClick={() => onStyleChange({ header: undefined })}>Rimuovi intestazione</button>
    </>}
  </section>;
}
