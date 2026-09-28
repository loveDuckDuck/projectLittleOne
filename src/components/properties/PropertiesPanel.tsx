import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { blockCatalog } from '../../models/blockCatalog';
import type { BlockStyle, CVBlock, GlobalCVStyle } from '../../models/cv';
import { BlockFields } from './BlockFields';
import { HeaderProperties } from './HeaderProperties';
import { CUSTOM_FONT_FAMILY, readFont, STANDARD_FONTS } from '../../utils/assets';
import { BackgroundImageFields } from './BackgroundImageFields';

interface PropertiesPanelProps {
  selectedBlock: CVBlock | null;
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggle: () => void;
  globalStyle: GlobalCVStyle;
  onDataChange: (data: CVBlock['data']) => void;
  onStyleChange: (style: Partial<BlockStyle>) => void;
  onGlobalStyleChange: (style: Partial<GlobalCVStyle>) => void;
  onLoadFontForBlock: (font: { name: string; dataUrl: string }) => void;
  onRemoveFont: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function Numeric({ label, value, onChange, min, max, step = 1 }: { label: string; value: number; onChange: (value: number) => void; min: number; max: number; step?: number }) {
  return <label className="form-field"><span>{label}</span><input type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function Color({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="form-field color-field"><span>{label}</span><input type="color" value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

export function PropertiesPanel({ selectedBlock, open, onClose, collapsed, onToggle, globalStyle, onDataChange, onStyleChange, onGlobalStyleChange, onLoadFontForBlock, onRemoveFont, onDuplicate, onDelete }: PropertiesPanelProps) {
  const [fontError, setFontError] = useState('');
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => { panelRef.current?.scrollTo({ top: 0 }); }, [selectedBlock?.id]);
  const name = blockCatalog.find((item) => item.type === selectedBlock?.type)?.label;
  return (
    <aside ref={panelRef} className={`side-panel properties-panel ${open ? 'is-open' : ''} ${collapsed ? 'is-collapsed' : ''}`} aria-labelledby="properties-title">
      <button type="button" className="panel-rail-button" onClick={onToggle} aria-label="Espandi pannello proprietà" aria-expanded={false} title="Espandi pannello proprietà"><ChevronLeft size={18} /><span>Proprietà</span></button>
      <div className="panel-heading">
        <span className="eyebrow">Aspetto e contenuto</span>
        <h2 id="properties-title">Proprietà</h2>
        <p>{selectedBlock ? `Modifica qui il contenuto di ${name}${selectedBlock.type === 'text' || selectedBlock.type === 'heading' ? ', oppure scrivi nel foglio.' : '.'}` : 'Seleziona un riquadro nel foglio oppure cambia lo stile generale del CV.'}</p>
        <button type="button" className="properties-close" onClick={onClose} aria-label="Chiudi pannello proprietà">×</button>
        <button type="button" className="panel-collapse-button" onClick={onToggle} aria-label="Comprimi pannello proprietà" aria-expanded={true} title="Comprimi pannello proprietà"><ChevronRight size={17} /></button>
      </div>
      <div className="panel-body">
      {selectedBlock ? <>
        <section className="property-section"><h3>Contenuto</h3><BlockFields block={selectedBlock} onChange={onDataChange} /></section>
        <HeaderProperties block={selectedBlock} onStyleChange={onStyleChange} />
        <section className="property-section"><h3>Tipografia</h3>
          <label className="form-field"><span>Font del blocco</span><select value={selectedBlock.style.fontFamily ?? ''} onChange={(event) => onStyleChange({ fontFamily: event.target.value || undefined })}><option value="">Usa il font del CV</option>{STANDARD_FONTS.map((font) => <option key={font} value={font}>{font}</option>)}{globalStyle.customFont && <option value={CUSTOM_FONT_FAMILY}>{globalStyle.customFont.name}</option>}</select></label>
          <label className="form-field"><span>Carica un font per questo blocco (WOFF2, WOFF, TTF, OTF)</span><input type="file" accept=".woff2,.woff,.ttf,.otf" onChange={async (event) => { const file = event.target.files?.[0]; event.target.value = ''; if (!file) return; try { onLoadFontForBlock(await readFont(file)); setFontError(''); } catch (error) { setFontError(error instanceof Error ? error.message : 'Font non valido.'); } }} /></label>
          {fontError && <p className="field-error" role="alert">{fontError}</p>}
          <Numeric label="Dimensione (pt)" value={selectedBlock.style.fontSize ?? globalStyle.baseFontSize} min={6} max={36} onChange={(fontSize) => onStyleChange({ fontSize })} />
          <label className="form-field"><span>Peso</span><select value={selectedBlock.style.fontWeight ?? 400} onChange={(event) => onStyleChange({ fontWeight: Number(event.target.value) as BlockStyle['fontWeight'] })}><option value={400}>Normale</option><option value={500}>Medio</option><option value={600}>Semibold</option><option value={700}>Grassetto</option></select></label>
          <label className="form-field"><span>Allineamento</span><select value={selectedBlock.style.textAlign ?? 'left'} onChange={(event) => onStyleChange({ textAlign: event.target.value as BlockStyle['textAlign'] })}><option value="left">Sinistra</option><option value="center">Centro</option><option value="right">Destra</option></select></label>
          <Numeric label="Interlinea" value={selectedBlock.style.lineHeight ?? 1.45} min={1} max={3} step={0.05} onChange={(lineHeight) => onStyleChange({ lineHeight })} />
        </section>
        <section className="property-section"><h3>Spaziatura</h3>
          <Numeric label="Sopra (px)" value={selectedBlock.style.marginTop ?? 0} min={0} max={120} onChange={(marginTop) => onStyleChange({ marginTop })} />
          <Numeric label="Sotto (px)" value={selectedBlock.style.marginBottom ?? globalStyle.sectionSpacing} min={0} max={120} onChange={(marginBottom) => onStyleChange({ marginBottom })} />
        </section>
        <section className="property-section"><h3>Colori</h3>
          <Color label="Testo" value={selectedBlock.style.textColor ?? globalStyle.textColor} onChange={(textColor) => onStyleChange({ textColor })} />
          <Color label="Accento" value={selectedBlock.style.accentColor ?? globalStyle.accentColor} onChange={(accentColor) => onStyleChange({ accentColor })} />
        </section>
        <section className="property-section"><h3>Sfondo del blocco</h3>
          <label className="check-field"><input type="checkbox" checked={Boolean(selectedBlock.style.backgroundColor)} onChange={(event) => onStyleChange({ backgroundColor: event.target.checked ? '#eaf2fb' : undefined })} /><span>Mostra colore di sfondo</span></label>
          {selectedBlock.style.backgroundColor && <Color label="Colore" value={selectedBlock.style.backgroundColor} onChange={(backgroundColor) => onStyleChange({ backgroundColor })} />}
          <BackgroundImageFields image={selectedBlock.style.backgroundImage} mode={selectedBlock.style.backgroundMode} scope="block" onChange={onStyleChange} />
          {(selectedBlock.style.backgroundColor || selectedBlock.style.backgroundImage) && <label className="form-field"><span>Opacità sfondo: {selectedBlock.style.backgroundOpacity ?? 100}%</span><input type="range" min={0} max={100} value={selectedBlock.style.backgroundOpacity ?? 100} onChange={(event) => onStyleChange({ backgroundOpacity: Number(event.target.value) })} /></label>}
        </section>
        <div className="property-actions"><button type="button" onClick={onDuplicate}>Duplica</button><button type="button" className="danger-action" onClick={onDelete}>Elimina</button></div>
      </> : <>
        <section className="property-section"><h3>Stile globale</h3>
          <label className="form-field"><span>Font del CV</span><select value={globalStyle.fontFamily} onChange={(event) => onGlobalStyleChange({ fontFamily: event.target.value })}>{STANDARD_FONTS.map((font) => <option key={font} value={font}>{font}</option>)}{globalStyle.customFont && <option value={CUSTOM_FONT_FAMILY}>{globalStyle.customFont.name}</option>}</select></label>
          <label className="form-field"><span>Carica un font personale (WOFF2, WOFF, TTF, OTF)</span><input type="file" accept=".woff2,.woff,.ttf,.otf" onChange={async (event) => { const file = event.target.files?.[0]; event.target.value = ''; if (!file) return; try { onGlobalStyleChange({ customFont: await readFont(file), fontFamily: CUSTOM_FONT_FAMILY }); setFontError(''); } catch (error) { setFontError(error instanceof Error ? error.message : 'Font non valido.'); } }} /></label>
          {globalStyle.customFont && <button type="button" className="text-action" onClick={onRemoveFont}>Rimuovi font caricato</button>}
          {fontError && <p className="field-error" role="alert">{fontError}</p>}
          <Numeric label="Dimensione base (pt)" value={globalStyle.baseFontSize} min={8} max={16} onChange={(baseFontSize) => onGlobalStyleChange({ baseFontSize })} />
          <Numeric label="Margini pagina (mm)" value={globalStyle.pageMargin} min={8} max={35} onChange={(pageMargin) => onGlobalStyleChange({ pageMargin })} />
          <Numeric label="Spazio sezioni (px)" value={globalStyle.sectionSpacing} min={0} max={60} onChange={(sectionSpacing) => onGlobalStyleChange({ sectionSpacing })} />
          <Color label="Testo" value={globalStyle.textColor} onChange={(textColor) => onGlobalStyleChange({ textColor })} />
          <Color label="Accento" value={globalStyle.accentColor} onChange={(accentColor) => onGlobalStyleChange({ accentColor })} />
        </section>
        <section className="property-section"><h3>Sfondo del CV</h3><Color label="Colore pagina" value={globalStyle.backgroundColor ?? '#ffffff'} onChange={(backgroundColor) => onGlobalStyleChange({ backgroundColor })} /><BackgroundImageFields image={globalStyle.backgroundImage} mode={globalStyle.backgroundMode} scope="page" onChange={onGlobalStyleChange} /><label className="form-field"><span>Opacità sfondo: {globalStyle.backgroundOpacity ?? 100}%</span><input type="range" min={0} max={100} value={globalStyle.backgroundOpacity ?? 100} onChange={(event) => onGlobalStyleChange({ backgroundOpacity: Number(event.target.value) })} /></label></section>
        <p className="panel-footnote">Seleziona un blocco nel foglio per modificarne il contenuto.</p>
      </>}
      </div>
    </aside>
  );
}
