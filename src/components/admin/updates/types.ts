export type UpdateCategory =
  | 'All'
  | 'Email & Marketing'
  | 'WhatsApp Sales'
  | 'Documents & Legal'
  | 'Staff & Operations'
  | 'Security & Platform';

export type UpdateTag = 'New Feature' | 'Improvement' | 'Fix' | 'Design & Speed' | 'Security';

export interface SystemUpdateItem {
  title: string;
  description: string;
  benefit?: string;
  tag: UpdateTag;
}

export interface SystemUpdateRelease {
  id: string;
  date: string;
  formattedDate: string;
  version: string;
  title: string;
  summary: string;
  category: UpdateCategory;
  items: SystemUpdateItem[];
  isLatest?: boolean;
}

export interface RoadmapItem {
  title: string;
  targetQuarter: string;
  category: UpdateCategory;
  description: string;
  status: 'In Development' | 'Planned' | 'Testing';
}
