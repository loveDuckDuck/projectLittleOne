import { useEffect, useRef, type CSSProperties } from 'react';
import { cvTemplates, type TemplateId } from '../../models/templates';

export function NewCVDialog({ onCreate, onClose }: { onCreate: (template: TemplateId | 'empty') => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="new-cv-dialog template-dialog" aria-labelledby="new-cv-title" onClose={onClose}>
    <h2 id="new-cv-title">Scegli come iniziare</h2>
    <p>Ogni nuovo CV è un progetto separato. Ritrovi quelli precedenti in «I miei CV».</p>
    <div className="template-grid">{cvTemplates.map((template) => <button type="button" className="template-card" key={template.id} onClick={() => onCreate(template.id)}>
      <span className="template-thumbnail" aria-hidden="true" style={{ '--template-color': template.color } as CSSProperties}>
        <span className="template-name-line" /><span className="template-contact-line" />
        <span className="template-columns" style={{ gridTemplateColumns: template.columns.map((width) => `${width}fr`).join(' ') }}>{template.columns.map((_, index) => <span className="template-column" key={index}><i /><i /><i /><i /><i /></span>)}</span>
      </span><strong>{template.name}</strong><span>{template.description}</span>
    </button>)}</div>
    <div className="dialog-actions"><button type="button" onClick={onClose}>Chiudi</button><button type="button" onClick={() => onCreate('empty')}>Parti da un CV vuoto</button></div>
  </dialog>;
}
