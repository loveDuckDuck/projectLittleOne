import type { CVBlock, CVColumn, CVDocument, CVRow } from '../models/cv';

export const presets = [[100], [50, 50], [60, 40], [40, 60], [70, 30], [30, 70], [34, 33, 33]] as const;
export type DropTarget =
  | { kind: 'row'; rowId: string; side: 'above' | 'below' }
  | { kind: 'column'; rowId: string; columnId: string; index: number }
  | { kind: 'side'; rowId: string; columnId: string; side: 'left' | 'right' };

export const blocksOf = (document: CVDocument): CVBlock[] => document.rows.flatMap((row) => row.columns.flatMap((column) => column.blocks));
export const singleRow = (blocks: CVBlock[] = []): CVRow => ({ id: crypto.randomUUID(), columns: [{ id: crypto.randomUUID(), width: 100, blocks }] });
export const locateBlock = (document: CVDocument, id: string) => {
  for (const row of document.rows) for (const column of row.columns) {
    const index = column.blocks.findIndex((block) => block.id === id);
    if (index >= 0) return { row, column, index };
  }
  return null;
};

export function sideColumnLayout(row: CVRow, columnId: string, side: 'left' | 'right') {
  const columnIndex = row.columns.findIndex((column) => column.id === columnId);
  if (columnIndex < 0 || row.columns.length >= 3) return null;
  const widths = row.columns.map((column) => column.width);
  const sharedWidth = row.columns.length === 1 ? 100 : Math.max(40, widths[columnIndex]);
  if (row.columns.length === 2) widths[1 - columnIndex] = 100 - sharedWidth;
  widths[columnIndex] = Math.floor(sharedWidth / 2);
  const insertionIndex = columnIndex + (side === 'right' ? 1 : 0);
  widths.splice(insertionIndex, 0, sharedWidth - Math.floor(sharedWidth / 2));
  return { widths, insertionIndex };
}

export function mapBlock(document: CVDocument, id: string, update: (block: CVBlock) => CVBlock): CVDocument {
  return { ...document, rows: document.rows.map((row) => ({ ...row, columns: row.columns.map((column) => ({ ...column, blocks: column.blocks.map((block) => block.id === id ? update(block) : block) })) })) };
}

function compactRow(row: CVRow): CVRow | null {
  const columns = row.columns.filter((column) => column.blocks.length > 0);
  if (columns.length === 0) return null;
  if (columns.length === row.columns.length) return row;
  const total = columns.reduce((sum, column) => sum + column.width, 0);
  let assigned = 0;
  return { ...row, columns: columns.map((column, index) => {
    const width = index === columns.length - 1 ? 100 - assigned : Math.round(column.width / total * 100);
    assigned += width;
    return { ...column, width };
  }) };
}

export function removeBlock(document: CVDocument, id: string): CVDocument {
  const source = locateBlock(document, id);
  if (!source) return document;
  return { ...document, rows: document.rows.flatMap((row) => {
    if (row.id !== source.row.id) return [row];
    const columns = row.columns.map((column) => ({ ...column, blocks: column.blocks.filter((block) => block.id !== id) }));
    const updated = columns.find((column) => column.id === source.column.id)?.blocks.length === 0
      ? compactRow({ ...row, columns }) : { ...row, columns };
    return updated ? [updated] : [];
  }) };
}

export function placeBlock(document: CVDocument, block: CVBlock, target: DropTarget | null): CVDocument {
  if (!target) return { ...document, rows: [...document.rows, singleRow([block])] };
  const rowIndex = document.rows.findIndex((row) => row.id === target.rowId);
  if (rowIndex < 0) return document;
  const rows = document.rows.map((row) => ({ ...row, columns: row.columns.map((column) => ({ ...column, blocks: [...column.blocks] })) }));
  const row = rows[rowIndex];
  if (target.kind === 'row') {
    rows.splice(rowIndex + (target.side === 'below' ? 1 : 0), 0, singleRow([block]));
  } else if (target.kind === 'column') {
    const column = row.columns.find((item) => item.id === target.columnId);
    if (!column) return document;
    column.blocks.splice(Math.max(0, Math.min(target.index, column.blocks.length)), 0, block);
  } else {
    const layout = sideColumnLayout(row, target.columnId, target.side);
    if (!layout) return document;
    const newColumn: CVColumn = { id: crypto.randomUUID(), width: layout.widths[layout.insertionIndex], blocks: [block] };
    row.columns.splice(layout.insertionIndex, 0, newColumn);
    row.columns.forEach((column, index) => { column.width = layout.widths[index]; });
  }
  return { ...document, rows };
}

export function moveBlockTo(document: CVDocument, block: CVBlock, target: DropTarget | null): CVDocument {
  const source = locateBlock(document, block.id);
  if (!source) return document;
  if (target?.kind === 'column' && target.columnId === source.column.id) {
    const from = source.index;
    if (target.index === from || target.index === from + 1) return document;
    target = { ...target, index: target.index > from ? target.index - 1 : target.index };
  }
  // Preserve the source column while moving so a drop into an empty neighbor
  // does not collapse the layout before the destination is filled.
  const without = { ...document, rows: document.rows.map((row) => ({ ...row, columns: row.columns.map((column) => ({ ...column, blocks: column.blocks.filter((item) => item.id !== block.id) })) })) };
  const placed = placeBlock(without, block, target);
  if (!locateBlock(placed, block.id)) return document;
  return { ...placed, rows: placed.rows.flatMap((row) => {
    if (row.id !== source.row.id || row.columns.find((column) => column.id === source.column.id)?.blocks.length) return [row];
    const updated = compactRow(row);
    return updated ? [updated] : [];
  }) };
}

export function setRowPreset(document: CVDocument, rowId: string, widths: readonly number[]): CVDocument {
  return { ...document, rows: document.rows.map((row) => {
    if (row.id !== rowId) return row;
    const columns = row.columns.map((column) => ({ ...column, blocks: [...column.blocks] }));
    if (columns.length > widths.length) {
      const overflow = columns.splice(widths.length);
      columns[columns.length - 1].blocks.push(...overflow.flatMap((column) => column.blocks));
    }
    while (columns.length < widths.length) columns.push({ id: crypto.randomUUID(), width: 0, blocks: [] });
    return { ...row, columns: columns.map((column, index) => ({ ...column, width: widths[index] })) };
  }) };
}

export function resizeColumns(document: CVDocument, rowId: string, leftIndex: number, width: number): CVDocument {
  return { ...document, rows: document.rows.map((row) => {
    if (row.id !== rowId || !row.columns[leftIndex + 1]) return row;
    const total = row.columns[leftIndex].width + row.columns[leftIndex + 1].width;
    const left = Math.max(20, Math.min(total - 20, width));
    return { ...row, columns: row.columns.map((column, index) => index === leftIndex ? { ...column, width: left } : index === leftIndex + 1 ? { ...column, width: total - left } : column) };
  }) };
}

export function moveColumn(document: CVDocument, rowId: string, columnId: string, targetColumnId: string): CVDocument {
  return { ...document, rows: document.rows.map((row) => {
    if (row.id !== rowId) return row;
    const from = row.columns.findIndex((column) => column.id === columnId);
    const to = row.columns.findIndex((column) => column.id === targetColumnId);
    if (from < 0 || to < 0 || from === to) return row;
    const columns = [...row.columns];
    const [moving] = columns.splice(from, 1);
    columns.splice(to, 0, moving);
    return { ...row, columns };
  }) };
}
