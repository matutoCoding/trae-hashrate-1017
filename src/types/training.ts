export type AttemptStatus = 'flash' | 'send' | 'project' | 'fail' | 'partial';
export type FailPointCategory = 'power' | 'finger' | 'technique' | 'balance' | 'reach' | 'endurance' | 'mental' | 'other';

export interface TrainingLogEntry {
  id: string;
  routeId: string;
  routeName: string;
  routeGrade: string;
  date: string;
  attempts: number;
  status: AttemptStatus;
  completionPercent: number;
  failPoint?: string;
  failCategory?: FailPointCategory;
  usedBeta?: string;
  notes?: string;
  warmupQuality: number;
  energyLevel: number;
  durationMinutes: number;
  injuries?: string[];
}

export interface TrainingStats {
  totalSessions: number;
  totalRoutes: number;
  flashRate: number;
  sendRate: number;
  avgGrade: string;
  hardestGrade: string;
  improvementTrend: number;
  topWeakCategories: FailPointCategory[];
  weeklyVolume: number;
}

export interface MovementBeta {
  id: string;
  routeId: string;
  routeName: string;
  routeGrade: string;
  title: string;
  author: string;
  createdAt: string;
  tags: string[];
  steps: BetaStep[];
  overallTips: string;
  videoUrl?: string;
  likes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  bodyType: ('short' | 'average' | 'tall')[];
  style: ('power' | 'technique' | 'endurance' | 'dynamic')[];
}

export interface BetaStep {
  index: number;
  description: string;
  leftHand?: string;
  rightHand?: string;
  leftFoot?: string;
  rightFoot?: string;
  keyTip?: string;
  commonMistake?: string;
}

export const ATTEMPT_STATUS_LABELS: Record<AttemptStatus, string> = {
  flash: 'Flash一次完成',
  send: '完攀',
  project: 'Project中',
  fail: '失败',
  partial: '部分完成'
};

export const FAIL_CATEGORY_LABELS: Record<FailPointCategory, string> = {
  power: '力量不足',
  finger: '指力不够',
  technique: '技术问题',
  balance: '平衡问题',
  reach: '身高臂展限制',
  endurance: '耐力不足',
  mental: '心理因素',
  other: '其他'
};
