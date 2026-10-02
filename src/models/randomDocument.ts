import { createBlock, createStarterDocument } from './createBlock';
import type { CVBlock, CVBlockDataMap, CVBlockType, CVDocument, CVRow } from './cv';
import { STANDARD_FONTS } from '../utils/assets';
import { singleRow } from '../utils/layout';

export interface RandomCVOptions {
  length: 'short' | 'medium' | 'long';
  columns: 'random' | 1 | 2 | 3;
  includePhoto: boolean;
}

export const defaultRandomCVOptions: RandomCVOptions = { length: 'medium', columns: 'random', includePhoto: true };

const careers = [
  {
    role: 'Product Designer', junior: 'UX/UI Designer', degree: 'Design della comunicazione',
    summary: 'Progetto servizi digitali accessibili, dalla ricerca con le persone ai prototipi. Mi piace trasformare problemi complessi in interfacce semplici e collaborare con sviluppo e prodotto.',
    skills: ['Ricerca utenti', 'Prototipazione', 'Design system', 'Accessibilità', 'Figma', 'Test di usabilità'],
    tasks: ['Definizione di flussi e prototipi attraverso interviste e test di usabilità.', 'Creazione di una libreria di componenti condivisa tra design e sviluppo.', 'Revisione dei percorsi di navigazione per migliorare chiarezza e accessibilità.'],
    projects: ['Atlante — biblioteca digitale', 'Spazio Comune — servizi di quartiere'],
    projectBody: 'Ricerca, architettura delle informazioni e prototipo di un servizio pensato per rendere più semplice la consultazione dei contenuti.',
    certificate: 'Laboratorio di progettazione accessibile',
  },
  {
    role: 'Software Engineer', junior: 'Frontend Developer', degree: 'Informatica',
    summary: 'Sviluppo applicazioni web con attenzione ad accessibilità, prestazioni e manutenzione del codice. Seguo il lavoro dalla definizione dei requisiti al rilascio, confrontandomi con team multidisciplinari.',
    skills: ['TypeScript', 'React', 'Node.js', 'SQL', 'Test automatici', 'Git e revisione del codice'],
    tasks: ['Sviluppo di funzionalità web e integrazione con servizi applicativi.', 'Introduzione di test automatici e controlli di qualità prima del rilascio.', 'Ottimizzazione delle schermate con grandi quantità di dati e documentazione delle scelte tecniche.'],
    projects: ['Orizzonte — portale open data', 'Diario Verde — gestione di orti condivisi'],
    projectBody: 'Applicazione dimostrativa con ricerca, filtri e viste accessibili. Sviluppo dei componenti, integrazione dei dati e verifica dei percorsi principali.',
    certificate: 'Percorso di architettura delle applicazioni web',
  },
  {
    role: 'Responsabile comunicazione', junior: 'Content Specialist', degree: 'Scienze della comunicazione',
    summary: 'Creo strategie editoriali e contenuti per raccontare prodotti e servizi in modo chiaro. Unisco scrittura, analisi dei risultati e coordinamento delle attività di comunicazione.',
    skills: ['Strategia editoriale', 'Copywriting', 'SEO', 'Analisi dei dati', 'Newsletter', 'Gestione campagne'],
    tasks: ['Pianificazione del calendario editoriale e coordinamento dei contributi del team.', 'Produzione di contenuti per sito, newsletter e presentazioni aziendali.', 'Analisi dei risultati delle campagne e revisione dei messaggi in base ai riscontri.'],
    projects: ['Voci Vicine — rivista di comunità', 'Tracce — campagna culturale'],
    projectBody: 'Definizione del tono di voce, piano editoriale e produzione di contenuti per un progetto culturale sperimentale.',
    certificate: 'Corso di scrittura e strategia dei contenuti',
  },
  {
    role: 'Project Manager', junior: 'Project Coordinator', degree: 'Ingegneria gestionale',
    summary: 'Coordino progetti e persone con attenzione a tempi, obiettivi e qualità. Traduco le esigenze dei diversi interlocutori in piani di lavoro concreti e rendo visibili priorità e dipendenze.',
    skills: ['Pianificazione', 'Gestione budget', 'Analisi dei rischi', 'Facilitazione', 'Reporting', 'Metodi Agile'],
    tasks: ['Definizione delle attività, delle responsabilità e delle scadenze di progetto.', 'Coordinamento degli incontri operativi e gestione delle dipendenze tra team.', 'Preparazione di report periodici e revisione delle priorità con gli interlocutori.'],
    projects: ['Connessioni — rete di servizi', 'Passo Dopo Passo — programma operativo'],
    projectBody: 'Pianificazione di un programma pilota, organizzazione delle attività e monitoraggio delle consegne attraverso indicatori condivisi.',
    certificate: 'Laboratorio di gestione dei progetti',
  },
] as const;

