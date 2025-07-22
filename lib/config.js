// lib/config.js

export const CONFIG_KEY = 'screenConfigs';


  
export function loadConfig(screenId = 'screen-1') {
  if (typeof window === 'undefined') return Array(6).fill(null); // SSR safe
  const configs = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
  return configs[screenId] || Array(6).fill(null);
}

export function saveConfig(assignments, screenId = 'screen-1') {
  if (typeof window === 'undefined') return; // SSR safe
  const configs = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
  configs[screenId] = assignments;
  localStorage.setItem(CONFIG_KEY, JSON.stringify(configs));
}
