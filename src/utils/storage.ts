import type { ActionItem } from '../types';

const STORAGE_KEY = 'brainstormer-running-list';

export const saveRunningList = (items: ActionItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save running list to localStorage:', error);
  }
};

export const loadRunningList = (): ActionItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as ActionItem[];
    }
  } catch (error) {
    console.error('Failed to load running list from localStorage:', error);
  }
  return [];
};

export const clearRunningList = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear running list from localStorage:', error);
  }
};
