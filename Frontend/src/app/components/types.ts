export type UsagePoint = { day: string; hours: number };
export type CategorySlice = { name: string; value: number; color: string };
export type RiskPoint = { level: string; count: number; color: string };

export type Child = {
  id: number;
  name: string;
  status: string;
  todayUsage: string;
  pin: string;
  avatar: string;
};

export type AIAnalysisItem = {
  id: number;
  content: string;
  risk: string;
  action: string;
  severity: 'low' | 'medium' | 'high';
  icon: string;
};

export type ChatMessage = {
  id: number;
  sender: 'ai' | 'user';
  text: string;
};
