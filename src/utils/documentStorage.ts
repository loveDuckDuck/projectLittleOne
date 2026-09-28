import type { CVBlock, CVBlockType, CVDocument } from '../models/cv';
import { createBlock, createStarterDocument } from '../models/createBlock';
import { singleRow } from './layout';
import { CUSTOM_FONT_FAMILY, FONT_DATA_URL, IMAGE_DATA_URL, STANDARD_FONTS } from './assets';

const STORAGE_KEY = 'cv-builder-document-v1';
const blockTypes: CVBlockType[] = ['personal', 'text', 'heading', 'experience', 'education', 'bulletList', 'skills', 'hobbies', 'languages', 'projects', 'certifications', 'divider', 'spacer', 'image', 'custom'];
const isHexColor = (value: unknown) => typeof value === 'string' && /^#[\da-f]{6}$/i.test(value);
const isFontFamily = (value: unknown) => STANDARD_FONTS.includes(value as typeof STANDARD_FONTS[number]) || value === CUSTOM_FONT_FAMILY;
const isBackgroundMode = (value: unknown) => ['cover', 'contain', 'stretch', 'tile', 'center', 'span'].includes(String(value));
const isBackgroundImage = (value: unknown) => typeof value === 'string' && value.length <= 2_700_000 && IMAGE_DATA_URL.test(value);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function matchesShape(value: unknown, example: unknown): boolean {
  if (Array.isArray(example)) {
    return Array.isArray(value) && (example.length === 0 || value.every((item) => matchesShape(item, example[0])));
  }
  if (isRecord(example)) {
    return isRecord(value) && Object.keys(example).every((key) => matchesShape(value[key], example[key]));
  }
  return typeof value === typeof example;
}

function validBlock(value: unknown): value is CVBlock {
  if (!isRecord(value) || typeof value.id !== 'string' || !value.id || !blockTypes.includes(value.type as CVBlockType)) return false;
  const style = value.style;
  if (!isRecord(style)) return false;
  const example = createBlock(value.type as CVBlockType);
  if (!matchesShape(value.data, example.data)) return false;
  const data = value.data as Record<string, unknown>;
  if (value.type === 'heading' && (![1, 2, 3].includes(data.level as number))) return false;
  if (value.type === 'bulletList' && !['disc', 'circle', 'square'].includes(String(data.marker))) return false;
  if (value.type === 'skills' && !['list', 'inline', 'grouped'].includes(String(data.layout))) return false;
  if (value.type === 'divider' && ((data.thickness as number) < 1 || (data.width as number) < 1 || (data.width as number) > 100)) return false;
  if (value.type === 'spacer' && ((data.height as number) < 0 || (data.height as number) > 1000)) return false;
  if (value.type === 'image' && (typeof data.src !== 'string' || (data.src !== '' && (data.src.length > 2_700_000 || !IMAGE_DATA_URL.test(data.src))) || (data.width as number) < 5 || (data.width as number) > 100 || (data.height as number) < 0 || (data.height as number) > 1000 || !['contain', 'cover'].includes(String(data.fit)))) return false;
  const styleKeys = ['fontSize', 'fontWeight', 'lineHeight', 'marginTop', 'marginBottom'];
  if (styleKeys.some((key) => key in style && (typeof style[key] !== 'number' || !Number.isFinite(style[key])))) return false;
  if ('fontWeight' in style && ![400, 500, 600, 700].includes(style.fontWeight as number)) return false;
  if (['marginTop', 'marginBottom'].some((key) => key in style && (style[key] as number) < 0)) return false;
  if ('fontSize' in style && ((style.fontSize as number) < 5 || (style.fontSize as number) > 72)) return false;
  if ('lineHeight' in style && ((style.lineHeight as number) < 0.8 || (style.lineHeight as number) > 4)) return false;
  if ('textAlign' in style && !['left', 'center', 'right'].includes(String(style.textAlign))) return false;
  if (['textColor', 'accentColor'].some((key) => key in style && typeof style[key] !== 'string')) return false;
  if ('fontFamily' in style && !isFontFamily(style.fontFamily)) return false;
  if ('backgroundColor' in style && !isHexColor(style.backgroundColor)) return false;
  if ('backgroundOpacity' in style && (typeof style.backgroundOpacity !== 'number' || !Number.isFinite(style.backgroundOpacity) || style.backgroundOpacity < 0 || style.backgroundOpacity > 100)) return false;
  if ('backgroundImage' in style && !isBackgroundImage(style.backgroundImage)) return false;
  if ('backgroundMode' in style && !isBackgroundMode(style.backgroundMode)) return false;
  if ('header' in style) {
    const header = style.header;
    if (!isRecord(header) || typeof header.title !== 'string' || typeof header.showIcon !== 'boolean' || !['left', 'right'].includes(String(header.iconPosition)) || !['none', 'uppercase', 'lowercase'].includes(String(header.textTransform)) || !['left', 'center', 'right'].includes(String(header.textAlign)) || ![400, 500, 600, 700].includes(header.fontWeight as number) || typeof header.bottomBorder !== 'boolean' || typeof header.dividerLine !== 'boolean') return false;
    if ([['iconSize', 10, 32], ['iconGap', 0, 24], ['fontSize', 7, 30], ['spacingAbove', 0, 80], ['spacingBelow', 0, 80]].some(([key, min, max]) => typeof header[key as string] !== 'number' || !Number.isFinite(header[key as string]) || (header[key as string] as number) < (min as number) || (header[key as string] as number) > (max as number))) return false;
    if (['icon', 'iconColor', 'color', 'backgroundColor'].some((key) => key in header && typeof header[key] !== 'string')) return false;
  }
  return true;
}

