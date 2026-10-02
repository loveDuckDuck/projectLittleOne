import type { CVBlockType } from './cv';

export interface BlockCatalogItem {
  type: CVBlockType;
  label: string;
  description: string;
  icon: string;
}

export const blockCatalog: BlockCatalogItem[] = [
  { type: 'personal', label: 'Informazioni personali', description: 'Nome e contatti', icon: '◉' },
  { type: 'experience', label: 'Esperienza', description: 'Ruoli e risultati', icon: '▣' },
  { type: 'education', label: 'Formazione', description: 'Studi e corsi', icon: '▤' },
  { type: 'heading', label: 'Titolo', description: 'Intestazione di sezione', icon: 'H' },
  { type: 'text', label: 'Testo', description: 'Paragrafo libero', icon: '≡' },
  { type: 'bulletList', label: 'Elenco puntato', description: 'Punti principali', icon: '☷' },
  { type: 'skills', label: 'Competenze', description: 'Capacità e strumenti', icon: '✦' },
  { type: 'hobbies', label: 'Hobby', description: 'Interessi personali', icon: '♡' },
  { type: 'languages', label: 'Lingue', description: 'Lingue e livelli', icon: '文' },
  { type: 'projects', label: 'Progetti', description: 'Lavori selezionati', icon: '◇' },
  { type: 'certifications', label: 'Certificazioni', description: 'Attestati e licenze', icon: '✧' },
  { type: 'custom', label: 'Sezione libera', description: 'Contenuto personalizzato', icon: '⊞' },
  { type: 'image', label: 'Immagine', description: 'Foto o elemento grafico', icon: '▧' },
  { type: 'divider', label: 'Separatore', description: 'Linea orizzontale', icon: '―' },
  { type: 'spacer', label: 'Spazio', description: 'Distanza verticale', icon: '↕' },
];
