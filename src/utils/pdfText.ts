export interface TextRun { text: string; x: number; y: number; width: number; height: number; fontSize: number; fontFamily: string; fontWeight: string }

// Measure actual browser line wrapping, including text inside nested spans and links.
export function measureText(area: HTMLElement, zoom: number): TextRun[] {
  const origin = area.getBoundingClientRect();
  const runs: TextRun[] = [];
  const walker = area.ownerDocument.createTreeWalker(area, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent?.closest('.cv-block')) continue;
    const hidden = parent.closest('.visually-hidden, [aria-hidden="true"]');
    if (hidden && area.contains(hidden)) continue;
    const style = area.ownerDocument.defaultView!.getComputedStyle(parent);
    if (style.visibility === 'hidden' || style.display === 'none') continue;
    const value = node.textContent || '';
    let current: TextRun | undefined;
    let offset = 0;
    for (const char of value) {
      const range = area.ownerDocument.createRange();
      range.setStart(node, offset); offset += char.length; range.setEnd(node, offset);
      const rect = range.getBoundingClientRect();
      if (!rect.height || !rect.width) continue;
      const y = (rect.top - origin.top) / zoom;
      const x = (rect.left - origin.left) / zoom;
      if (!current || Math.abs(current.y - y) > 1) {
        current = { text: '', x, y, width: 0, height: rect.height / zoom, fontSize: parseFloat(style.fontSize) * .75, fontFamily: style.fontFamily, fontWeight: style.fontWeight };
        runs.push(current);
      }
      current.text += style.textTransform === 'uppercase' ? char.toLocaleUpperCase('it-IT') : style.textTransform === 'lowercase' ? char.toLocaleLowerCase('it-IT') : char;
      current.width = (rect.right - origin.left) / zoom - current.x;
    }
  }
  const merged: TextRun[] = [];
  for (const run of runs) {
    run.text = run.text.replace(/\s+/g, ' ');
    const previous = merged[merged.length - 1];
    const gap = previous ? run.x - previous.x - previous.width : Infinity;
    if (previous && Math.abs(previous.y - run.y) < 1 && previous.fontSize === run.fontSize && previous.fontFamily === run.fontFamily && previous.fontWeight === run.fontWeight && gap >= -1 && gap < run.fontSize) {
      previous.text += gap > 1 && !/\s$/.test(previous.text) && !/^\s/.test(run.text) ? ` ${run.text}` : run.text;
      previous.width = run.x + run.width - previous.x;
    } else merged.push(run);
  }
  return merged.filter((run) => run.text.trim());
}
