import { paginate } from './pagination';

export function measurePages(area: HTMLElement) {
  const bounds = area.getBoundingClientRect();
  const zoom = bounds.width / area.offsetWidth || 1;
  const margin = parseFloat(area.ownerDocument.defaultView!.getComputedStyle(area).paddingTop) || 0;
  const pageHeight = area.offsetWidth * 297 / 210;
  const rows = Array.from(area.querySelectorAll<HTMLElement>('.cv-row')).map((row) => {
    const rect = row.getBoundingClientRect();
    return { top: (rect.top - bounds.top) / zoom, bottom: (rect.bottom - bounds.top) / zoom };
  });
  const contentEnd = rows.length ? Math.max(...rows.map((row) => row.bottom)) + margin : margin;
  return { margin, pageHeight, zoom, bounds, slices: paginate(pageHeight, margin, contentEnd, rows) };
}
