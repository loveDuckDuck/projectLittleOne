import type { BlockHeaderStyle, CVBlock, CVBlockType, CVDocument } from './cv';
import { initialDocument } from '../store/initialDocument';
import { singleRow } from '../utils/layout';

export function createBlock(type: CVBlockType): CVBlock {
  const base = { id: crypto.randomUUID(), style: { marginBottom: 12 } };
  const header = (title: string, icon: string): BlockHeaderStyle => ({ title, showIcon: false, icon, iconPosition: 'left', iconSize: 16, iconGap: 7, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', textAlign: 'left', bottomBorder: true, dividerLine: false, spacingAbove: 0, spacingBelow: 10 });
  switch (type) {
    case 'personal': return { ...base, type, data: { firstName: 'Nome', lastName: 'Cognome', professionalTitle: 'Titolo professionale', email: '', phone: '', city: '', country: '', linkedIn: '', github: '', website: '', summary: '', photoSrc: '', photoPosition: 'left', photoShape: 'circle', photoSize: 112 } };
    case 'text': return { ...base, type, data: { text: 'Scrivi qui il tuo testo.' } };
    case 'heading': return { ...base, type, data: { text: 'Nuova sezione', level: 2, uppercase: true, underline: false, accentLine: true } };
    case 'experience': return { ...base, style: { ...base.style, header: header('Esperienza professionale', 'briefcase') }, type, data: { title: 'Ruolo', company: 'Azienda', location: '', startDate: '', endDate: '', current: false, description: '', bullets: ['Descrivi un risultato importante'] } };
    case 'education': return { ...base, style: { ...base.style, header: header('Formazione', 'graduation-cap') }, type, data: { degree: 'Titolo di studio', school: 'Istituto', location: '', startDate: '', endDate: '', description: '', bullets: ['Risultato o approfondimento'] } };
    case 'bulletList': return { ...base, type, data: { items: ['Primo punto'], marker: 'disc' } };
    case 'skills': return { ...base, style: { ...base.style, header: header('Competenze', 'code') }, type, data: { layout: 'rated', items: ['Competenza'], ratings: [3], columns: 2, groups: [{ name: 'Categoria', items: ['Competenza'] }] } };
    case 'hobbies': return { ...base, style: { ...base.style, header: header('Hobby', 'user') }, type, data: { items: [''] } };
    case 'languages': return { ...base, style: { ...base.style, header: header('Lingue', 'languages') }, type, data: { items: [{ language: 'Italiano', spoken: 'Madrelingua', written: 'Madrelingua' }] } };
    case 'projects': return { ...base, style: { ...base.style, header: header('Progetti', 'folder') }, type, data: { title: 'Progetto', role: '', dates: '', description: '', url: '', bullets: ['Risultato del progetto'] } };
    case 'certifications': return { ...base, style: { ...base.style, header: header('Certificazioni', 'award') }, type, data: { title: 'Certificazione', issuer: 'Ente', date: '', url: '' } };
    case 'divider': return { ...base, type, data: { thickness: 1, width: 100 } };
    case 'spacer': return { ...base, type, data: { height: 20 } };
    case 'image': return { ...base, type, data: { src: '', alt: '', width: 100, height: 0, fit: 'contain' } };
    case 'custom': return { ...base, style: { ...base.style, header: header('Sezione personalizzata', 'book-open') }, type, data: { title: 'Sezione personalizzata', body: 'Scrivi qui il contenuto.', bullets: [] } };
  }
}

export function createStarterDocument(empty = false): CVDocument {
  if (empty) return { version: 2, globalStyle: { ...initialDocument.globalStyle }, rows: [] };
  const source = structuredClone(initialDocument.blocks);
  const blocks: CVBlock[] = [];
  for (let index = 0; index < source.length; index += 1) {
    const block = source[index];
    const next = source[index + 1];
    if (block.type === 'heading' && next && ['experience', 'education', 'skills', 'languages', 'projects', 'certifications'].includes(next.type)) {
      const header = createBlock(next.type).style.header;
      if (header) next.style.header = { ...header, title: block.data.text, textTransform: block.data.uppercase ? 'uppercase' : 'none', bottomBorder: block.data.accentLine };
    } else blocks.push(block);
  }
  return { version: 2, globalStyle: { ...initialDocument.globalStyle }, rows: blocks.map((block) => singleRow([block])) };
}
