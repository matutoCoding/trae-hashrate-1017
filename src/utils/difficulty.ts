import { Route, HoldPoint, DifficultyGrade } from '@/types/bouldering';

export const calculateHoldDifficulty = (shape: string, orientation: string, size: number): number => {
  let score = 1;

  const shapeScores: Record<string, number> = {
    jug: 1,
    edge: 2.5,
    pinch: 3,
    gastron: 3,
    pocket: 3.5,
    crimp: 4,
    sloper: 4.5
  };
  score += shapeScores[shape] || 2;

  const orientationScores: Record<string, number> = {
    up: 0,
    slantLeft: 0.5,
    slantRight: 0.5,
    right: 1,
    left: 1,
    down: 2,
    undercling: 2.5
  };
  score += orientationScores[orientation] || 0;

  if (size < 3) score += 2;
  else if (size < 5) score += 1;
  else if (size > 8) score -= 0.5;

  return Math.round(score * 10) / 10;
};

export const estimateRouteGrade = (route: Route): DifficultyGrade => {
  const holds = route.holds || [];
  if (holds.length === 0) return 'V0';

  let totalHoldDifficulty = 0;
  let maxHoldDifficulty = 0;

  holds.forEach(hold => {
    const diff = hold.holdDifficulty || calculateHoldDifficulty(hold.shape, hold.orientation, hold.size);
    totalHoldDifficulty += diff;
    maxHoldDifficulty = Math.max(maxHoldDifficulty, diff);
  });

  const avgHoldDifficulty = totalHoldDifficulty / holds.length;

  let maxSpan = 0;
  for (let i = 0; i < holds.length; i++) {
    for (let j = i + 1; j < holds.length; j++) {
      const dx = holds[j].x - holds[i].x;
      const dy = holds[j].y - holds[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      maxSpan = Math.max(maxSpan, dist);
    }
  }

  const wallAngleFactor = (route.wallAngle || 0) / 30;
  const holdCountFactor = Math.max(0, 8 - holds.length) * 0.3;
  const spanFactor = maxSpan / 100;

  const totalScore =
    avgHoldDifficulty * 1.5 +
    maxHoldDifficulty * 1.2 +
    wallAngleFactor * 2 +
    holdCountFactor +
    spanFactor * 1.5;

  const gradeMap: { min: number; grade: DifficultyGrade }[] = [
    { min: 0, grade: 'V0' },
    { min: 5, grade: 'V1' },
    { min: 7, grade: 'V2' },
    { min: 9, grade: 'V3' },
    { min: 11, grade: 'V4' },
    { min: 13, grade: 'V5' },
    { min: 15, grade: 'V6' },
    { min: 18, grade: 'V7' },
    { min: 21, grade: 'V8' },
    { min: 25, grade: 'V9' }
  ];

  let result: DifficultyGrade = 'V0';
  for (const g of gradeMap) {
    if (totalScore >= g.min) result = g.grade;
  }

  return result;
};

export const checkGradeConsistency = (
  declaredGrade: DifficultyGrade,
  calculatedGrade: DifficultyGrade
): 'excellent' | 'good' | 'fair' | 'poor' => {
  const gradeOrder: DifficultyGrade[] = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9'];
  const declaredIndex = gradeOrder.indexOf(declaredGrade);
  const calculatedIndex = gradeOrder.indexOf(calculatedGrade);
  const diff = Math.abs(declaredIndex - calculatedIndex);

  if (diff === 0) return 'excellent';
  if (diff === 1) return 'good';
  if (diff === 2) return 'fair';
  return 'poor';
};

export const gradeToNumber = (grade: DifficultyGrade): number => {
  const gradeMap: Record<DifficultyGrade, number> = {
    V0: 0, V1: 1, V2: 2, V3: 3, V4: 4, V5: 5, V6: 6, V7: 7, V8: 8, V9: 9
  };
  return gradeMap[grade] || 0;
};

export const numberToGrade = (num: number): DifficultyGrade => {
  const grades: DifficultyGrade[] = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9'];
  return grades[Math.max(0, Math.min(9, Math.round(num)))];
};
