export const STANDARD_FONTS = ['Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Verdana'] as const;
export const CUSTOM_FONT_FAMILY = 'CV Custom Font';

const FONT_TYPES: Record<string, string> = { woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf', otf: 'font/otf' };
export const IMAGE_DATA_URL = /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;
export const FONT_DATA_URL = /^data:font\/(?:woff2|woff|ttf|otf);base64,[A-Za-z0-9+/=]+$/;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Impossibile leggere il file.'));
    reader.readAsDataURL(file);
  });
}

export async function readFont(file: File): Promise<{ name: string; dataUrl: string }> {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const mime = FONT_TYPES[extension];
  if (!mime) throw new Error('Scegli un font WOFF2, WOFF, TTF oppure OTF.');
  if (file.size > 1_500_000) throw new Error('Il font deve pesare meno di 1,5 MB.');
  const raw = await readAsDataUrl(file);
  const base64 = raw.split(',')[1];
  if (!base64) throw new Error('Il file del font è vuoto.');
  const dataUrl = `data:${mime};base64,${base64}`;
  try { await new FontFace('CV Font Validation', `url("${dataUrl}")`).load(); }
  catch { throw new Error('Il file del font non è leggibile dal browser.'); }
  return { name: file.name, dataUrl };
}

export async function readImage(file: File, maxDimension = 1800): Promise<string> {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('Scegli un’immagine PNG, JPG oppure WebP.');
  if (file.size > 15_000_000) throw new Error('L’immagine deve pesare meno di 15 MB.');
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Impossibile elaborare l’immagine.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/webp', 0.82);
    if (!IMAGE_DATA_URL.test(dataUrl) || dataUrl.length > 2_700_000) throw new Error('L’immagine è troppo grande per il progetto.');
    return dataUrl;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
