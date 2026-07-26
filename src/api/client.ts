// Configuración de la capa de datos. Sin VITE_API_URL, la app corre 100% local
// (inventario en localStorage). Cuando exista el backend Mongo, definir la variable
// activa el modo HTTP sin tocar la UI.
export const STORAGE_KEY = 'ganado.inventory';

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
export const usingLocal = !API_URL;
export const apiBaseUrl = API_URL ?? '';

// API key (modo http): se guarda en localStorage y se envía como x-api-key.
export const API_KEY_STORAGE = 'ganado.apikey';
export const getApiKey = () => localStorage.getItem(API_KEY_STORAGE) || '';
export const setApiKey = (k: string) => localStorage.setItem(API_KEY_STORAGE, k);
export const clearApiKey = () => localStorage.removeItem(API_KEY_STORAGE);
