import type { CSSProperties } from 'react';
import { BriefcaseBusiness, FolderGit2, Globe2, Mail, MapPin, Phone } from 'lucide-react';
import type { CVBlock } from '../../models/cv';
import { cvIcons } from '../../utils/icons';
import { colorWithOpacity } from '../../utils/color';
import { backgroundImageStyle } from '../../utils/background';
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

function dateRange(start: string, end: string, current = false): string {
  return [formatMonth(start), current ? 'Presente' : formatMonth(end)].filter(Boolean).join(' — ');
}

function content(block: CVBlock, editable = false, onEditText?: (value: string) => void) {
  switch (block.type) {
    case 'personal': {
      const d = block.data;
      const contacts = [
        { value: d.email, label: 'Email', Icon: Mail },
        { value: d.phone, label: 'Telefono', Icon: Phone },
        { value: [d.city, d.country].filter(Boolean).join(', '), label: 'Posizione', Icon: MapPin },
        { value: d.website, label: 'Sito web', Icon: Globe2 },
        { value: d.linkedIn, label: 'LinkedIn', Icon: BriefcaseBusiness },
        { value: d.github, label: 'GitHub', Icon: FolderGit2 },
      ].filter((item) => item.value);
      const name = [d.firstName, d.lastName].filter(Boolean).join(' ');
      const photo = d.photoSrc && <span className={`profile-photo-frame cv-profile-photo photo-shape-${d.photoShape}`} style={{ '--profile-photo-size': `${d.photoSize}px` } as CSSProperties}><img src={d.photoSrc} alt={`Foto profilo di ${name || 'questa persona'}`} /></span>;
      return <div className="cv-personal">
        <div className={`cv-personal-layout ${photo ? `has-photo photo-${d.photoPosition}` : ''}`}>
          {d.photoPosition === 'left' && photo}
          <div className="cv-personal-copy">
            <div className="cv-personal-identity"><h1>{name}</h1>{d.professionalTitle && <p className="cv-role">{d.professionalTitle}</p>}</div>
            {contacts.length > 0 && (d.contactsLayout === 'list'
              ? <ul className="cv-contacts cv-contacts-list" role="list" style={{ gridTemplateColumns: `repeat(${d.contactsColumns}, minmax(0, 1fr))` }}>{contacts.map(({ value, label, Icon }) => <li className="cv-contact" key={label} aria-label={`${label}: ${value}`}><Icon size={13} strokeWidth={1.8} aria-hidden="true" /><span>{value}</span></li>)}</ul>
              : <div className="cv-contacts cv-contacts-inline">{contacts.map(({ value, label, Icon }, index) => <span className="cv-contact" key={label} aria-label={`${label}: ${value}`}><Icon size={13} strokeWidth={1.8} aria-hidden="true" /><span>{value}</span>{index < contacts.length - 1 && <span className="cv-contact-separator" aria-hidden="true">·</span>}</span>)}</div>)}
            {d.summary && <p className="cv-summary">{d.summary}</p>}
          </div>
          {d.photoPosition === 'right' && photo}
        </div>
      </div>;
    }
    case 'heading':
      return <h2 className={`cv-heading level-${block.data.level} ${block.data.accentLine ? 'has-accent-line' : ''} ${block.data.uppercase ? 'is-uppercase' : ''} ${block.data.underline ? 'is-underlined' : ''}`} contentEditable={editable} suppressContentEditableWarning onBlur={editable ? (event) => onEditText?.(event.currentTarget.innerText) : undefined} onKeyDown={editable ? (event) => { if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); } } : undefined} role={editable ? 'textbox' : undefined} aria-label={editable ? 'Modifica titolo' : undefined}>{block.data.text}</h2>;
    case 'text':
      return <p className="cv-paragraph" contentEditable={editable} suppressContentEditableWarning onBlur={editable ? (event) => onEditText?.(event.currentTarget.innerText) : undefined} role={editable ? 'textbox' : undefined} aria-label={editable ? 'Modifica testo' : undefined}>{block.data.text}</p>;
    case 'experience': {
      const d = block.data;
      return <section className="cv-entry"><div className="cv-entry-top"><h3>{d.title}</h3><span>{dateRange(d.startDate, d.endDate, d.current)}</span></div><p className="cv-entry-meta">{[d.company, d.location].filter(Boolean).join(' — ')}</p>{d.description && <p>{d.description}</p>}{d.bullets.length > 0 && <ul>{d.bullets.map((item, index) => <li key={index}>{item}</li>)}</ul>}</section>;
    }
    case 'education': {
      const d = block.data;
      return <section className="cv-entry"><div className="cv-entry-top"><h3>{d.degree}</h3><span>{dateRange(d.startDate, d.endDate)}</span></div><p className="cv-entry-meta">{[d.school, d.location].filter(Boolean).join(' — ')}</p>{d.description && <p>{d.description}</p>}{d.bullets.length > 0 && <ul>{d.bullets.map((item, index) => <li key={index}>{item}</li>)}</ul>}</section>;
    }
    case 'bulletList':
      return <ul className={`cv-list marker-${block.data.marker}`}>{block.data.items.map((item, index) => <li key={index}>{item}</li>)}</ul>;
    case 'skills': {
      const d = block.data;
      if (d.layout === 'grouped') return <div className="cv-skills-groups">{d.groups.map((group, index) => <p key={index}><strong>{group.name}</strong> {group.items.join(' · ')}</p>)}</div>;
      if (d.layout === 'rated') return <div className="cv-skills-grid" style={{ gridTemplateColumns: `repeat(${d.columns}, minmax(0, 1fr))` }}>{d.items.map((item, index) => item && <div className="cv-skill-rated" key={index}><span>{item}</span><RatingDots value={d.ratings[index] ?? 3} /></div>)}</div>;
      if (d.layout === 'list') return <ul className="cv-list cv-skills-grid" style={{ gridTemplateColumns: `repeat(${d.columns}, minmax(0, 1fr))` }}>{d.items.filter(Boolean).map((item, index) => <li key={index}>{item}</li>)}</ul>;
      return <p className="cv-skills">{d.items.filter(Boolean).join('  ·  ')}</p>;
    }
    case 'hobbies':
      return <section className="cv-hobbies">{!block.style.header && <h2 className="cv-heading is-uppercase has-accent-line">Hobby</h2>}{block.data.items.some(Boolean) && <p>{block.data.items.filter(Boolean).join('  ·  ')}</p>}</section>;
    case 'languages': {
      const items = block.data.items.filter((item) => item.language);
      return items.length > 0 && <table className="cv-languages-table">
        <colgroup><col className="cv-language-name-column" /><col /><col /></colgroup>
        <thead><tr><th scope="col"><span className="visually-hidden">Lingua</span></th><th scope="col">Parlato</th><th scope="col">Scritto</th></tr></thead>
        <tbody>{items.map((item, index) => <tr key={index}><th scope="row">{item.language}</th><td>{item.spoken || '—'}</td><td>{item.written || '—'}</td></tr>)}</tbody>
      </table>;
    }
    case 'projects':
      return <section className="cv-entry"><div className="cv-entry-top"><h3>{block.data.title}</h3><span>{block.data.dates}</span></div>{block.data.role && <p className="cv-entry-meta">{block.data.role}</p>}{block.data.description && <p>{block.data.description}</p>}{block.data.url && <p className="cv-entry-link">{block.data.url}</p>}{block.data.bullets.length > 0 && <ul>{block.data.bullets.map((item, index) => <li key={index}>{item}</li>)}</ul>}</section>;
    case 'certifications':
      return <p><strong>{block.data.title}</strong>{block.data.issuer && <> · {block.data.issuer}</>}{block.data.date && <> · {block.data.date}</>}{block.data.url && <> · {block.data.url}</>}</p>;
    case 'divider':
      return <hr style={{ borderTopWidth: block.data.thickness, width: `${block.data.width}%` }} />;
    case 'spacer':
      return <div style={{ height: block.data.height }} aria-hidden="true" />;
    case 'image':
      return block.data.src ? <img className="cv-image" src={block.data.src} alt={block.data.alt} style={{ width: `${block.data.width}%`, height: block.data.height || 'auto', objectFit: block.data.fit }} /> : <div className="cv-image-placeholder">Seleziona il blocco e carica un’immagine</div>;
    case 'custom':
      return <section className="cv-entry">{!block.style.header && <h3>{block.data.title}</h3>}{block.data.body && <p>{block.data.body}</p>}{block.data.bullets.filter(Boolean).length > 0 && <ul>{block.data.bullets.filter(Boolean).map((item, index) => <li key={index}>{item}</li>)}</ul>}</section>;
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
      {header && header.title && <div className={`cv-section-header ${header.bottomBorder ? 'has-border' : ''} ${header.dividerLine ? 'has-divider' : ''}`} style={{ fontSize: `${header.fontSize}pt`, fontWeight: header.fontWeight, textTransform: header.textTransform, textAlign: header.textAlign, color: header.color ?? block.style.accentColor ?? 'var(--cv-accent)', backgroundColor: header.backgroundColor, marginTop: header.spacingAbove, marginBottom: header.spacingBelow, '--icon-gap': `${header.iconGap}px` } as CSSProperties}>
        <span className={`cv-section-header-content icon-${header.iconPosition}`}>{Icon && <Icon aria-hidden="true" size={header.iconSize} strokeWidth={1.8} color={header.iconColor ?? header.color ?? block.style.accentColor ?? 'var(--cv-accent)'} />}<span>{header.title}</span></span>
      </div>}
      {content(block, editable, onEditText)}
    </div>
  );
}