export function parseDocument(value: unknown): CVDocument {
  if (!isRecord(value) || ![1, 2].includes(value.version as number) || !isRecord(value.globalStyle)) {
    throw new Error('Il file non contiene un progetto CV Builder valido.');
  }
  if (!matchesShape(value.globalStyle, createStarterDocument().globalStyle)) {
    throw new Error('Lo stile globale del progetto non è valido.');
  }
  const globalStyle = value.globalStyle;
  if (!isFontFamily(globalStyle.fontFamily)
    || (globalStyle.baseFontSize as number) < 6 || (globalStyle.baseFontSize as number) > 36
    || (globalStyle.pageMargin as number) < 0 || (globalStyle.pageMargin as number) > 50
    || (globalStyle.sectionSpacing as number) < 0 || (globalStyle.sectionSpacing as number) > 200) {
    throw new Error('I valori dello stile globale non sono validi.');
  }
  if ('customFont' in globalStyle && (!isRecord(globalStyle.customFont) || typeof globalStyle.customFont.name !== 'string' || globalStyle.customFont.name.length > 120 || typeof globalStyle.customFont.dataUrl !== 'string' || globalStyle.customFont.dataUrl.length > 2_100_000 || !FONT_DATA_URL.test(globalStyle.customFont.dataUrl))) throw new Error('Il font personalizzato non è valido.');
  if (globalStyle.fontFamily === CUSTOM_FONT_FAMILY && !globalStyle.customFont) throw new Error('Il font personalizzato non è presente.');
  if ('backgroundColor' in globalStyle && !isHexColor(globalStyle.backgroundColor)) throw new Error('Il colore dello sfondo del CV non è valido.');
  if ('backgroundOpacity' in globalStyle && (typeof globalStyle.backgroundOpacity !== 'number' || !Number.isFinite(globalStyle.backgroundOpacity) || globalStyle.backgroundOpacity < 0 || globalStyle.backgroundOpacity > 100)) throw new Error('La trasparenza dello sfondo del CV non è valida.');
  if ('backgroundImage' in globalStyle && !isBackgroundImage(globalStyle.backgroundImage)) throw new Error('L’immagine di sfondo del CV non è valida.');
  if ('backgroundMode' in globalStyle && !isBackgroundMode(globalStyle.backgroundMode)) throw new Error('La disposizione dello sfondo del CV non è valida.');
  if (value.version === 1 && (!Array.isArray(value.blocks) || value.blocks.length > 500)) throw new Error('Uno o più blocchi del progetto non sono validi.');
  const rows = value.version === 1 && Array.isArray(value.blocks)
    ? value.blocks.map((block: CVBlock) => singleRow([block]))
    : value.rows;
  if (!Array.isArray(rows) || rows.length > 500 || !rows.every((row) => isRecord(row) && typeof row.id === 'string' && row.id.length > 0 && Array.isArray(row.columns) && row.columns.length >= 1 && row.columns.length <= 3 && row.columns.every((column: unknown) => isRecord(column) && typeof column.id === 'string' && column.id.length > 0 && typeof column.width === 'number' && Number.isFinite(column.width) && column.width >= 20 && Array.isArray(column.blocks) && column.blocks.every(validBlock)) && Math.abs((row.columns as { width: number }[]).reduce((sum, column) => sum + column.width, 0) - 100) < 0.01)) {
    throw new Error('La disposizione del progetto non è valida.');
  }
  const blocks = rows.flatMap((row: { columns: { blocks: CVBlock[] }[] }) => row.columns.flatMap((column) => column.blocks));
  const ids = rows.flatMap((row: { id: string; columns: { id: string; blocks: CVBlock[] }[] }) => [row.id, ...row.columns.map((column) => column.id), ...row.columns.flatMap((column) => column.blocks.map((block) => block.id))]);
  if (blocks.length > 500 || new Set(ids).size !== ids.length) {
    throw new Error('Uno o più blocchi del progetto non sono validi.');
  }
  return { version: 2, globalStyle: value.globalStyle as unknown as CVDocument['globalStyle'], rows: rows as CVDocument['rows'] };
}

export function loadSavedDocument(): CVDocument {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createStarterDocument();
    const stored: unknown = JSON.parse(raw);
    if (!isRecord(stored)) return createStarterDocument();
    return parseDocument(stored.document);
  } catch {
    return createStarterDocument();
  }
}

export function saveDocument(document: CVDocument): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ document, updatedAt: new Date().toISOString() }));
}

export function downloadProject(cvDocument: CVDocument): void {
  const blob = new Blob([JSON.stringify(cvDocument, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'cv-project.json';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
