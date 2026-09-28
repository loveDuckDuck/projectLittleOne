export interface PageSlice { start: number; end: number }
export interface BlockBounds { top: number; bottom: number }

export function paginate(pageHeight: number, margin: number, contentEnd: number, blocks: BlockBounds[]): PageSlice[] {
  const usableHeight = pageHeight - 2 * margin;
  if (usableHeight <= 0) return [{ start: margin, end: contentEnd }];
  const slices: PageSlice[] = [];
  let start = margin;
  const orderedBlocks = [...blocks].sort((a, b) => a.top - b.top);

  while (start < contentEnd && slices.length < 100) {
    let end = Math.min(start + usableHeight, contentEnd);
    if (end < contentEnd) {
      const crossing = orderedBlocks.find((block) => block.top < end && block.bottom > end);
      if (crossing && crossing.bottom - crossing.top <= usableHeight && crossing.top - start > usableHeight * 0.15) {
        end = crossing.top;
      }
    }
    if (end <= start) end = Math.min(start + usableHeight, contentEnd);
    slices.push({ start, end });
    start = end;
  }
  return slices.length > 0 ? slices : [{ start: margin, end: margin }];
}
