import { ClimberProfile } from '@/types/user';

export const mockCurrentUser: ClimberProfile = {
  id: 'user-1',
  name: '攀岩小白',
  height: 172,
  armSpan: 175,
  apeIndex: 3,
  fingerStrength: 5,
  coreStrength: 6,
  pullStrength: 5,
  dynamicAbility: 4,
  maxGrade: 'V5',
  redpointGrade: 'V4',
  onSightGrade: 'V3',
  climbingStyle: ['power', 'technique'],
  weakPoints: ['指力', '动态']
};

export const mockClimbers: ClimberProfile[] = [
  mockCurrentUser,
  {
    id: 'user-2',
    name: '大神阿强',
    height: 185,
    armSpan: 192,
    apeIndex: 7,
    fingerStrength: 9,
    coreStrength: 8,
    pullStrength: 9,
    dynamicAbility: 8,
    maxGrade: 'V8',
    redpointGrade: 'V7',
    onSightGrade: 'V6',
    climbingStyle: ['power', 'dynamic', 'endurance'],
    weakPoints: ['技术细节']
  },
  {
    id: 'user-3',
    name: '柔术小美',
    height: 160,
    armSpan: 158,
    apeIndex: -2,
    fingerStrength: 7,
    coreStrength: 8,
    pullStrength: 5,
    dynamicAbility: 6,
    maxGrade: 'V5',
    redpointGrade: 'V4',
    onSightGrade: 'V4',
    climbingStyle: ['technique', 'endurance'],
    weakPoints: ['力量', '身高臂展']
  }
];
