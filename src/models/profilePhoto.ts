export const profilePhotoShapes = [
  { id: 'circle', label: 'Cerchio' },
  { id: 'square', label: 'Quadrato' },
  { id: 'rounded', label: 'Arrotondato' },
  { id: 'squircle', label: 'Morbido' },
  { id: 'portrait', label: 'Ritratto' },
  { id: 'landscape', label: 'Orizzontale' },
  { id: 'oval', label: 'Ovale' },
  { id: 'pill', label: 'Capsula' },
  { id: 'arch', label: 'Arco' },
  { id: 'leaf', label: 'Petalo' },
] as const;

export type ProfilePhotoShape = typeof profilePhotoShapes[number]['id'];
