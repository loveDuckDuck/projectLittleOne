import { useEffect, useState } from 'react';
import type { CVDocument } from '../../models/cv';
import { renderPdf } from '../../utils/exportPdf';

export function PdfPreview({ document }: { document: CVDocument }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [pages, setPages] = useState<Awaited<ReturnType<typeof renderPdf>>['pages']>([]);
  useEffect(() => {
    setUrl(''); setError(''); setPages([]);
    let cancelled = false;
    let objectUrl = '';
    renderPdf(document.name).then(({ pdf, pages }) => {
      if (cancelled) return;
      objectUrl = URL.createObjectURL(pdf.output('blob'));
      setUrl(objectUrl);
      setPages(pages);
    }).catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : 'Anteprima non disponibile.'); });
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [document]);
  return <section className="pdf-preview" aria-label="Anteprima delle pagine PDF">{url
    ? <><p>Queste sono le pagine del PDF, con testo selezionabile e link attivi. <a href={url} target="_blank" rel="noopener noreferrer">Apri PDF</a></p><div className="pdf-preview-pages">{pages.map((page, index) => <figure key={index} className="pdf-preview-page"><figcaption>Pagina {index + 1} di {pages.length}</figcaption><div className="pdf-page-image">
      <img src={page.image} alt={`Pagina ${index + 1} del CV`} />
      {page.text.map((run, i) => <span key={i} className="pdf-preview-text" style={{ left: `${run.x / page.width * 100}%`, top: `${run.y / page.height * 100}%`, width: `${run.width / page.width * 100}%`, height: `${run.height / page.height * 100}%`, fontSize: `${run.fontSize * 4 / 3 / page.width * 100}cqw`, fontFamily: run.fontFamily, fontWeight: run.fontWeight }}>{run.text}</span>)}
      {page.links.map((link, i) => <a key={i} href={link.url} aria-label={link.url} className="pdf-preview-link" style={{ left: `${link.x / page.width * 100}%`, top: `${link.y / page.height * 100}%`, width: `${link.width / page.width * 100}%`, height: `${link.height / page.height * 100}%` }} />)}
    </div></figure>)}</div></>
    : <p role={error ? 'alert' : 'status'}>{error || 'Preparazione delle pagine PDF…'}</p>}</section>;
}
