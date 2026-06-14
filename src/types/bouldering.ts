export type HoldShape = 'jug' | 'crimp' | 'sloper' | 'pocket' | 'pinch' | 'edge' | 'gastron';
export type HoldOrientation = 'up' | 'down' | 'left' | 'right' | 'slantLeft' | 'slantRight' | 'undercling';
export type HoldType = 'start' | 'middle' | 'foot' | 'finish';
export type DifficultyGrade = 'V0' | 'V1' | 'V2' | 'V3' | 'V4' | 'V5' | 'V6' | 'V7' | 'V8' | 'V9';

export interface HoldPoint {
  id: string;
  name: string;
  shape: HoldShape;
  orientation: HoldOrientation;
  type: HoldType;
  x: number;
  y: number;
  size: number;
  holdDifficulty: number;
  notes?: string;
}

export interface Route {
  id: string;
  name: string;
  grade: DifficultyGrade;
  setter: string;
  createdAt: string;
  gymName: string;
  wallAngle: number;
  holds: HoldPoint[];
  description?: string;
  tags: string[];
  calculatedGrade?: DifficultyGrade;
  gradeConsistency?: 'excellent' | 'good' | 'fair' | 'poor';
}

export const HOLD_SHAPE_LABELS: Record<HoldShape, string> = {
  jug: 'jug大把手',
  crimp: 'crimp小扣点',
  sloper: 'sloper圆点',
  pocket: 'pocket口袋点',
  pinch: 'pinch捏点',
  edge: 'edge边缘点',
  gastron: 'gastron侧拉点'
};

export const HOLD_ORIENTATION_LABELS: Record<HoldOrientation, string> = {
  up: '朝上',
  down: '朝下',
  left: '朝左',
  right: '朝右',
  slantLeft: '左斜',
  slantRight: '右斜',
  undercling: '反提'
};

export const DIFFICULTY_COLORS: Record<DifficultyGrade, string> = {
  V0: '#52C41A',
  V1: '#52C41A',
  V2: '#73D13D',
  V3: '#FAAD14',
  V4: '#FAAD14',
  V5: '#FA8C16',
  V6: '#FA8C16',
  V7: '#F5222D',
  V8: '#F5222D',
  V9: '#CF1322'
};
