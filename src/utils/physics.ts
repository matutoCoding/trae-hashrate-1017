import { HoldPoint } from '@/types/bouldering';
import { MovementStep, TorqueAnalysis, BalanceState, InjuryRisk } from '@/types/movement';

export const calculateTorque = (
  holdDifficulty: number,
  armLength: number,
  bodyWeight: number = 70,
  angleDegrees: number = 90
): TorqueAnalysis => {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  const force = bodyWeight * 9.8;

  const shoulderTorque = force * armLength * Math.sin(angleRadians) * holdDifficulty;
  const elbowTorque = force * (armLength * 0.6) * Math.sin(angleRadians) * holdDifficulty * 0.8;
  const hipTorque = force * (armLength * 0.4) * holdDifficulty * 0.6;
  const kneeTorque = force * (armLength * 0.3) * holdDifficulty * 0.5;

  const totalStressScore = (shoulderTorque + elbowTorque + hipTorque + kneeTorque) / 4;

  return {
    shoulderTorque: Math.round(shoulderTorque),
    elbowTorque: Math.round(elbowTorque),
    hipTorque: Math.round(hipTorque),
    kneeTorque: Math.round(kneeTorque),
    totalStressScore: Math.round(totalStressScore)
  };
};

export const calculateDynamicSuccessRate = (
  distance: number,
  dynamicAbility: number,
  holdDifficulty: number,
  maxReach: number
): number => {
  const reachRatio = distance / maxReach;
  const difficultyPenalty = 1 - (holdDifficulty - 1) * 0.15;
  const abilityBonus = dynamicAbility / 10;

  let baseRate = 100;

  if (reachRatio > 1.0) baseRate *= 0.95;
  if (reachRatio > 0.9) baseRate *= 0.8;
  if (reachRatio > 0.8) baseRate *= 0.9;
  if (reachRatio > 0.7) baseRate *= 0.95;

  baseRate *= difficultyPenalty;
  baseRate = baseRate * (0.5 + abilityBonus * 0.5);

  return Math.max(5, Math.min(95, Math.round(baseRate)));
};

export const analyzeBalance = (
  baseOfSupport: number,
  centerOfGravityOffset: number,
  holdStability: number
): BalanceState => {
  const balanceScore = baseOfSupport * 3 - centerOfGravityOffset * 2 + holdStability * 2;

  if (balanceScore >= 7) return 'stable';
  if (balanceScore >= 4) return 'moderate';
  if (balanceScore >= 2) return 'unstable';
  return 'critical';
};

export const assessInjuryRisk = (
  torque: TorqueAnalysis,
  dynamicSuccessRate: number,
  fingerStrength: number,
  isDyno: boolean
): { risk: InjuryRisk; warning?: string } => {
  let riskScore = torque.totalStressScore / 20;

  if (isDyno) riskScore += 2;
  if (dynamicSuccessRate < 50) riskScore += 1.5;
  if (fingerStrength < 5) riskScore += 1;
  if (torque.shoulderTorque > 150) riskScore += 1.5;
  if (torque.elbowTorque > 120) riskScore += 1;

  if (riskScore <= 2) return { risk: 'low' };
  if (riskScore <= 4) return { risk: 'medium' };

  const warnings: string[] = [];
  if (torque.shoulderTorque > 150) warnings.push('肩部力矩过高，注意肩袖损伤风险');
  if (torque.elbowTorque > 120) warnings.push('肘部力矩过高，注意网球肘风险');
  if (isDyno && dynamicSuccessRate < 50) warnings.push('动态动作成功率低，建议热身充分');
  if (fingerStrength < 5) warnings.push('指力不足，易造成手指韧带风险');

  if (riskScore <= 6) return { risk: 'high', warning: warnings.join('；') };
  warnings.push('该动作存在极高受伤风险！建议充分热身或降低难度');
  return { risk: 'critical', warning: warnings.join('；') };
};

export const calculateHoldDistance = (hold1: HoldPoint, hold2: HoldPoint): number => {
  const dx = hold2.x - hold1.x;
  const dy = hold2.y - hold1.y;
  return Math.sqrt(dx * dx + dy * dy);
};
