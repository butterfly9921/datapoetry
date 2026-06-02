export interface Insight {
  id: string;
  ruleId: string;
  message: string;
  priority: number;
  createdAt?: string;
}

export interface InsightRule {
  id: string;
  name: string;
  priority: number;
  check: (diaries: any[]) => Insight | null;
}
