export type UsageSite = {
  url: string;
  domain: string;
  category: string;
  minutes: number;
  logoUrl?: string;
  enteredAt?: string;
  leftAt?: string;
};

export type UsagePoint = { day: string; minutes: number; sites?: UsageSite[] };
export type CategorySlice = { name: string; value: number; color: string };
export type RiskPoint = { level: string; count: number; color: string };
export type CategoryWebsiteDetail = {
  category: string;
  url: string;
  domain: string;
  minutes: number;
  logoUrl?: string;
};
export type RiskWebsiteDetail = {
  level: string;
  category: string;
  url: string;
  domain: string;
  minutes: number;
  safetyScore: number;
  logoUrl?: string;
};

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
