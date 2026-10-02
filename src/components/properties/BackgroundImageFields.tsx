import { useState } from 'react';
import type { BackgroundMode } from '../../models/cv';
import { readImage } from '../../utils/assets';
import { backgroundModes } from '../../utils/background';

interface Props {
  image?: string;
  mode?: BackgroundMode;
  scope: 'block' | 'page';
  onChange: (values: { backgroundImage?: string; backgroundMode?: BackgroundMode }) => void;
}

export function BackgroundImageFields({ image, mode, scope, onChange }: Props) {
  const [error, setError] = useState('');
  return <>
    <label className="form-field"><span>Immagine di sfondo (PNG, JPG, WebP)</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={async (event) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      try { onChange({ backgroundImage: await readImage(file), backgroundMode: mode ?? 'cover' }); setError(''); }
      catch (cause) { setError(cause instanceof Error ? cause.message : 'Immagine non valida.'); }
    }} /></label>
    {error && <p className="field-error" role="alert">{error}</p>}
    {image && <>
      <img className="image-field-preview" src={image} alt="Anteprima dello sfondo caricato" />
      <button type="button" className="text-action" onClick={() => onChange({ backgroundImage: undefined, backgroundMode: undefined })}>Rimuovi immagine di sfondo</button>
      <label className="form-field"><span>Disposizione dell’immagine</span><select value={mode ?? 'cover'} onChange={(event) => onChange({ backgroundMode: event.target.value as BackgroundMode })}>{backgroundModes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
      {mode === 'span' && <p className="property-help">{scope === 'page' ? 'Un’unica immagine viene estesa sull’intero CV, comprese tutte le pagine.' : 'L’immagine si estende lungo l’altezza del blocco.'}</p>}
    </>}
  </>;
}
