export type ForceDirection = 'up' | 'down' | 'left' | 'right' | 'upLeft' | 'upRight' | 'downLeft' | 'downRight';
export type MovementType = 'static' | 'deadpoint' | 'dyno' | 'heelhook' | 'toehook' | 'kneebar' | 'smear';
export type BalanceState = 'stable' | 'moderate' | 'unstable' | 'critical';
export type InjuryRisk = 'low' | 'medium' | 'high' | 'critical';

export interface MovementStep {
  id: string;
  stepIndex: number;
  description: string;
  leftHand?: string;
  rightHand?: string;
  leftFoot?: string;
  rightFoot?: string;
  centerOfGravityShift: { x: number; y: number };
  primaryForceDirection: ForceDirection;
  forceMagnitude: number;
  movementType: MovementType;
  torque: TorqueAnalysis;
  dynamicSuccessRate?: number;
  balanceState: BalanceState;
  footSequenceImpact?: string;
  injuryRisk: InjuryRisk;
  injuryWarning?: string;
  isCrux: boolean;
  notes?: string;
}

export interface TorqueAnalysis {
  shoulderTorque: number;
  elbowTorque: number;
  hipTorque: number;
  kneeTorque: number;
  totalStressScore: number;
}

export interface MovementBreakdown {
  id: string;
  routeId: string;
  routeName: string;
  steps: MovementStep[];
  overallDifficultyScore: number;
  estimatedGrade: string;
  cruxSteps: string[];
  criticalInjuryRisks: string[];
  footSequenceAnalysis: string;
}

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  static: '静态移动',
  deadpoint: '死点',
  dyno: '动态飞跃',
  heelhook: '脚跟钩',
  toehook: '脚尖钩',
  kneebar: '膝顶',
  smear: '摩擦踩点'
};

export const FORCE_DIRECTION_LABELS: Record<ForceDirection, string> = {
  up: '向上',
  down: '向下',
  left: '向左',
  right: '向右',
  upLeft: '左上',
  upRight: '右上',
  downLeft: '左下',
  downRight: '右下'
};

export const BALANCE_STATE_LABELS: Record<BalanceState, string> = {
  stable: '稳定',
  moderate: '一般',
  unstable: '不稳',
  critical: '危险'
};

export const INJURY_RISK_LABELS: Record<InjuryRisk, string> = {
  low: '低风险',
  medium: '中等风险',
  high: '高风险',
  critical: '极高风险'
};
