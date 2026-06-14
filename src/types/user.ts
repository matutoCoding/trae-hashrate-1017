export interface ClimberProfile {
  id: string;
  name: string;
  height: number;
  armSpan: number;
  apeIndex: number;
  fingerStrength: number;
  coreStrength: number;
  pullStrength: number;
  dynamicAbility: number;
  maxGrade: string;
  redpointGrade: string;
  onSightGrade: string;
  climbingStyle: ('power' | 'endurance' | 'technique' | 'dynamic')[];
  weakPoints: string[];
}

export interface ReachabilityResult {
  holdId: string;
  holdName: string;
  isReachable: boolean;
  distance: number;
  maxReach: number;
  reachRatio: number;
  difficulty: number;
}

export interface RouteMatchResult {
  routeId: string;
  routeName: string;
  matchScore: number;
  suitability: 'perfect' | 'good' | 'challenging' | 'tooHard' | 'tooEasy';
  cruxHolds: string[];
  cruxMovements: string[];
  weakPointMatches: string[];
  strongPointMatches: string[];
  reachabilityIssues: string[];
  estimatedSuccessRate: number;
}

export interface HeightSimulation {
  height: number;
  armSpan: number;
  reachability: ReachabilityResult[];
  overallScore: number;
  estimatedGrade: string;
  notes: string;
}
