import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  TIMERS: 'timers',
  HISTORY: 'timer_history',
};

// Save timers to AsyncStorage
export const saveTimers = async (timers:any) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TIMERS, JSON.stringify(timers));
  } catch (error) {
    console.error('Error saving timers:', error);
  }
};

// Load timers from AsyncStorage
export const loadTimers = async () => {
  try {
    const timers = await AsyncStorage.getItem(STORAGE_KEYS.TIMERS);
    return timers ? JSON.parse(timers) : [];
  } catch (error) {
    console.error('Error loading timers:', error);
    return [];
  }
};

// Save completed timer to history
export const addToHistory = async (completedTimer:any) => {
  try {
    const history = await loadHistory();
    history.push(completedTimer);
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving timer history:', error);
  }
};

// Load timer history from AsyncStorage
export const loadHistory = async () => {
  try {
    const history = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading timer history:', error);
    return [];
  }
};

// Clear all timer history
export const clearHistory = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (error) {
    console.error('Error clearing timer history:', error);
  }
};