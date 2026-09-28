export type CVBlockType =
  | 'personal'
  | 'text'
  | 'heading'
  | 'experience'
  | 'education'
  | 'bulletList'
  | 'skills'
  | 'hobbies'
  | 'languages'
  | 'projects'
  | 'certifications'
  | 'divider'
  | 'spacer'
  | 'image'
  | 'custom';

export type BackgroundMode = 'cover' | 'contain' | 'stretch' | 'tile' | 'center' | 'span';

export interface BlockStyle {
  fontSize?: number;
  fontWeight?: 400 | 500 | 600 | 700;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  marginTop?: number;
  marginBottom?: number;
  textColor?: string;
  accentColor?: string;
  fontFamily?: string;
  backgroundColor?: string;
  backgroundOpacity?: number;
  backgroundImage?: string;
  backgroundMode?: BackgroundMode;
  header?: BlockHeaderStyle;
}

export interface BlockHeaderStyle {
  title: string;
  showIcon: boolean;
  icon?: string;
  iconPosition: 'left' | 'right';
  iconSize: number;
  iconGap: number;
  iconColor?: string;
  fontSize: number;
  fontWeight: 400 | 500 | 600 | 700;
  textTransform: 'none' | 'uppercase' | 'lowercase';
  textAlign: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  bottomBorder: boolean;
  dividerLine: boolean;
  spacingAbove: number;
  spacingBelow: number;
}

export interface PersonalData {
  firstName: string;
  lastName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  linkedIn: string;
  github: string;
  website: string;
  summary: string;
}

export interface ExperienceData {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  bullets: string[];
}

export interface EducationData {
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  bullets: string[];
}

export interface SkillsData {
  layout: 'list' | 'inline' | 'grouped';
  items: string[];
  groups: { name: string; items: string[] }[];
}

export interface CVBlockDataMap {
  personal: PersonalData;
  text: { text: string };
  heading: { text: string; level: 1 | 2 | 3; uppercase: boolean; underline: boolean; accentLine: boolean };
  experience: ExperienceData;
  education: EducationData;
  bulletList: { items: string[]; marker: 'disc' | 'circle' | 'square' };
  skills: SkillsData;
  hobbies: { items: string[] };
  languages: { items: { language: string; proficiency: string }[] };
  projects: { title: string; role: string; dates: string; description: string; url: string; bullets: string[] };
  certifications: { title: string; issuer: string; date: string; url: string };
  divider: { thickness: number; width: number };
  spacer: { height: number };
  image: { src: string; alt: string; width: number; height: number; fit: 'contain' | 'cover' };
  custom: { title: string; body: string };
}

export type CVBlock = {
  [Type in CVBlockType]: {
    id: string;
    type: Type;
    data: CVBlockDataMap[Type];
    style: BlockStyle;
  };
}[CVBlockType];

export interface GlobalCVStyle {
  fontFamily: string;
  customFont?: { name: string; dataUrl: string };
  textColor: string;
  accentColor: string;
  backgroundColor?: string;
  backgroundOpacity?: number;
  backgroundImage?: string;
  backgroundMode?: BackgroundMode;
  baseFontSize: number;
  pageMargin: number;
  sectionSpacing: number;
}

export interface CVColumn {
  id: string;
  width: number;
  blocks: CVBlock[];
}

export interface CVRow {
  id: string;
  columns: CVColumn[];
}

export interface CVDocument {
  version: 2;
  rows: CVRow[];
  globalStyle: GlobalCVStyle;
}
