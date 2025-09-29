const STORAGE_PREFIX = 'lcdcf:data:';
const DATA_PATH = 'data';

const memoryCache = new Map<string, unknown>();

const ensureTrailingSlash = (value: string): string => (value.endsWith('/') ? value : `${value}/`);

const baseUrl = ensureTrailingSlash(import.meta.env.BASE_URL ?? '/');

const buildDataUrl = (file: string): string => {
  if (baseUrl === './') {
    return `./${DATA_PATH}/${file}`;
  }

  if (baseUrl === '/') {
    return `/${DATA_PATH}/${file}`;
  }

  return `${baseUrl}${DATA_PATH}/${file}`;
};

const getStorageKey = (file: string): string => `${STORAGE_PREFIX}${file}`;

const isBrowserEnvironment = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const fetchInitialData = async <T>(file: string): Promise<T> => {
  const url = buildDataUrl(file);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Impossibile caricare il file ${file} (status ${response.status}).`);
  }
  return response.json() as Promise<T>;
};

const readFromStorage = <T>(file: string): T | null => {
  if (!isBrowserEnvironment()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(file));
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[localDb] Impossibile leggere ${file} da localStorage:`, error);
    window.localStorage.removeItem(getStorageKey(file));
    return null;
  }
};

const writeToStorage = <T>(file: string, data: T): void => {
  if (!isBrowserEnvironment()) {
    return;
  }

  try {
    window.localStorage.setItem(getStorageKey(file), JSON.stringify(data));
  } catch (error) {
    console.warn(`[localDb] Impossibile salvare ${file} su localStorage:`, error);
  }
};

export interface DataFile<T> {
  data: T;
  sha?: string;
}

export interface SaveResult<T> extends DataFile<T> {
  commitUrl?: string;
}

export const loadDataFile = async <T>(file: string): Promise<DataFile<T>> => {
  if (memoryCache.has(file)) {
    return { data: memoryCache.get(file) as T };
  }

  const stored = readFromStorage<T>(file);
  if (stored) {
    memoryCache.set(file, stored);
    return { data: stored };
  }

  const data = await fetchInitialData<T>(file);
  memoryCache.set(file, data);
  return { data };
};

export const saveDataFile = async <T>(file: string, data: T): Promise<SaveResult<T>> => {
  memoryCache.set(file, data);
  writeToStorage(file, data);
  return { data };
};
