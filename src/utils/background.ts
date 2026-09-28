import type { CSSProperties } from 'react';
import type { BackgroundMode } from '../models/cv';

export const backgroundModes: { value: BackgroundMode; label: string }[] = [
  { value: 'cover', label: 'Riempi · copre e ritaglia' },
  { value: 'contain', label: 'Adatta · mostra tutta' },
  { value: 'stretch', label: 'Allunga · riempie deformando' },
  { value: 'tile', label: 'Affianca · ripete a mosaico' },
  { value: 'center', label: 'Centra · dimensione originale' },
  { value: 'span', label: 'Intervallo · estende sull’area' },
];

export function backgroundImageStyle(src: string, mode: BackgroundMode = 'cover', scope: 'block' | 'page' = 'block'): CSSProperties {
  const base: CSSProperties = { backgroundImage: `url("${src}")`, backgroundPosition: 'center', backgroundRepeat: 'no-repeat' };
  switch (mode) {
    case 'cover': return { ...base, backgroundSize: 'cover' };
    case 'contain': return { ...base, backgroundSize: 'contain' };
    case 'stretch': return { ...base, backgroundSize: scope === 'page' ? '100% 297mm' : '100% 100%', backgroundRepeat: scope === 'page' ? 'repeat-y' : 'no-repeat', backgroundPosition: scope === 'page' ? 'center top' : 'center' };
    case 'tile': return { ...base, backgroundSize: 'auto', backgroundPosition: 'left top', backgroundRepeat: 'repeat' };
    case 'center': return { ...base, backgroundSize: 'auto' };
    case 'span': return { ...base, backgroundSize: scope === 'page' ? '100% 100%' : 'auto 100%' };
  }
}
