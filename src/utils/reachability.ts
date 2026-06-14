import { HoldPoint, Route } from '@/types/bouldering';
import { ClimberProfile, ReachabilityResult, RouteMatchResult, HeightSimulation } from '@/types/user';
import { gradeToNumber, numberToGrade } from './difficulty';

export const calculateMaxReach = (height: number, armSpan?: number): number => {
  const effectiveArmSpan = armSpan || height * 1.05;
  return effectiveArmSpan * 0.65;
};

export const calculateStandingReach = (height: number, armSpan?: number): number => {
  const effectiveArmSpan = armSpan || height * 1.05;
  return height + (effectiveArmSpan - height) / 2;
};

export const analyzeHoldReachability = (
  hold: HoldPoint,
  referenceHold: HoldPoint | null,
  height: number,
  armSpan?: number
): ReachabilityResult => {
  const maxReach = calculateMaxReach(height, armSpan);

  let distance: number;
  if (referenceHold) {
    const dx = hold.x - referenceHold.x;
    const dy = hold.y - referenceHold.y;
    distance = Math.sqrt(dx * dx + dy * dy);
  } else {
    distance = Math.sqrt(hold.x * hold.x + hold.y * hold.y);
  }

  const reachRatio = distance / maxReach;
  const isReachable = reachRatio <= 1.0;

  let difficulty = 0;
  if (reachRatio < 0.5) difficulty = 1;
  else if (reachRatio < 0.7) difficulty = 2;
  else if (reachRatio < 0.85) difficulty = 3;
  else if (reachRatio < 1.0) difficulty = 4;
  else difficulty = 5;

  difficulty += (hold.holdDifficulty || 2) * 0.3;

  return {
    holdId: hold.id,
    holdName: hold.name,
    isReachable,
    distance: Math.round(distance),
    maxReach: Math.round(maxReach),
    reachRatio: Math.round(reachRatio * 100) / 100,
    difficulty: Math.min(10, Math.round(difficulty * 10) / 10)
  };
};

export const analyzeRouteReachability = (
  route: Route,
  profile: ClimberProfile
): ReachabilityResult[] => {
  const results: ReachabilityResult[] = [];
  const holds = route.holds;

  holds.forEach((hold, index) => {
    const prevHold = index > 0 ? holds[index - 1] : null;
    results.push(
      analyzeHoldReachability(hold, prevHold, profile.height, profile.armSpan)
    );
  });

  return results;
};

export const matchRouteToClimber = (
  route: Route,
  profile: ClimberProfile
): RouteMatchResult => {
  const reachability = analyzeRouteReachability(route, profile);
  const unreachableHolds = reachability.filter(r => !r.isReachable);
  const hardReaches = reachability.filter(r => r.difficulty >= 7);

  const routeGradeNum = gradeToNumber(route.grade);
  const maxGradeNum = gradeToNumber(profile.maxGrade as any);
  const redpointNum = gradeToNumber(profile.redpointGrade as any);

  let matchScore = 100;

  if (routeGradeNum > maxGradeNum + 1) matchScore -= 40;
  else if (routeGradeNum > redpointNum) matchScore -= 20;
  else if (routeGradeNum < redpointNum - 2) matchScore -= 30;
  else if (routeGradeNum < redpointNum - 1) matchScore -= 10;

  matchScore -= unreachableHolds.length * 15;
  matchScore -= hardReaches.length * 8;

  const weakPointPenalties: Record<string, number> = {
    '指力': route.holds.filter(h => (h.holdDifficulty || 0) > 4).length * 5,
    '动态': route.tags.includes('dynamic') ? 15 : 0,
    '耐力': route.wallAngle > 20 ? 10 : 0,
    '技术': route.tags.includes('technical') ? 10 : 0
  };

  profile.weakPoints.forEach(wp => {
    matchScore -= weakPointPenalties[wp] || 0;
  });

  let suitability: RouteMatchResult['suitability'];
  if (matchScore >= 80) suitability = 'perfect';
  else if (matchScore >= 65) suitability = 'good';
  else if (matchScore >= 45) suitability = 'challenging';
  else if (matchScore >= 25) suitability = 'tooHard';
  else suitability = 'tooHard';

  if (routeGradeNum < redpointNum - 2) suitability = 'tooEasy';

  const strongPointMatches: string[] = [];
  if (profile.climbingStyle.includes('dynamic') && route.tags.includes('dynamic')) {
    strongPointMatches.push('动态风格匹配');
  }
  if (profile.climbingStyle.includes('technique') && route.tags.includes('technical')) {
    strongPointMatches.push('技术风格匹配');
  }
  if (profile.climbingStyle.includes('power') && route.tags.includes('powerful')) {
    strongPointMatches.push('力量风格匹配');
  }

  return {
    routeId: route.id,
    routeName: route.name,
    matchScore: Math.max(0, Math.round(matchScore)),
    suitability,
    cruxHolds: hardReaches.map(r => r.holdName),
    cruxMovements: hardReaches.slice(0, 3).map(r => `${r.holdName} 可达难度 ${r.difficulty}/10`),
    weakPointMatches: profile.weakPoints.filter(wp => weakPointPenalties[wp] > 0),
    strongPointMatches,
    reachabilityIssues: unreachableHolds.map(r => `${r.holdName} 距离 ${r.distance}cm 超出臂展`),
    estimatedSuccessRate: Math.max(0, Math.min(100, Math.round(matchScore)))
  };
};

export const simulateDifferentHeights = (
  route: Route,
  baseArmSpan?: number
): HeightSimulation[] => {
  const heights = [155, 165, 175, 185];
  return heights.map(height => {
    const armSpan = baseArmSpan || height * 1.05;
    const tempProfile: ClimberProfile = {
      id: 'sim',
      name: '模拟用户',
      height,
      armSpan,
      apeIndex: armSpan - height,
      fingerStrength: 7,
      coreStrength: 7,
      pullStrength: 7,
      dynamicAbility: 7,
      maxGrade: 'V5',
      redpointGrade: 'V4',
      onSightGrade: 'V3',
      climbingStyle: ['power', 'technique'],
      weakPoints: []
    };

    const reachability = analyzeRouteReachability(route, tempProfile);
    const avgDifficulty = reachability.reduce((sum, r) => sum + r.difficulty, 0) / reachability.length;
    const reachIssues = reachability.filter(r => !r.isReachable).length;

    let estimatedGradeNum = gradeToNumber(route.grade);
    estimatedGradeNum += reachIssues * 0.5;
    estimatedGradeNum += avgDifficulty > 6 ? 0.5 : 0;
    estimatedGradeNum += height < 165 ? 1 : 0;
    estimatedGradeNum -= height > 180 ? 0.5 : 0;

    let notes = '';
    if (height < 165) {
      notes = reachIssues > 0 ? '身高较矮，部分动作需要动态或更长的手臂展开' : '身高较矮，但该线路可达性良好';
    } else if (height > 180) {
      notes = '身高优势明显，部分大跨度动作相对容易';
    } else {
      notes = reachIssues > 0 ? '中等身高，部分跨度需要技巧补充' : '中等身高适配良好';
    }

    return {
      height,
      armSpan: Math.round(armSpan),
      reachability,
      overallScore: Math.round((10 - avgDifficulty) * 10),
      estimatedGrade: numberToGrade(estimatedGradeNum),
      notes
    };
  });
};