/** Everything is invented; example.com links and masked phones are intentionally non-personal. */
export function createRandomDocument(options: RandomCVOptions, random: () => number = Math.random): CVDocument {
  const pick = <T,>(items: readonly T[]): T => items[Math.floor(random() * items.length)];
  const career = pick(careers);
  const firstName = pick(['Giulia', 'Luca', 'Marta', 'Andrea', 'Elena', 'Samuele', 'Nora', 'Alessandro']);
  const lastName = pick(['Bellini', 'Riva', 'Moretti', 'De Santis', 'Fontana', 'Sereni', 'Valenti', 'Della Rovere']);
  const city = pick(['Torino', 'Bologna', 'Verona', 'Firenze', 'Genova', 'Trieste']);
  const accent = pick(['#315d91', '#28665b', '#85552e', '#754b84', '#3f556c']);
  const columns = options.columns === 'random' ? pick([1, 2, 3] as const) : options.columns;
  const slug = `${firstName}.${lastName}`.toLowerCase().replaceAll(' ', '-');
  const count = { short: 1, medium: 2, long: 4 }[options.length];
  const document = createStarterDocument(true);
  document.globalStyle = { ...document.globalStyle, fontFamily: pick(STANDARD_FONTS), accentColor: accent, baseFontSize: pick([10, 10.5, 11]), pageMargin: pick([16, 18, 20]), sectionSpacing: pick([10, 12, 14]) };
  const headersWithIcons = random() > 0.35;
  function block<T extends CVBlockType>(type: T, data: Partial<CVBlockDataMap[T]>): CVBlock {
    const result = createBlock(type);
    if (result.style.header) result.style.header.showIcon = headersWithIcons;
    return { ...result, data: { ...result.data, ...data } } as CVBlock;
  }
  const personal = block('personal', {
    firstName, lastName, professionalTitle: career.role, city, country: 'Italia',
    email: `${slug}@example.com`, phone: '+39 000 000 0000', website: `https://example.com/${slug}`,
    linkedIn: options.length === 'short' ? '' : `https://example.com/profilo/${slug}`,
    github: career.role === 'Software Engineer' ? `https://example.com/codice/${slug}` : '',
    summary: career.summary,
    contactsLayout: pick(['inline', 'list'] as const), contactsColumns: pick([1, 2, 3] as const),
    photoSrc: options.includePhoto ? createDemoAvatar(accent, pick(['#e6edf5', '#eee8e0', '#e1eeea'])) : '',
    photoShape: pick(['circle', 'rounded', 'arch', 'portrait'] as const), photoPosition: pick(['left', 'right'] as const), photoSize: pick([96, 112, 128]),
  });
  const companies = ['Studio Lume', 'Officina Quercia', 'Laboratorio Prisma', 'Atelier Vela'];
  const companyOffset = Math.floor(random() * companies.length);
  const experiences = Array.from({ length: count }, (_, index) => {
    const entry = block('experience', {
      title: index === 0 ? career.role : career.junior,
      company: `${companies[(index + companyOffset) % companies.length]} (azienda fittizia)`, location: city,
      startDate: `${2024 - index * 3}-03`, endDate: index === 0 ? '' : `${2027 - index * 3}-02`, current: index === 0,
      description: pick(['Collaborazione con un team multidisciplinare su servizi e prodotti digitali.', 'Gestione delle attività dalla raccolta delle esigenze alla consegna del progetto.', 'Partecipazione a progetti sperimentali con obiettivi e revisioni periodiche.']),
      bullets: [...career.tasks.slice(0, options.length === 'short' ? 1 : options.length === 'medium' ? 2 : 3)],
    });
    if (index > 0) delete entry.style.header;
    return entry;
  });
  const education = block('education', { degree: `Laurea in ${career.degree}`, school: 'Istituto universitario Aurora (fittizio)', location: city, startDate: '2011-09', endDate: '2014-07', description: options.length === 'short' ? '' : 'Percorso con laboratori applicati, progetti di gruppo e un elaborato finale sperimentale.', bullets: [] });
  const skills = block('skills', { layout: pick(['inline', 'list', 'rated'] as const), items: [...career.skills], ratings: career.skills.map(() => pick([3, 3.5, 4, 4.5, 5])), columns: columns === 1 ? 2 : 1, groups: [] });
  const languages = block('languages', { items: [{ language: 'Italiano', spoken: 'Madrelingua', written: 'Madrelingua' }, { language: 'English', spoken: pick(['B2', 'C1']), written: 'B2' }, ...(options.length === 'long' ? [{ language: 'Español', spoken: 'B1', written: 'A2' }] : [])] });
  const hobbies = block('hobbies', { items: pick([['Fotografia', 'Escursionismo', 'Lettura'], ['Illustrazione', 'Cinema', 'Cucina'], ['Musica', 'Ciclismo', 'Volontariato']]) });
  const projects = career.projects.slice(0, options.length === 'long' ? 2 : 1).map((title, index) => {
    const entry = block('projects', { title, role: career.role, dates: `${2025 - index}`, description: career.projectBody, url: `https://example.com/progetti/demo-${index + 1}`, bullets: options.length === 'long' ? ['Raccolta dei riscontri e documentazione dei risultati.', 'Presentazione finale con materiali e indicazioni per gli sviluppi successivi.'] : [] });
    if (index > 0) delete entry.style.header;
    return entry;
  });
  const certificate = block('certifications', { title: career.certificate, issuer: 'Accademia Faro (fittizia)', date: '2023', url: '' });
  const notice = block('text', { text: 'CV dimostrativo · Identità, contatti, aziende e percorsi sono inventati.' });
  notice.style = { fontSize: 8, textColor: '#64738a', marginTop: 12 };
  const columnRow = (groups: CVBlock[][], widths: number[]): CVRow => ({ id: crypto.randomUUID(), columns: groups.map((blocks, index) => ({ id: crypto.randomUUID(), width: widths[index], blocks })) });
  document.rows = [singleRow([personal])];
  if (columns === 2) {
    document.rows.push(columnRow([[...experiences.slice(0, 2)], [education, skills, languages]], [65, 35]));
    document.rows.push(...experiences.slice(2).map((entry) => singleRow([entry])));
    if (options.length !== 'short') document.rows.push(...projects.map((entry) => singleRow([entry])));
    document.rows.push(singleRow([hobbies]));
  } else {
    document.rows.push(...experiences.map((entry) => singleRow([entry])), singleRow([education]));
    if (columns === 3) document.rows.push(columnRow([[skills], [languages], [hobbies]], [34, 33, 33]));
    else document.rows.push(...[skills, languages, hobbies].map((entry) => singleRow([entry])));
    if (options.length !== 'short') document.rows.push(...projects.map((entry) => singleRow([entry])));
  }
  if (options.length === 'long') document.rows.push(singleRow([certificate]));
  document.rows.push(singleRow([notice]));
  return document;
}

/** Local generic silhouette, embedded as PNG so JSON and PDF work offline too. */
function createDemoAvatar(accent: string, background: string): string {
  const canvas = globalThis.document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 320;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Impossibile creare l’avatar dimostrativo. Disattiva l’immagine e riprova.');
  context.fillStyle = background;
  context.fillRect(0, 0, 320, 320);
  context.fillStyle = accent;
  context.globalAlpha = 0.12;
  context.beginPath(); context.arc(285, 30, 170, 0, Math.PI * 2); context.fill();
  context.globalAlpha = 1;
  context.beginPath(); context.ellipse(160, 326, 119, 132, 0, 0, Math.PI * 2); context.fill();
  context.beginPath(); context.arc(160, 126, 60, 0, Math.PI * 2); context.fill();
  return canvas.toDataURL('image/png');
}
