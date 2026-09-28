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

export function mapBlock(document: CVDocument, id: string, update: (block: CVBlock) => CVBlock): CVDocument {
  return { ...document, rows: document.rows.map((row) => ({ ...row, columns: row.columns.map((column) => ({ ...column, blocks: column.blocks.map((block) => block.id === id ? update(block) : block) })) })) };
}

export function removeBlock(document: CVDocument, id: string): CVDocument {
  return { ...document, rows: document.rows.map((row) => {
    const columns = row.columns.map((column) => ({ ...column, blocks: column.blocks.filter((block) => block.id !== id) }))
      .filter((column, index, all) => column.blocks.length > 0 || row.columns[index].blocks.length === 0 || !all.some((item) => item.blocks.length > 0));
    const total = columns.reduce((sum, column) => sum + column.width, 0);
    const normalized = columns.map((column, index) => ({ ...column, width: index === columns.length - 1 ? 100 - columns.slice(0, -1).reduce((sum, item) => sum + Math.round(item.width / total * 100), 0) : Math.round(column.width / total * 100) }));
    return { ...row, columns: normalized };
  }).filter((row) => row.columns.some((column) => column.blocks.length > 0) || row.columns.length > 1) };
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
    const columnIndex = row.columns.findIndex((item) => item.id === target.columnId);
    if (columnIndex < 0 || row.columns.length >= 3) return document;
    const selectedColumn = row.columns[columnIndex];
    const sharedWidth = row.columns.length === 1 ? 100 : Math.max(40, selectedColumn.width);
    if (row.columns.length === 2) {
      const neighbor = row.columns[1 - columnIndex];
      neighbor.width = 100 - sharedWidth;
    }
    selectedColumn.width = Math.floor(sharedWidth / 2);
    const newColumn: CVColumn = { id: crypto.randomUUID(), width: sharedWidth - selectedColumn.width, blocks: [block] };
    row.columns.splice(columnIndex + (target.side === 'right' ? 1 : 0), 0, newColumn);
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
  return { ...placed, rows: placed.rows.filter((row) => row.columns.length > 1 || row.columns.some((column) => column.blocks.length > 0)) };
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
