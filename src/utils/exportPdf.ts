import { measurePages } from './pageGeometry';
import { measureText } from './pdfText';
import { pageBackground } from './color';
import { projectFileName } from './documentStorage';
const fontUrl = new URL('../assets/fonts/NotoSans-Regular.ttf', import.meta.url).href;

let fontData: Promise<string> | undefined;
function loadPdfFont(): Promise<string> {
  if (!fontData) fontData = fetch(fontUrl).then(async (response) => {
    if (!response.ok) throw new Error('Font del PDF non disponibile. Riprova dopo aver ricaricato la pagina.');
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = '';
    for (let start = 0; start < bytes.length; start += 8192) binary += String.fromCharCode(...bytes.subarray(start, start + 8192));
    return btoa(binary);
  }).catch((error) => { fontData = undefined; throw error; });
  return fontData;
}

export async function renderPdf(name = 'Il mio CV') {
  const [{ default: html2canvas }, { jsPDF }, font] = await Promise.all([import('html2canvas'), import('jspdf'), loadPdfFont()]);
  const area = document.getElementById('cv-print-area');
  if (!area) throw new Error('Anteprima del CV non trovata.');
  await document.fonts.ready;
  await Promise.all(Array.from(area.querySelectorAll('img')).map((image) => image.decode().catch(() => undefined)));
  let geometry = measurePages(area);
  let text = measureText(area, geometry.zoom);
  const measureLinks = (source: HTMLElement) => Array.from(source.querySelectorAll<HTMLAnchorElement>('a[href]')).flatMap((link) => Array.from(link.getClientRects()).map((rect) => ({
    url: link.href, x: (rect.left - geometry.bounds.left) / geometry.zoom, y: (rect.top - geometry.bounds.top) / geometry.zoom,
    width: rect.width / geometry.zoom, height: rect.height / geometry.zoom,
  })));
  let links = measureLinks(area);
  const background = getComputedStyle(area).backgroundColor || pageBackground();
  const canvas = await html2canvas(area, {
    backgroundColor: background, scale: 2, useCORS: true,
    onclone: (clonedDocument) => {
      const copy = clonedDocument.getElementById('cv-print-area');
      if (!copy) throw new Error('Impossibile preparare il CV per il PDF.');
      copy.classList.add('pdf-export');
      copy.style.setProperty('zoom', '1', 'important');
      // Measure the clean export after removing editor controls, at the full A4 scale.
      geometry = measurePages(copy);
      text = measureText(copy, geometry.zoom);
      links = measureLinks(copy);
    },
  });
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  pdf.setProperties({ title: name, creator: 'Otter Builder' });
  pdf.addFileToVFS('NotoSans.ttf', font); pdf.addFont('NotoSans.ttf', 'NotoSans', 'normal'); pdf.setFont('NotoSans');
  const mm = 210 / area.offsetWidth;
  const rasterScale = canvas.width / area.offsetWidth;
  const pages = [];
  for (const [page, bounds] of geometry.slices.entries()) {
    const slice = document.createElement('canvas');
    slice.width = canvas.width; slice.height = Math.round(geometry.pageHeight * rasterScale);
    const context = slice.getContext('2d');
    if (!context) throw new Error('Impossibile creare la pagina PDF.');
    context.fillStyle = background; context.fillRect(0, 0, slice.width, slice.height);
    const sourceY = bounds.start * rasterScale;
    const copyHeight = Math.min((bounds.end - bounds.start) * rasterScale, canvas.height - sourceY);
    if (copyHeight > 0) context.drawImage(canvas, 0, sourceY, canvas.width, copyHeight, 0, geometry.margin * rasterScale, canvas.width, copyHeight);
    if (page > 0) pdf.addPage();
    const image = slice.toDataURL('image/jpeg', .95);
    pdf.addImage(image, 'JPEG', 0, 0, 210, 297);
    const pageText = text.filter((run) => run.y + run.height / 2 >= bounds.start && run.y + run.height / 2 < bounds.end).map((run) => ({ ...run, y: run.y - bounds.start + geometry.margin }));
    const pageLinks = links.flatMap((link) => {
      const top = Math.max(link.y, bounds.start); const bottom = Math.min(link.y + link.height, bounds.end);
      return bottom > top ? [{ ...link, y: top - bounds.start + geometry.margin, height: bottom - top }] : [];
    });
    pages.push({ image, text: pageText, links: pageLinks, width: area.offsetWidth, height: geometry.pageHeight });
    // Preserve uploaded fonts, photos and backgrounds visually, with a selectable text layer.
    // Assign a line by its midpoint so no text is duplicated at a page boundary.
    for (const run of pageText) {
      pdf.setFontSize(run.fontSize);
      const width = pdf.getTextWidth(run.text);
      pdf.text(run.text, run.x * mm, run.y * mm, {
        baseline: 'top', renderingMode: 'invisible', horizontalScale: width > 0 ? run.width * mm / width : 1,
      });
    }
    for (const link of pageLinks) {
      pdf.link(link.x * mm, link.y * mm, link.width * mm, link.height * mm, { url: link.url });
    }
  }
  return { pdf, pages };
}

export async function exportPdf(name?: string): Promise<void> {
  const { pdf } = await renderPdf(name);
  pdf.save(`${projectFileName(name)}.pdf`);
}
