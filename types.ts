export interface StockData {
  symbol: string;
  companyName: string;
  price: number;
  currency: string;
  changePercent: number;
  marketCap: string;
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  lastUpdated: Date;
}

export interface NewsItem {
  title: string;
  url: string;
  source?: string;
}

export interface GroundingMetadata {
  web?: {
    uri: string;
    title: string;
  };
}

export interface AnalysisResult {
  stockData: StockData | null;
  news: NewsItem[];
  rawText: string;
}

export interface WatchlistItem {
  symbol: string;
  companyName: string;
  price: number;
  changePercent: number;
  addedAt: number;
}