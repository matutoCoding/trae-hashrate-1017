import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { Route, HoldPoint } from '@/types/bouldering';
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

const loadFromStorage = async <T>(key: string, defaultValue: T): Promise<T> => {
  try {
    const data = Taro.getStorageSync(key);
    if (data) {
      console.log('[Storage] Loaded from storage:', key);
      return data as T;
    }
  } catch (e) {
    console.error('[Storage] Load error:', key, e);
  }
  return defaultValue;
};

const saveToStorage = async <T>(key: string, data: T): Promise<void> => {
  try {
    Taro.setStorageSync(key, data);
    console.log('[Storage] Saved to storage:', key);
  } catch (e) {
    console.error('[Storage] Save error:', key, e);
  }
};

const initializeData = async () => {
  try {
    const routes = Taro.getStorageSync(STORAGE_KEYS.ROUTES);
    if (!routes || routes.length === 0) {
      Taro.setStorageSync(STORAGE_KEYS.ROUTES, mockRoutes);
    }
    const movements = Taro.getStorageSync(STORAGE_KEYS.MOVEMENTS);
    if (!movements || movements.length === 0) {
      Taro.setStorageSync(STORAGE_KEYS.MOVEMENTS, mockMovements);
    }
    const user = Taro.getStorageSync(STORAGE_KEYS.USER);
    if (!user) {
      Taro.setStorageSync(STORAGE_KEYS.USER, mockCurrentUser);
    }
    const logs = Taro.getStorageSync(STORAGE_KEYS.LOGS);
    if (!logs || logs.length === 0) {
      Taro.setStorageSync(STORAGE_KEYS.LOGS, mockLogs);
    }
    const beta = Taro.getStorageSync(STORAGE_KEYS.BETA);
    if (!beta || beta.length === 0) {
      Taro.setStorageSync(STORAGE_KEYS.BETA, mockBetaLibrary);
    }
    console.log('[Storage] Initial data loaded');
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
  routes: Taro.getStorageSync(STORAGE_KEYS.ROUTES) || mockRoutes,
  movements: Taro.getStorageSync(STORAGE_KEYS.MOVEMENTS) || mockMovements,
  currentUser: Taro.getStorageSync(STORAGE_KEYS.USER) || mockCurrentUser,
  trainingLogs: Taro.getStorageSync(STORAGE_KEYS.LOGS) || mockLogs,
  betaLibrary: Taro.getStorageSync(STORAGE_KEYS.BETA) || mockBetaLibrary,
  currentRoute: null,
  currentMovement: null,
  isInitialized: true,

  initData: () => {
    set({
      routes: Taro.getStorageSync(STORAGE_KEYS.ROUTES) || mockRoutes,
      movements: Taro.getStorageSync(STORAGE_KEYS.MOVEMENTS) || mockMovements,
      currentUser: Taro.getStorageSync(STORAGE_KEYS.USER) || mockCurrentUser,
      trainingLogs: Taro.getStorageSync(STORAGE_KEYS.LOGS) || mockLogs,
      betaLibrary: Taro.getStorageSync(STORAGE_KEYS.BETA) || mockBetaLibrary
    });
  },

  addRoute: (route) => {
    const newRoutes = [...get().routes, route];
    set({ routes: newRoutes });
    saveToStorage(STORAGE_KEYS.ROUTES, newRoutes);
    console.log('[Store] Route added:', route.name);
  },

  updateRoute: (id, route) => {
    const newRoutes = get().routes.map(r => r.id === id ? { ...r, ...route } : r);
    set({ routes: newRoutes });
    saveToStorage(STORAGE_KEYS.ROUTES, newRoutes);
    console.log('[Store] Route updated:', id);
  },

  deleteRoute: (id) => {
    const newRoutes = get().routes.filter(r => r.id !== id);
    set({ routes: newRoutes });
    saveToStorage(STORAGE_KEYS.ROUTES, newRoutes);
    console.log('[Store] Route deleted:', id);
  },

  setCurrentRoute: (route) => set({ currentRoute: route }),

  addMovement: (movement) => {
    const existingIndex = get().movements.findIndex(m => m.routeId === movement.routeId);
    let newMovements;
    if (existingIndex >= 0) {
      newMovements = get().movements.map((m, i) => i === existingIndex ? movement : m);
      console.log('[Store] Movement updated for route:', movement.routeId);
    } else {
      newMovements = [...get().movements, movement];
      console.log('[Store] Movement added:', movement.routeName);
    }
    set({ movements: newMovements });
    saveToStorage(STORAGE_KEYS.MOVEMENTS, newMovements);
  },

  updateMovement: (id, movement) => {
    const newMovements = get().movements.map(m => m.id === id ? { ...m, ...movement } : m);
    set({ movements: newMovements });
    saveToStorage(STORAGE_KEYS.MOVEMENTS, newMovements);
  },

  setCurrentMovement: (movement) => set({ currentMovement: movement }),

  updateUserProfile: (profile) => {
    const newUser = { ...get().currentUser, ...profile };
    set({ currentUser: newUser });
    saveToStorage(STORAGE_KEYS.USER, newUser);
    console.log('[Store] User profile updated');
  },

  addTrainingLog: (log) => {
    const newLogs = [log, ...get().trainingLogs];
    set({ trainingLogs: newLogs });
    saveToStorage(STORAGE_KEYS.LOGS, newLogs);
    console.log('[Store] Training log added:', log.routeName);
  },

  deleteTrainingLog: (id) => {
    const newLogs = get().trainingLogs.filter(l => l.id !== id);
    set({ trainingLogs: newLogs });
    saveToStorage(STORAGE_KEYS.LOGS, newLogs);
  },

  addBeta: (beta) => {
    const newBeta = [beta, ...get().betaLibrary];
    set({ betaLibrary: newBeta });
    saveToStorage(STORAGE_KEYS.BETA, newBeta);
    console.log('[Store] Beta added:', beta.title);
  }
}));
