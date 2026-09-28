import { paginate } from './pagination';

export async function exportPdf(): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const area = document.getElementById('cv-print-area');
  if (!area) throw new Error('Anteprima del CV non trovata.');
  await document.fonts.ready;
  const canvas = await html2canvas(area, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
    onclone: (clonedDocument) => {
      const copy = clonedDocument.getElementById('cv-print-area');
      copy?.classList.add('pdf-export');
      copy?.style.setProperty('zoom', '1', 'important');
    },
  });

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const pageHeight = Math.round(canvas.width * 297 / 210);
  const marginMm = Number.parseFloat(area.style.padding) || 19;
  const marginPx = Math.round(canvas.width * marginMm / 210);
  const scale = canvas.width / area.offsetWidth;
  const rows = Array.from(area.querySelectorAll<HTMLElement>('.cv-row')).map((row) => ({ top: row.offsetTop * scale, bottom: (row.offsetTop + row.offsetHeight) * scale }));
  const contentEnd = rows.length ? Math.min(canvas.height, Math.max(...rows.map((row) => row.bottom)) + marginPx) : marginPx;
  const slices = paginate(pageHeight, marginPx, contentEnd, rows);

  for (let page = 0; page < slices.length; page += 1) {
    const slice = document.createElement('canvas');
    slice.width = canvas.width;
    slice.height = pageHeight;
    const context = slice.getContext('2d');
    if (!context) throw new Error('Impossibile creare la pagina PDF.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, slice.width, slice.height);
    const sourceY = slices[page].start;
    const copyHeight = Math.min(slices[page].end - sourceY, canvas.height - sourceY);
    if (copyHeight > 0) context.drawImage(canvas, 0, sourceY, canvas.width, copyHeight, 0, marginPx, canvas.width, copyHeight);
    if (page > 0) pdf.addPage();
    pdf.addImage(slice.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, 297);
  }
  pdf.save('curriculum-vitae.pdf');
}
