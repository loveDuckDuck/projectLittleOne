import type { CSSProperties } from 'react';
import { BriefcaseBusiness, FolderGit2, Globe2, Mail, MapPin, Phone } from 'lucide-react';
import type { CVBlock } from '../../models/cv';
import { cvIcons } from '../../utils/icons';
import { colorWithOpacity } from '../../utils/color';
import { backgroundImageStyle } from '../../utils/background';
import { safeLink } from '../../utils/links';
import { RatingDots } from './RatingDots';

interface BlockPreviewProps {
  block: CVBlock;
  editable?: boolean;
  onEditText?: (value: string) => void;
  backgroundOnParent?: boolean;
}

function formatMonth(value: string): string {
  if (!value) return '';
  const [year, month] = value.split('-').map(Number);
  if (!year || !month) return value;
  return new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1));
}

function DateRange({ start, end, current = false }: { start: string; end: string; current?: boolean }) {
  return <><span data-edit-field="Da">{formatMonth(start)}</span>{start && (end || current) && ' — '}<span data-edit-field={current ? 'Lavoro qui attualmente' : 'A'}>{current ? 'Presente' : formatMonth(end)}</span></>;
}

function content(block: CVBlock, editable = false, onEditText?: (value: string) => void) {
  switch (block.type) {
    case 'personal': {
      const d = block.data;
      const contacts = [
        { value: d.email, label: 'Email', href: safeLink(d.email, 'email'), Icon: Mail },
        { value: d.phone, label: 'Telefono', href: safeLink(d.phone, 'phone'), Icon: Phone },
        { value: [d.city, d.country].filter(Boolean).join(', '), label: 'Città', href: undefined, Icon: MapPin },
        { value: d.website, label: 'Sito web', href: safeLink(d.website), Icon: Globe2 },
        { value: d.linkedIn, label: 'LinkedIn', href: safeLink(d.linkedIn), Icon: BriefcaseBusiness },
        { value: d.github, label: 'GitHub', href: safeLink(d.github), Icon: FolderGit2 },
      ].filter((item) => item.value);
      const name = [d.firstName, d.lastName].filter(Boolean).join(' ');
      const showIcons = block.style.showContactIcons !== false;
      const contactLayout = block.style.contactLayout;
      const contactsAsList = contactLayout ? contactLayout !== 'inline' : d.contactsLayout === 'list';
      const contactColumns = contactLayout && contactLayout !== 'inline' ? Number(contactLayout) : d.contactsColumns;
      const photo = d.photoSrc && <span data-edit-field="Carica foto (PNG, JPG, WebP)" className={`profile-photo-frame cv-profile-photo photo-shape-${d.photoShape}`} style={{ '--profile-photo-size': `${d.photoSize}px` } as CSSProperties}><img src={d.photoSrc} alt={`Foto profilo di ${name || 'questa persona'}`} /></span>;
      return <div className="cv-personal">
        <div className={`cv-personal-layout ${photo ? `has-photo photo-${d.photoPosition}` : ''}`}>
          {d.photoPosition === 'left' && photo}
          <div className="cv-personal-copy">
            <div className="cv-personal-identity"><h1><span data-edit-field="Nome">{d.firstName}</span>{' '}<span data-edit-field="Cognome">{d.lastName}</span></h1>{d.professionalTitle && <p className="cv-role" data-edit-field="Titolo professionale">{d.professionalTitle}</p>}</div>
            {contacts.length > 0 && (contactsAsList
              ? <ul className="cv-contacts cv-contacts-list" role="list" style={{ gridTemplateColumns: `repeat(${contactColumns}, minmax(0, 1fr))` }}>{contacts.map(({ value, label, href, Icon }) => <li className="cv-contact" key={label} data-edit-field={label} aria-label={`${label}: ${value}`}>{showIcons && <Icon size={13} strokeWidth={1.8} aria-hidden="true" />}<span>{href ? <a href={href}>{value}</a> : value}</span></li>)}</ul>
              : <div className="cv-contacts cv-contacts-inline">{contacts.map(({ value, label, href, Icon }, index) => <span className="cv-contact" key={label} data-edit-field={label} aria-label={`${label}: ${value}`}>{showIcons && <Icon size={13} strokeWidth={1.8} aria-hidden="true" />}<span>{href ? <a href={href}>{value}</a> : value}</span>{index < contacts.length - 1 && <span className="cv-contact-separator" aria-hidden="true">·</span>}</span>)}</div>)}
            {d.summary && <p className="cv-summary" data-edit-field="Profilo">{d.summary}</p>}
          </div>
          {d.photoPosition === 'right' && photo}
        </div>
      </div>;
    }
    case 'heading':
      return <h2 data-edit-field="Titolo" className={`cv-heading level-${block.data.level} ${block.data.accentLine ? 'has-accent-line' : ''} ${block.data.uppercase ? 'is-uppercase' : ''} ${block.data.underline ? 'is-underlined' : ''}`} contentEditable={editable} suppressContentEditableWarning onBlur={editable ? (event) => onEditText?.(event.currentTarget.innerText) : undefined} onKeyDown={editable ? (event) => { if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); } } : undefined} role={editable ? 'textbox' : undefined} aria-label={editable ? 'Modifica titolo' : undefined}>{block.data.text}</h2>;
    case 'text':
      return <p data-edit-field="Testo" className="cv-paragraph" contentEditable={editable} suppressContentEditableWarning onBlur={editable ? (event) => onEditText?.(event.currentTarget.innerText) : undefined} role={editable ? 'textbox' : undefined} aria-label={editable ? 'Modifica testo' : undefined}>{block.data.text}</p>;
    case 'experience': {
      const d = block.data;
      return <section className="cv-entry"><div className="cv-entry-top"><h3 data-edit-field="Ruolo">{d.title}</h3><span data-edit-field="Da"><DateRange start={d.startDate} end={d.endDate} current={d.current} /></span></div><p className="cv-entry-meta"><span data-edit-field="Azienda">{d.company}</span>{d.location && <> — <span data-edit-field="Luogo">{d.location}</span></>}</p>{d.description && <p data-edit-field="Descrizione">{d.description}</p>}{d.bullets.length > 0 && <ul>{d.bullets.map((item, index) => <li data-edit-field={`Risultati ${index + 1}`} key={index}>{item}</li>)}</ul>}</section>;
    }
    case 'education': {
      const d = block.data;
      return <section className="cv-entry"><div className="cv-entry-top"><h3 data-edit-field="Titolo di studio">{d.degree}</h3><span data-edit-field="Da"><DateRange start={d.startDate} end={d.endDate} /></span></div><p className="cv-entry-meta"><span data-edit-field="Istituto">{d.school}</span>{d.location && <> — <span data-edit-field="Luogo">{d.location}</span></>}</p>{d.description && <p data-edit-field="Descrizione">{d.description}</p>}{d.bullets.length > 0 && <ul>{d.bullets.map((item, index) => <li data-edit-field={`Punti ${index + 1}`} key={index}>{item}</li>)}</ul>}</section>;
    }
    case 'bulletList':
      return <ul className={`cv-list marker-${block.data.marker}`}>{block.data.items.map((item, index) => <li data-edit-field={`Punti ${index + 1}`} key={index}>{item}</li>)}</ul>;
    case 'skills': {
      const d = block.data;
      if (d.layout === 'grouped') return <div className="cv-skills-groups">{d.groups.map((group, index) => <p data-edit-field="Gruppi (Categoria: voce, voce)" key={index}><strong>{group.name}</strong> {group.items.join(' · ')}</p>)}</div>;
      if (d.layout === 'rated') return <div className="cv-skills-grid" style={{ gridTemplateColumns: `repeat(${d.columns}, minmax(0, 1fr))` }}>{d.items.map((item, index) => item && <div className="cv-skill-rated" data-edit-field={`Competenza ${index + 1}`} key={index}><span data-edit-field={`Competenza ${index + 1}`}>{item}</span><RatingDots value={d.ratings[index] ?? 3} /></div>)}</div>;
      if (d.layout === 'list') return <ul className="cv-list cv-skills-grid" style={{ gridTemplateColumns: `repeat(${d.columns}, minmax(0, 1fr))` }}>{d.items.map((item, index) => item && <li data-edit-field={`Competenza ${index + 1}`} key={index}>{item}</li>)}</ul>;
      return <p data-edit-field="Competenza 1" className="cv-skills">{d.items.filter(Boolean).join('  ·  ')}</p>;
    }
    case 'hobbies':
      return <section className="cv-hobbies">{!block.style.header && <h2 className="cv-heading is-uppercase has-accent-line">Hobby</h2>}{block.data.items.some(Boolean) && <p data-edit-field="Hobby 1">{block.data.items.filter(Boolean).join('  ·  ')}</p>}</section>;
    case 'languages': {
      const items = block.data.items.filter((item) => item.language);
      return items.length > 0 && <table className="cv-languages-table">
        <colgroup><col className="cv-language-name-column" /><col /><col /></colgroup>
        <thead><tr><th scope="col"><span className="visually-hidden">Lingua</span></th><th scope="col">Parlato</th><th scope="col">Scritto</th></tr></thead>
        <tbody>{items.map((item, index) => <tr key={index}><th scope="row" data-edit-field={`Nome nella lingua originale|${index}`}>{item.language}</th><td data-edit-field={`Parlato|${index}`}>{item.spoken || '—'}</td><td data-edit-field={`Scritto|${index}`}>{item.written || '—'}</td></tr>)}</tbody>
      </table>;
    }
    case 'projects':
      return <section className="cv-entry"><div className="cv-entry-top"><h3 data-edit-field="Titolo">{block.data.title}</h3><span data-edit-field="Date">{block.data.dates}</span></div>{block.data.role && <p className="cv-entry-meta" data-edit-field="Ruolo">{block.data.role}</p>}{block.data.description && <p data-edit-field="Descrizione">{block.data.description}</p>}{block.data.url && <p className="cv-entry-link" data-edit-field="URL"><a href={safeLink(block.data.url)}>{block.data.url}</a></p>}{block.data.bullets.length > 0 && <ul>{block.data.bullets.map((item, index) => <li data-edit-field={`Risultati ${index + 1}`} key={index}>{item}</li>)}</ul>}</section>;
    case 'certifications':
      return <p><strong data-edit-field="Titolo">{block.data.title}</strong>{block.data.issuer && <> · <span data-edit-field="Ente">{block.data.issuer}</span></>}{block.data.date && <> · <span data-edit-field="Data">{block.data.date}</span></>}{block.data.url && <> · <a data-edit-field="URL" href={safeLink(block.data.url)}>{block.data.url}</a></>}</p>;
    case 'divider':
      return <hr style={{ borderTopWidth: block.data.thickness, width: `${block.data.width}%` }} />;
    case 'spacer':
      return <div style={{ height: block.data.height }} aria-hidden="true" />;
    case 'image':
      return block.data.src ? <img data-edit-field="Carica immagine (PNG, JPG, WebP)" className="cv-image" src={block.data.src} alt={block.data.alt} style={{ width: `${block.data.width}%`, height: block.data.height || 'auto', objectFit: block.data.fit }} /> : <div className="cv-image-placeholder">Seleziona questa sezione per caricare un’immagine</div>;
    case 'custom':
      return <section className="cv-entry">{!block.style.header && <h3 data-edit-field="Titolo">{block.data.title}</h3>}{block.data.body && <p data-edit-field="Contenuto">{block.data.body}</p>}{block.data.bullets.filter(Boolean).length > 0 && <ul>{block.data.bullets.filter(Boolean).map((item, index) => <li data-edit-field={`Elenco puntato ${index + 1}`} key={index}>{item}</li>)}</ul>}</section>;
  }
}

