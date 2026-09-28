import { useEffect, useRef, useState } from 'react';
import type { CVBlock, CVBlockDataMap } from '../../models/cv';
import { readImage } from '../../utils/assets';

interface Props {
  block: CVBlock;
  onChange: (data: CVBlock['data']) => void;
}

function TextField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="form-field"><span>{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="form-field"><span>{label}</span><textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function NumberField({ label, value, onChange, min = 0, max = 200 }: { label: string; value: number; onChange: (value: number) => void; min?: number; max?: number }) {
  return <label className="form-field"><span>{label}</span><input type="number" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="check-field"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span>{label}</span></label>;
}

function StructuredLines({ label, value, onCommit }: { label: string; value: string; onCommit: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  const editing = useRef(false);
  useEffect(() => { if (!editing.current) setDraft(value); }, [value]);
  return <label className="form-field"><span>{label}</span><textarea rows={5} value={draft} onFocus={() => { editing.current = true; }} onChange={(event) => setDraft(event.target.value)} onBlur={() => { editing.current = false; onCommit(draft); }} /></label>;
}

function StringList({ label, items, onChange }: { label: string; items: string[]; onChange: (value: string[]) => void }) {
  return <div className="list-field"><span className="field-label">{label}</span>{items.map((item, index) => <div className="list-field-row" key={index}><input aria-label={`${label} ${index + 1}`} value={item} onChange={(event) => onChange(items.map((current, i) => i === index ? event.target.value : current))} /><button type="button" aria-label={`Sposta punto ${index + 1} sopra`} disabled={index === 0} onClick={() => { const next = [...items]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange(next); }}>↑</button><button type="button" aria-label={`Sposta punto ${index + 1} sotto`} disabled={index === items.length - 1} onClick={() => { const next = [...items]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; onChange(next); }}>↓</button><button type="button" aria-label={`Rimuovi punto ${index + 1}`} onClick={() => onChange(items.filter((_, i) => i !== index))}>×</button></div>)}<button type="button" className="text-action" onClick={() => onChange([...items, ''])}>+ Aggiungi punto</button></div>;
}

function ImageFields({ data, onChange }: { data: CVBlockDataMap['image']; onChange: (data: CVBlockDataMap['image']) => void }) {
  const [error, setError] = useState('');
  return <>
    <label className="form-field"><span>Carica immagine (PNG, JPG, WebP)</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={async (event) => { const file = event.target.files?.[0]; event.target.value = ''; if (!file) return; try { const src = await readImage(file); onChange({ ...data, src, alt: data.alt || file.name.replace(/\.[^.]+$/, '') }); setError(''); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Immagine non valida.'); } }} /></label>
    {error && <p className="field-error" role="alert">{error}</p>}
    {data.src && <><img className="image-field-preview" src={data.src} alt="Anteprima immagine caricata" /><button type="button" className="text-action" onClick={() => onChange({ ...data, src: '' })}>Rimuovi immagine</button></>}
    <TextField label="Descrizione alternativa" value={data.alt} onChange={(alt) => onChange({ ...data, alt })} />
    <NumberField label="Larghezza (%)" value={data.width} min={5} max={100} onChange={(width) => onChange({ ...data, width })} />
    <NumberField label="Altezza (px, 0 = automatica)" value={data.height} min={0} max={1000} onChange={(height) => onChange({ ...data, height })} />
    {data.height > 0 && <label className="form-field"><span>Adattamento</span><select value={data.fit} onChange={(event) => onChange({ ...data, fit: event.target.value as typeof data.fit })}><option value="contain">Mostra tutta</option><option value="cover">Riempi e ritaglia</option></select></label>}
  </>;
}

export function BlockFields({ block, onChange }: Props) {
  switch (block.type) {
    case 'personal': {
      const d = block.data;
      return <><TextField label="Nome" value={d.firstName} onChange={(value) => onChange({ ...d, firstName: value })} /><TextField label="Cognome" value={d.lastName} onChange={(value) => onChange({ ...d, lastName: value })} /><TextField label="Titolo professionale" value={d.professionalTitle} onChange={(value) => onChange({ ...d, professionalTitle: value })} /><TextField label="Email" value={d.email} onChange={(value) => onChange({ ...d, email: value })} /><TextField label="Telefono" value={d.phone} onChange={(value) => onChange({ ...d, phone: value })} /><TextField label="Città" value={d.city} onChange={(value) => onChange({ ...d, city: value })} /><TextField label="Paese" value={d.country} onChange={(value) => onChange({ ...d, country: value })} /><TextField label="LinkedIn" value={d.linkedIn} onChange={(value) => onChange({ ...d, linkedIn: value })} /><TextField label="GitHub" value={d.github} onChange={(value) => onChange({ ...d, github: value })} /><TextField label="Sito web" value={d.website} onChange={(value) => onChange({ ...d, website: value })} /><TextArea label="Profilo" value={d.summary} onChange={(value) => onChange({ ...d, summary: value })} /></>;
    }
    case 'text': return <TextArea label="Testo" value={block.data.text} onChange={(value) => onChange({ ...block.data, text: value })} />;
    case 'heading': {
      const d = block.data;
      return <><TextField label="Titolo" value={d.text} onChange={(value) => onChange({ ...d, text: value })} /><label className="form-field"><span>Livello</span><select value={d.level} onChange={(event) => onChange({ ...d, level: Number(event.target.value) as 1 | 2 | 3 })}><option value={1}>H1</option><option value={2}>H2</option><option value={3}>H3</option></select></label><CheckField label="Maiuscolo" checked={d.uppercase} onChange={(value) => onChange({ ...d, uppercase: value })} /><CheckField label="Sottolineato" checked={d.underline} onChange={(value) => onChange({ ...d, underline: value })} /><CheckField label="Linea d'accento" checked={d.accentLine} onChange={(value) => onChange({ ...d, accentLine: value })} /></>;
    }
    case 'experience': {
      const d = block.data;
      return <><TextField label="Ruolo" value={d.title} onChange={(value) => onChange({ ...d, title: value })} /><TextField label="Azienda" value={d.company} onChange={(value) => onChange({ ...d, company: value })} /><TextField label="Luogo" value={d.location} onChange={(value) => onChange({ ...d, location: value })} /><TextField label="Da" type="month" value={d.startDate} onChange={(value) => onChange({ ...d, startDate: value })} /><TextField label="A" type="month" value={d.endDate} onChange={(value) => onChange({ ...d, endDate: value })} /><CheckField label="Lavoro qui attualmente" checked={d.current} onChange={(value) => onChange({ ...d, current: value })} /><TextArea label="Descrizione" value={d.description} onChange={(value) => onChange({ ...d, description: value })} /><StringList label="Risultati" items={d.bullets} onChange={(value) => onChange({ ...d, bullets: value })} /></>;
    }
    case 'education': {
      const d = block.data;
      return <><TextField label="Titolo di studio" value={d.degree} onChange={(value) => onChange({ ...d, degree: value })} /><TextField label="Istituto" value={d.school} onChange={(value) => onChange({ ...d, school: value })} /><TextField label="Luogo" value={d.location} onChange={(value) => onChange({ ...d, location: value })} /><TextField label="Da" type="month" value={d.startDate} onChange={(value) => onChange({ ...d, startDate: value })} /><TextField label="A" type="month" value={d.endDate} onChange={(value) => onChange({ ...d, endDate: value })} /><TextArea label="Descrizione" value={d.description} onChange={(value) => onChange({ ...d, description: value })} /><StringList label="Punti" items={d.bullets} onChange={(value) => onChange({ ...d, bullets: value })} /></>;
    }
    case 'bulletList': {
      const d = block.data;
      return <><StringList label="Punti" items={d.items} onChange={(value) => onChange({ ...d, items: value })} /><label className="form-field"><span>Simbolo</span><select value={d.marker} onChange={(event) => onChange({ ...d, marker: event.target.value as typeof d.marker })}><option value="disc">Pieno</option><option value="circle">Vuoto</option><option value="square">Quadrato</option></select></label></>;
    }
    case 'skills': {
      const d = block.data;
      return <><label className="form-field"><span>Layout</span><select value={d.layout} onChange={(event) => onChange({ ...d, layout: event.target.value as typeof d.layout })}><option value="inline">In linea</option><option value="list">Elenco</option><option value="grouped">Gruppi</option></select></label>{d.layout === 'grouped' ? <StructuredLines key={block.id} label="Gruppi (Categoria: voce, voce)" value={d.groups.map((g) => `${g.name}: ${g.items.join(', ')}`).join('\n')} onCommit={(value) => onChange({ ...d, groups: value.split('\n').filter(Boolean).map((line) => { const [name, rest = ''] = line.split(':'); return { name: name.trim(), items: rest.split(',').map((item) => item.trim()).filter(Boolean) }; }) })} /> : <StringList label="Competenze" items={d.items} onChange={(value) => onChange({ ...d, items: value })} />}</>;
    }
    case 'hobbies': return <StringList label="Hobby" items={block.data.items} onChange={(items) => onChange({ items })} />;
    case 'languages': {
      const d = block.data;
      return <StructuredLines key={block.id} label="Lingue (una per riga: lingua | livello)" value={d.items.map((item) => `${item.language} | ${item.proficiency}`).join('\n')} onCommit={(value) => onChange({ items: value.split('\n').filter(Boolean).map((line) => { const [language, proficiency = ''] = line.split('|'); return { language: language.trim(), proficiency: proficiency.trim() }; }) })} />;
    }
    case 'projects': {
      const d = block.data;
      return <><TextField label="Titolo" value={d.title} onChange={(value) => onChange({ ...d, title: value })} /><TextField label="Ruolo" value={d.role} onChange={(value) => onChange({ ...d, role: value })} /><TextField label="Date" value={d.dates} onChange={(value) => onChange({ ...d, dates: value })} /><TextArea label="Descrizione" value={d.description} onChange={(value) => onChange({ ...d, description: value })} /><TextField label="URL" value={d.url} onChange={(value) => onChange({ ...d, url: value })} /><StringList label="Risultati" items={d.bullets} onChange={(value) => onChange({ ...d, bullets: value })} /></>;
    }
    case 'certifications': {
      const d = block.data;
      return <><TextField label="Titolo" value={d.title} onChange={(value) => onChange({ ...d, title: value })} /><TextField label="Ente" value={d.issuer} onChange={(value) => onChange({ ...d, issuer: value })} /><TextField label="Data" value={d.date} onChange={(value) => onChange({ ...d, date: value })} /><TextField label="URL" value={d.url} onChange={(value) => onChange({ ...d, url: value })} /></>;
    }
    case 'divider': return <><NumberField label="Spessore (px)" value={block.data.thickness} min={1} max={12} onChange={(value) => onChange({ ...block.data, thickness: value })} /><NumberField label="Larghezza (%)" value={block.data.width} min={10} max={100} onChange={(value) => onChange({ ...block.data, width: value })} /></>;
    case 'spacer': return <NumberField label="Altezza (px)" value={block.data.height} min={4} max={200} onChange={(value) => onChange({ ...block.data, height: value })} />;
    case 'image': return <ImageFields data={block.data} onChange={onChange} />;
    case 'custom': return <>{!block.style.header && <TextField label="Titolo" value={block.data.title} onChange={(value) => onChange({ ...block.data, title: value })} />}<TextArea label="Contenuto" value={block.data.body} onChange={(value) => onChange({ ...block.data, body: value })} /></>;
  }
}
