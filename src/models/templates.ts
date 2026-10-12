import type { CVDocument } from './cv';
import { createStarterDocument } from './createBlock';
import { singleRow } from '../utils/layout';

export const cvTemplates = [
  { id: 'essential', name: 'Essenziale', description: 'Una colonna, lettura immediata.', columns: [100], color: '#334155' },
  { id: 'professional', name: 'Professionale', description: 'Percorso in evidenza, competenze a lato.', columns: [65, 35], color: '#315d91' },
  { id: 'creative', name: 'Creativo', description: 'Titoli vivaci e sezioni affiancate.', columns: [50, 50], color: '#7c3aed' },
] as const;
export type TemplateId = typeof cvTemplates[number]['id'];

export function createTemplate(id: TemplateId): CVDocument {
  const template = cvTemplates.find((item) => item.id === id)!;
  const document = createStarterDocument();
  const blocks = document.rows.flatMap((row) => row.columns.flatMap((column) => column.blocks));
  blocks.forEach((block) => { block.id = crypto.randomUUID(); });
  const [personal, experience, education, skills] = blocks;
  if (skills.type === 'skills') skills.data.layout = 'list';
  document.name = `CV ${template.name}`;
  document.globalStyle.accentColor = template.color;
  if (id === 'essential') {
    document.globalStyle.fontFamily = 'Arial';
    document.rows = blocks.map((block) => singleRow([block]));
  } else {
    document.rows = [singleRow([personal]), {
      id: crypto.randomUUID(), columns: [
        { id: crypto.randomUUID(), width: template.columns[0], blocks: [experience, education] },
        { id: crypto.randomUUID(), width: template.columns[1] ?? 35, blocks: [skills] },
      ],
    }];
    if (id === 'creative') {
      document.globalStyle.fontFamily = 'Georgia';
      skills.style.backgroundColor = '#f3eefe';
    }
  }
  return document;
}
