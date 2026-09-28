import { Award, BookOpen, BriefcaseBusiness, Building2, CalendarDays, Code2, FolderGit2, Globe2, GraduationCap, Languages, Laptop, Mail, MapPin, Phone, UserRound, Wrench, type LucideIcon } from 'lucide-react';

export const cvIcons: Record<string, LucideIcon> = {
  user: UserRound, briefcase: BriefcaseBusiness, 'graduation-cap': GraduationCap,
  code: Code2, languages: Languages, award: Award, folder: FolderGit2,
  'book-open': BookOpen, globe: Globe2, wrench: Wrench, laptop: Laptop,
  building: Building2, calendar: CalendarDays, mail: Mail, phone: Phone, 'map-pin': MapPin,
};

export const iconOptions = Object.keys(cvIcons);
