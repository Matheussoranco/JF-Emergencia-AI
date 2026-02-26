
export const STORAGE_KEYS = {
  REPORTS: 'jf_alerta_reports',
  DONATION_CENTERS: 'jf_alerta_donation_centers',
  API_KEY: 'jf_alerta_claude_key',
  LAST_AI_REPORT: 'jf_alerta_last_ai_report'
};

export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

export const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};
