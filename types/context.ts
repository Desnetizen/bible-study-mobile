export interface TimelineItem {
  date: string;
  event: string;
  reference: string;
}

export interface SubSection {
  id: string;
  title: string;
  content: string;
}

export interface Term {
  id: string;
  term: string;
  definition: string;
}

export interface Section {
  id: string;
  title: string;
  content: string;
  intro?: string;
  subsections?: SubSection[];
  timeline?: TimelineItem[];
  terms?: Term[];
}

export interface ContextData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  sections: Section[];
}
