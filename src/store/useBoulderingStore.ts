import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { Route } from '@/types/bouldering';
import { MovementBreakdown } from '@/types/movement';
import { ClimberProfile } from '@/types/user';
import { TrainingLogEntry, MovementBeta } from '@/types/training';
import { mockRoutes } from '@/data/routes';
import { mockMovements } from '@/data/movements';
import { mockCurrentUser } from '@/data/users';
import { mockLogs } from '@/data/logs';
import { mockBetaLibrary } from '@/data/logs';

const STORAGE_KEYS = {
  ROUTES: 'bouldering_routes',
  MOVEMENTS: 'bouldering_movements',
  USER: 'bouldering_user',
  LOGS: 'bouldering_logs',
  BETA: 'bouldering_beta'
};

const safeGetStorage = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof Taro !== 'undefined' && Taro.getStorageSync) {
      const data = Taro.getStorageSync(key);
      if (data !== '' && data !== null && data !== undefined) {
        if (Array.isArray(data) && data.length === 0) return defaultValue;
        return data as T;
      }
    }
  } catch (e) {
    console.warn('[Storage] Get fallback to default:', key);
  }
  return defaultValue;
};

const safeSetStorage = async (key: string, data: any): Promise<void> => {
  try {
    if (typeof Taro !== 'undefined' && Taro.setStorageSync) {
      Taro.setStorageSync(key, data);
      console.log('[Storage] Saved:', key);
    }
  } catch (e) {
    console.error('[Storage] Save error:', key, e);
  }
};

const initializeData = () => {
  try {
    const routes = safeGetStorage(STORAGE_KEYS.ROUTES, []);
    if (!routes || routes.length === 0) safeSetStorage(STORAGE_KEYS.ROUTES, mockRoutes);

    const movements = safeGetStorage(STORAGE_KEYS.MOVEMENTS, []);
    if (!movements || movements.length === 0) safeSetStorage(STORAGE_KEYS.MOVEMENTS, mockMovements);

    const user = safeGetStorage(STORAGE_KEYS.USER, null);
    if (!user) safeSetStorage(STORAGE_KEYS.USER, mockCurrentUser);

    const logs = safeGetStorage(STORAGE_KEYS.LOGS, []);
    if (!logs || logs.length === 0) safeSetStorage(STORAGE_KEYS.LOGS, mockLogs);

    const beta = safeGetStorage(STORAGE_KEYS.BETA, []);
    if (!beta || beta.length === 0) safeSetStorage(STORAGE_KEYS.BETA, mockBetaLibrary);

    console.log('[Storage] Initial data check complete');
  } catch (e) {
    console.error('[Storage] Init error:', e);
  }
};

initializeData();

interface BoulderingState {
  routes: Route[];
  movements: MovementBreakdown[];
  currentUser: ClimberProfile;
  trainingLogs: TrainingLogEntry[];
  betaLibrary: MovementBeta[];
  currentRoute: Route | null;
  currentMovement: MovementBreakdown | null;
  isInitialized: boolean;

  initData: () => void;
  addRoute: (route: Route) => void;
  updateRoute: (id: string, route: Partial<Route>) => void;
  deleteRoute: (id: string) => void;
  setCurrentRoute: (route: Route | null) => void;

  addMovement: (movement: MovementBreakdown) => void;
  updateMovement: (id: string, movement: Partial<MovementBreakdown>) => void;
  setCurrentMovement: (movement: MovementBreakdown | null) => void;

  updateUserProfile: (profile: Partial<ClimberProfile>) => void;

  addTrainingLog: (log: TrainingLogEntry) => void;
  deleteTrainingLog: (id: string) => void;

  addBeta: (beta: MovementBeta) => void;
}

export const useBoulderingStore = create<BoulderingState>((set, get) => ({
  routes: safeGetStorage(STORAGE_KEYS.ROUTES, mockRoutes),
  movements: safeGetStorage(STORAGE_KEYS.MOVEMENTS, mockMovements),
  currentUser: safeGetStorage(STORAGE_KEYS.USER, mockCurrentUser),
  trainingLogs: safeGetStorage(STORAGE_KEYS.LOGS, mockLogs),
  betaLibrary: safeGetStorage(STORAGE_KEYS.BETA, mockBetaLibrary),
  currentRoute: null,
  currentMovement: null,
  isInitialized: true,

  initData: () => {
    set({
      routes: safeGetStorage(STORAGE_KEYS.ROUTES, mockRoutes),
      movements: safeGetStorage(STORAGE_KEYS.MOVEMENTS, mockMovements),
      currentUser: safeGetStorage(STORAGE_KEYS.USER, mockCurrentUser),
      trainingLogs: safeGetStorage(STORAGE_KEYS.LOGS, mockLogs),
      betaLibrary: safeGetStorage(STORAGE_KEYS.BETA, mockBetaLibrary)
    });
  },

  addRoute: (route) => {
    const newRoutes = [...get().routes, route];
    set({ routes: newRoutes });
    safeSetStorage(STORAGE_KEYS.ROUTES, newRoutes);
  },

  updateRoute: (id, route) => {
    const newRoutes = get().routes.map(r => r.id === id ? { ...r, ...route } : r);
    set({ routes: newRoutes });
    safeSetStorage(STORAGE_KEYS.ROUTES, newRoutes);
  },

  deleteRoute: (id) => {
    const newRoutes = get().routes.filter(r => r.id !== id);
    set({ routes: newRoutes });
    safeSetStorage(STORAGE_KEYS.ROUTES, newRoutes);
  },

  setCurrentRoute: (route) => set({ currentRoute: route }),

  addMovement: (movement) => {
    const existingIndex = get().movements.findIndex(m => m.routeId === movement.routeId);
    let newMovements;
    if (existingIndex >= 0) {
      newMovements = get().movements.map((m, i) => i === existingIndex ? movement : m);
    } else {
      newMovements = [...get().movements, movement];
    }
    set({ movements: newMovements });
    safeSetStorage(STORAGE_KEYS.MOVEMENTS, newMovements);
  },

  updateMovement: (id, movement) => {
    const newMovements = get().movements.map(m => m.id === id ? { ...m, ...movement } : m);
    set({ movements: newMovements });
    safeSetStorage(STORAGE_KEYS.MOVEMENTS, newMovements);
  },

  setCurrentMovement: (movement) => set({ currentMovement: movement }),

  updateUserProfile: (profile) => {
    const newUser = { ...get().currentUser, ...profile };
    set({ currentUser: newUser });
    safeSetStorage(STORAGE_KEYS.USER, newUser);
  },

  addTrainingLog: (log) => {
    const newLogs = [log, ...get().trainingLogs];
    set({ trainingLogs: newLogs });
    safeSetStorage(STORAGE_KEYS.LOGS, newLogs);
  },

  deleteTrainingLog: (id) => {
    const newLogs = get().trainingLogs.filter(l => l.id !== id);
    set({ trainingLogs: newLogs });
    safeSetStorage(STORAGE_KEYS.LOGS, newLogs);
  },

  addBeta: (beta) => {
    const newBeta = [beta, ...get().betaLibrary];
    set({ betaLibrary: newBeta });
    safeSetStorage(STORAGE_KEYS.BETA, newBeta);
  }
}));