export function BlockPreview({ block, editable = false, onEditText, backgroundOnParent = false }: BlockPreviewProps) {
  const header = block.style.header;
  const Icon = header?.showIcon && header.icon ? cvIcons[header.icon] : undefined;
  const style: CSSProperties = {
    fontSize: block.style.fontSize ? `${block.style.fontSize}pt` : undefined,
    fontWeight: block.style.fontWeight,
    textAlign: block.style.textAlign,
    lineHeight: block.style.lineHeight,
    marginTop: block.style.marginTop ? `${block.style.marginTop}px` : undefined,
    marginBottom: block.style.marginBottom ? `${block.style.marginBottom}px` : undefined,
    color: block.style.textColor,
    fontFamily: block.style.fontFamily,
    backgroundColor: !backgroundOnParent && block.style.backgroundColor ? colorWithOpacity(block.style.backgroundColor, block.style.backgroundOpacity) : undefined,
    padding: !backgroundOnParent && (block.style.backgroundColor || block.style.backgroundImage) ? '8px' : undefined,
    '--block-accent': block.style.accentColor,
  } as CSSProperties;

  return (
    <div className="cv-block" style={style}>
      {!backgroundOnParent && block.style.backgroundImage && <span className="block-background-image" aria-hidden="true" style={{ ...backgroundImageStyle(block.style.backgroundImage, block.style.backgroundMode), opacity: (block.style.backgroundOpacity ?? 100) / 100 }} />}
      {header && header.title && <div data-edit-field="Intestazione" className={`cv-section-header ${header.bottomBorder ? 'has-border' : ''} ${header.dividerLine ? 'has-divider' : ''}`} style={{ fontSize: `${header.fontSize}pt`, fontWeight: header.fontWeight, textTransform: header.textTransform, textAlign: header.textAlign, color: header.color ?? block.style.accentColor ?? 'var(--cv-accent)', backgroundColor: header.backgroundColor, marginTop: header.spacingAbove, marginBottom: header.spacingBelow, '--icon-gap': `${header.iconGap}px` } as CSSProperties}>
        <span className={`cv-section-header-content icon-${header.iconPosition}`}>{Icon && <Icon aria-hidden="true" size={header.iconSize} strokeWidth={1.8} color={header.iconColor ?? header.color ?? block.style.accentColor ?? 'var(--cv-accent)'} />}<span>{header.title}</span></span>
      </div>}
      {content(block, editable, onEditText)}
    </div>
  );
}
