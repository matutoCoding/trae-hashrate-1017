import { create } from 'zustand';
import { Route, HoldPoint } from '@/types/bouldering';
import { MovementBreakdown } from '@/types/movement';
import { ClimberProfile } from '@/types/user';
import { TrainingLogEntry, MovementBeta } from '@/types/training';
import { mockRoutes } from '@/data/routes';
import { mockMovements } from '@/data/movements';
import { mockCurrentUser } from '@/data/users';
import { mockLogs } from '@/data/logs';
import { mockBetaLibrary } from '@/data/logs';

interface BoulderingState {
  routes: Route[];
  movements: MovementBreakdown[];
  currentUser: ClimberProfile;
  trainingLogs: TrainingLogEntry[];
  betaLibrary: MovementBeta[];
  currentRoute: Route | null;
  currentMovement: MovementBreakdown | null;

  addRoute: (route: Route) => void;
  updateRoute: (id: string, route: Partial<Route>) => void;
  deleteRoute: (id: string) => void;
  setCurrentRoute: (route: Route | null) => void;

  addMovement: (movement: MovementBreakdown) => void;
  setCurrentMovement: (movement: MovementBreakdown | null) => void;

  updateUserProfile: (profile: Partial<ClimberProfile>) => void;

  addTrainingLog: (log: TrainingLogEntry) => void;
  deleteTrainingLog: (id: string) => void;

  addBeta: (beta: MovementBeta) => void;
}

export const useBoulderingStore = create<BoulderingState>((set) => ({
  routes: mockRoutes,
  movements: mockMovements,
  currentUser: mockCurrentUser,
  trainingLogs: mockLogs,
  betaLibrary: mockBetaLibrary,
  currentRoute: null,
  currentMovement: null,

  addRoute: (route) => set((state) => ({ routes: [...state.routes, route] })),
  updateRoute: (id, route) => set((state) => ({
    routes: state.routes.map(r => r.id === id ? { ...r, ...route } : r)
  })),
  deleteRoute: (id) => set((state) => ({
    routes: state.routes.filter(r => r.id !== id)
  })),
  setCurrentRoute: (route) => set({ currentRoute: route }),

  addMovement: (movement) => set((state) => ({ movements: [...state.movements, movement] })),
  setCurrentMovement: (movement) => set({ currentMovement: movement }),

  updateUserProfile: (profile) => set((state) => ({
    currentUser: { ...state.currentUser, ...profile }
  })),

  addTrainingLog: (log) => set((state) => ({ trainingLogs: [log, ...state.trainingLogs] })),
  deleteTrainingLog: (id) => set((state) => ({
    trainingLogs: state.trainingLogs.filter(l => l.id !== id)
  })),

  addBeta: (beta) => set((state) => ({ betaLibrary: [beta, ...state.betaLibrary] }))
}));
