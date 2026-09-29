import { useEffect, useRef, useState } from 'react';
import { defaultRandomCVOptions, type RandomCVOptions } from '../../models/randomDocument';

export function RandomCVDialog({ onGenerate, onClose }: { onGenerate: (options: RandomCVOptions) => boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [options, setOptions] = useState(defaultRandomCVOptions);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="new-cv-dialog random-cv-dialog" aria-labelledby="random-cv-title" aria-describedby="random-cv-description" onClose={onClose}>
    <form onSubmit={(event) => { event.preventDefault(); if (onGenerate(options)) onClose(); }}>
      <h2 id="random-cv-title">Crea un CV casuale</h2>
      <p id="random-cv-description">Ogni generazione cambia identità, percorso professionale, font e colori. Tutti i dati sono fittizi e ogni blocco resta modificabile.</p>
      <label className="form-field"><span>Quantità di contenuti</span><select autoFocus value={options.length} onChange={(event) => setOptions({ ...options, length: event.target.value as RandomCVOptions['length'] })}><option value="short">Breve — contenuti essenziali</option><option value="medium">Medio — profilo completo</option><option value="long">Lungo — più esperienze e progetti</option></select></label>
      <label className="form-field"><span>Disposizione del CV</span><select value={options.columns} onChange={(event) => setOptions({ ...options, columns: event.target.value === 'random' ? 'random' : Number(event.target.value) as 1 | 2 | 3 })}><option value="random">Casuale</option><option value={1}>Una colonna</option><option value={2}>Due colonne — con sezione laterale</option><option value={3}>Tre colonne — nelle sezioni finali</option></select></label>
      <label className="check-field"><input type="checkbox" checked={options.includePhoto} onChange={(event) => setOptions({ ...options, includePhoto: event.target.checked })} />Includi un avatar generico</label>
      <p className="random-cv-note">Il CV attuale sarà sostituito. Puoi recuperarlo con Annulla finché la pagina rimane aperta; esportalo in JSON per conservarlo.</p>
      <div className="dialog-actions"><button type="button" onClick={onClose}>Annulla</button><button type="submit" className="button-primary">Genera CV casuale</button></div>
    </form>
  </dialog>;
}
