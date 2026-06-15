import { Route, DifficultyGrade } from '@/types/bouldering';
import { calculateHoldDifficulty } from '@/utils/difficulty';

export const mockRoutes: Route[] = [
  {
    id: 'route-1',
    name: '橙色三角力量',
    grade: 'V3',
    setter: '老张',
    createdAt: '2025-12-01',
    gymName: '岩舞空间',
    wallAngle: 15,
    tags: ['powerful', 'crimp'],
    description: '经典三角岩点线路，注重指力和核心控制',
    holds: [
      { id: 'h1', name: 'S1', shape: 'jug', orientation: 'up', type: 'start', x: 20, y: 80, size: 9, holdDifficulty: 1.5 },
      { id: 'h2', name: 'S2', shape: 'jug', orientation: 'up', type: 'start', x: 60, y: 80, size: 9, holdDifficulty: 1.5 },
      { id: 'h3', name: 'M1', shape: 'crimp', orientation: 'up', type: 'middle', x: 40, y: 130, size: 3, holdDifficulty: calculateHoldDifficulty('crimp', 'up', 3) },
      { id: 'h4', name: 'M2', shape: 'edge', orientation: 'slantRight', type: 'middle', x: 80, y: 170, size: 4, holdDifficulty: calculateHoldDifficulty('edge', 'slantRight', 4) },
      { id: 'h5', name: 'M3', shape: 'crimp', orientation: 'up', type: 'middle', x: 30, y: 200, size: 2.5, holdDifficulty: calculateHoldDifficulty('crimp', 'up', 2.5) },
      { id: 'h6', name: 'F1', shape: 'jug', orientation: 'up', type: 'finish', x: 65, y: 250, size: 10, holdDifficulty: 1 }
    ],
    calculatedGrade: 'V3',
    gradeConsistency: 'excellent'
  },
  {
    id: 'route-2',
    name: '蓝色动态弧线',
    grade: 'V5',
    setter: '小明',
    createdAt: '2025-11-28',
    gymName: '岩舞空间',
    wallAngle: 25,
    tags: ['dynamic', 'powerful'],
    description: '需要动态跳跃的大仰角线路',
    holds: [
      { id: 'h1', name: 'S1', shape: 'jug', orientation: 'up', type: 'start', x: 15, y: 70, size: 10, holdDifficulty: 1 },
      { id: 'h2', name: 'S2', shape: 'edge', orientation: 'up', type: 'start', x: 75, y: 70, size: 5, holdDifficulty: 2.5 },
      { id: 'h3', name: 'M1', shape: 'sloper', orientation: 'slantLeft', type: 'middle', x: 50, y: 130, size: 6, holdDifficulty: calculateHoldDifficulty('sloper', 'slantLeft', 6) },
      { id: 'h4', name: 'M2', shape: 'pinch', orientation: 'up', type: 'middle', x: 90, y: 180, size: 4, holdDifficulty: calculateHoldDifficulty('pinch', 'up', 4) },
      { id: 'h5', name: 'M3', shape: 'crimp', orientation: 'up', type: 'middle', x: 20, y: 220, size: 2, holdDifficulty: calculateHoldDifficulty('crimp', 'up', 2) },
      { id: 'h6', name: 'F1', shape: 'jug', orientation: 'up', type: 'finish', x: 55, y: 280, size: 11, holdDifficulty: 1 }
    ],
    calculatedGrade: 'V5',
    gradeConsistency: 'good'
  },
  {
    id: 'route-3',
    name: '绿色技术迷宫',
    grade: 'V2',
    setter: '阿美',
    createdAt: '2025-11-25',
    gymName: '岩舞空间',
    wallAngle: 5,
    tags: ['technical', 'balance'],
    description: '考验脚法和身体平衡的技术线路',
    holds: [
      { id: 'h1', name: 'S1', shape: 'jug', orientation: 'up', type: 'start', x: 30, y: 85, size: 8, holdDifficulty: 1.5 },
      { id: 'h2', name: 'F1', shape: 'edge', orientation: 'up', type: 'foot', x: 70, y: 50, size: 5, holdDifficulty: 1 },
      { id: 'h3', name: 'M1', shape: 'gastron', orientation: 'right', type: 'middle', x: 60, y: 130, size: 4, holdDifficulty: calculateHoldDifficulty('gastron', 'right', 4) },
      { id: 'h4', name: 'M2', shape: 'edge', orientation: 'left', type: 'middle', x: 20, y: 160, size: 5, holdDifficulty: calculateHoldDifficulty('edge', 'left', 5) },
      { id: 'h5', name: 'M3', shape: 'pocket', orientation: 'up', type: 'middle', x: 75, y: 200, size: 3, holdDifficulty: calculateHoldDifficulty('pocket', 'up', 3) },
      { id: 'h6', name: 'F1', shape: 'jug', orientation: 'up', type: 'finish', x: 45, y: 240, size: 10, holdDifficulty: 1 }
    ],
    calculatedGrade: 'V2',
    gradeConsistency: 'excellent'
  },
  {
    id: 'route-4',
    name: '红色力量斜坡',
    grade: 'V6',
    setter: '老王',
    createdAt: '2025-11-20',
    gymName: '岩舞空间',
    wallAngle: 35,
    tags: ['powerful', 'endurance'],
    description: '大仰角耐力训练线路',
    holds: [
      { id: 'h1', name: 'S1', shape: 'jug', orientation: 'up', type: 'start', x: 25, y: 60, size: 10, holdDifficulty: 1 },
      { id: 'h2', name: 'S2', shape: 'jug', orientation: 'up', type: 'start', x: 65, y: 60, size: 10, holdDifficulty: 1 },
      { id: 'h3', name: 'M1', shape: 'crimp', orientation: 'up', type: 'middle', x: 45, y: 110, size: 2.5, holdDifficulty: calculateHoldDifficulty('crimp', 'up', 2.5) },
      { id: 'h4', name: 'M2', shape: 'sloper', orientation: 'up', type: 'middle', x: 85, y: 150, size: 5, holdDifficulty: calculateHoldDifficulty('sloper', 'up', 5) },
      { id: 'h5', name: 'M3', shape: 'pinch', orientation: 'slantRight', type: 'middle', x: 25, y: 190, size: 3.5, holdDifficulty: calculateHoldDifficulty('pinch', 'slantRight', 3.5) },
      { id: 'h6', name: 'M4', shape: 'crimp', orientation: 'up', type: 'middle', x: 70, y: 230, size: 2, holdDifficulty: calculateHoldDifficulty('crimp', 'up', 2) },
      { id: 'h7', name: 'F1', shape: 'jug', orientation: 'up', type: 'finish', x: 40, y: 280, size: 12, holdDifficulty: 1 }
    ],
    calculatedGrade: 'V7',
    gradeConsistency: 'fair'
  },
  {
    id: 'route-5',
    name: '紫色入门直线',
    grade: 'V0',
    setter: '阿美',
    createdAt: '2025-12-05',
    gymName: '岩舞空间',
    wallAngle: 0,
    tags: ['beginner'],
    description: '新手友好的入门线路',
    holds: [
      { id: 'h1', name: 'S1', shape: 'jug', orientation: 'up', type: 'start', x: 35, y: 70, size: 12, holdDifficulty: 1 },
      { id: 'h2', name: 'S2', shape: 'jug', orientation: 'up', type: 'start', x: 70, y: 70, size: 12, holdDifficulty: 1 },
      { id: 'h3', name: 'M1', shape: 'jug', orientation: 'up', type: 'middle', x: 50, y: 120, size: 10, holdDifficulty: 1.2 },
      { id: 'h4', name: 'M2', shape: 'edge', orientation: 'up', type: 'middle', x: 30, y: 170, size: 7, holdDifficulty: 2 },
      { id: 'h5', name: 'M3', shape: 'edge', orientation: 'up', type: 'middle', x: 75, y: 200, size: 7, holdDifficulty: 2 },
      { id: 'h6', name: 'F1', shape: 'jug', orientation: 'up', type: 'finish', x: 55, y: 250, size: 14, holdDifficulty: 0.8 }
    ],
    calculatedGrade: 'V0',
    gradeConsistency: 'excellent'
  }
];
