
export interface Photo {
  id: string;
  url: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  date: string;
  isAiGenerated?: boolean;
}

export enum ViewMode {
  GRID = 'GRID',
  DETAIL = 'DETAIL',
  ALBUMS = 'ALBUMS',
  AI_TOOLS = 'AI_TOOLS'
}

export interface AiAnalysis {
  title: string;
  description: string;
  tags: string[];
  category: string;
}
