const defaultConfig = {
  owner: import.meta.env.VITE_GITHUB_OWNER as string | undefined,
  repo: import.meta.env.VITE_GITHUB_REPO as string | undefined,
  branch: (import.meta.env.VITE_GITHUB_BRANCH as string | undefined) ?? 'main',
  token: import.meta.env.VITE_GITHUB_TOKEN as string | undefined,
  pagesBaseUrl: (import.meta.env.VITE_GITHUB_PAGES_BASE_URL as string | undefined)?.replace(/\/$/, ''),
  repoDataPath: (import.meta.env.VITE_GITHUB_DATA_PATH as string | undefined) ?? 'public/data',
  pagesDataPath: (import.meta.env.VITE_GITHUB_PAGES_DATA_PATH as string | undefined) ?? 'data',
};

const memoryCache = new Map<string, unknown>();

const base64Encode = (value: string): string => {
  if (typeof btoa === 'function') {
    return btoa(unescape(encodeURIComponent(value)));
  }
  // @ts-ignore - Buffer exists in Node environments (build/tests)
  return Buffer.from(value, 'utf-8').toString('base64');
};

const base64Decode = (value: string): string => {
  if (typeof atob === 'function') {
    return decodeURIComponent(escape(atob(value)));
  }
  // @ts-ignore - Buffer exists in Node environments (build/tests)
  return Buffer.from(value, 'base64').toString('utf-8');
};

const joinPath = (...segments: string[]): string => segments
  .filter(Boolean)
  .map(segment => segment.replace(/^\/+|\/+$/g, ''))
  .filter(Boolean)
  .join('/');

const encodePath = (path: string): string => path.split('/')
  .map(encodeURIComponent)
  .join('/');

interface GitHubContentResponse {
  sha: string;
  content: string;
  encoding: string;
}

interface GitHubWriteResponse {
  content: GitHubContentResponse;
  commit: {
    sha: string;
    html_url?: string;
  };
}

export interface DataFile<T> {
  data: T;
  sha?: string;
}

export interface SaveResult<T> extends DataFile<T> {
  commitUrl?: string;
}

const getConfig = () => defaultConfig;

const hasRepoConfiguration = (): boolean => Boolean(defaultConfig.owner && defaultConfig.repo);
const hasWriteConfiguration = (): boolean => Boolean(defaultConfig.owner && defaultConfig.repo && defaultConfig.token);

const fetchJsonFromPages = async <T>(file: string): Promise<T> => {
  const config = getConfig();
  const path = joinPath(config.pagesDataPath, file);
  const base = config.pagesBaseUrl ?? '';
  const url = base ? `${base}/${path}` : `/${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Impossibile caricare ${path} da GitHub Pages (status ${response.status}).`);
  }
  return response.json() as Promise<T>;
};

const fetchJsonFromRepo = async <T>(file: string): Promise<DataFile<T>> => {
  if (!hasRepoConfiguration()) {
    const data = await fetchJsonFromPages<T>(file);
    return { data };
  }

  const config = getConfig();
  const path = joinPath(config.repoDataPath, file);
  const apiPath = `/repos/${config.owner}/${config.repo}/contents/${encodePath(path)}?ref=${config.branch}`;
  const response = await fetch(`https://api.github.com${apiPath}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error ${response.status} while fetching ${path}`);
  }

  const payload = await response.json() as GitHubContentResponse;
  const decoded = base64Decode(payload.content);
  return { data: JSON.parse(decoded) as T, sha: payload.sha };
};

export const loadDataFile = async <T>(file: string): Promise<DataFile<T>> => {
  if (memoryCache.has(file)) {
    return { data: memoryCache.get(file) as T };
  }

  try {
    return await fetchJsonFromRepo<T>(file);
  } catch (error) {
    console.warn(`[githubClient] Falling back to GitHub Pages for ${file}:`, error);
    const data = await fetchJsonFromPages<T>(file);
    return { data };
  }
};

export const saveDataFile = async <T>(file: string, data: T, sha?: string, message?: string): Promise<SaveResult<T>> => {
  if (!hasWriteConfiguration()) {
    memoryCache.set(file, data);
    console.warn(`[githubClient] Missing GitHub credentials; using in-memory persistence for ${file}.`);
    return { data };
  }

  const config = getConfig();
  const path = joinPath(config.repoDataPath, file);
  const apiPath = `/repos/${config.owner}/${config.repo}/contents/${encodePath(path)}`;
  const body = {
    message: message ?? `chore: update ${file} via app`,
    content: base64Encode(JSON.stringify(data, null, 2)),
    branch: config.branch,
    ...(sha ? { sha } : {}),
  };

  const response = await fetch(`https://api.github.com${apiPath}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API error ${response.status} while saving ${path}: ${errorText}`);
  }

  const payload = await response.json() as GitHubWriteResponse;
  const decoded = base64Decode(payload.content.content);
  const parsed = JSON.parse(decoded) as T;
  return {
    data: parsed,
    sha: payload.content.sha,
    commitUrl: payload.commit?.html_url,
  };
};

export const githubConfig = {
  hasRepoConfiguration,
  hasWriteConfiguration,
  get pagesBaseUrl() {
    return defaultConfig.pagesBaseUrl;
  },
};
