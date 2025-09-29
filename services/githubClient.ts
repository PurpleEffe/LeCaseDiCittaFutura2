declare const Buffer: { from(input: string, encoding?: string): { toString(encoding: string): string } } | undefined;

const memoryCache = new Map<string, unknown>();

const ensureTrailingSlash = (value: string): string => (value.endsWith('/') ? value : `${value}/`);
const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const encodeToBase64 = (value: string): string => {
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    return window.btoa(unescape(encodeURIComponent(value)));
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value, 'utf-8').toString('base64');
  }
  const encoder = new TextEncoder();
  const bytes = encoder.encode(value);
  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  if (typeof btoa === 'function') {
    return btoa(binary);
  }
  throw new Error('Impossibile eseguire la codifica Base64 nell\'ambiente corrente.');
};

const githubConfig = {
  owner: import.meta.env.VITE_GITHUB_OWNER,
  repo: import.meta.env.VITE_GITHUB_REPO,
  branch: import.meta.env.VITE_GITHUB_BRANCH ?? 'main',
  token: import.meta.env.VITE_GITHUB_TOKEN,
  dataDir: trimTrailingSlash(import.meta.env.VITE_GITHUB_DATA_DIR ?? 'public/data'),
  remoteDataBaseUrl: import.meta.env.VITE_GITHUB_PAGES_BASE_URL ? trimTrailingSlash(import.meta.env.VITE_GITHUB_PAGES_BASE_URL) : null,
};

const supportsWrites = Boolean(githubConfig.owner && githubConfig.repo && githubConfig.token);

const buildLocalDataUrl = (file: string): string => {
  const baseUrl = ensureTrailingSlash(import.meta.env.BASE_URL ?? '/');
  if (baseUrl === './') {
    return `./data/${file}`;
  }
  if (baseUrl === '/') {
    return `/data/${file}`;
  }
  return `${trimTrailingSlash(baseUrl)}/data/${file}`;
};

const buildRemoteDataUrl = (file: string): string | null => {
  if (githubConfig.remoteDataBaseUrl) {
    return `${githubConfig.remoteDataBaseUrl}/${file}`;
  }
  if (githubConfig.owner && githubConfig.repo) {
    return `https://raw.githubusercontent.com/${githubConfig.owner}/${githubConfig.repo}/${githubConfig.branch}/${buildContentsPath(file)}`;
  }
  return null;
};

const buildContentsPath = (file: string): string => `${githubConfig.dataDir}/${file}`;

const buildContentsUrl = (file: string): string => {
  if (!githubConfig.owner || !githubConfig.repo) {
    throw new Error('Configurazione GitHub mancante: specifica owner e repo nelle variabili ambiente.');
  }
  const base = `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/${buildContentsPath(file)}`;
  const params = new URLSearchParams({ ref: githubConfig.branch });
  return `${base}?${params.toString()}`;
};

const fetchJson = async <T>(file: string): Promise<T> => {
  const remoteUrl = buildRemoteDataUrl(file);
  const url = remoteUrl ?? buildLocalDataUrl(file);
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Impossibile caricare il file ${file} (status ${response.status}).`);
  }
  return response.json() as Promise<T>;
};

const fetchFileSha = async (file: string): Promise<string | undefined> => {
  try {
    const response = await fetch(buildContentsUrl(file), {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(githubConfig.token ? { Authorization: `Bearer ${githubConfig.token}` } : {}),
      },
    });

    if (response.status === 404) {
      return undefined;
    }

    if (!response.ok) {
      throw new Error(`Impossibile ottenere lo SHA del file ${file} (status ${response.status}).`);
    }

    const payload = await response.json() as { sha?: string };
    return payload.sha;
  } catch (error) {
    console.warn('[githubClient] Errore durante il recupero dello SHA:', error);
    return undefined;
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

  const data = await fetchJson<T>(file);
  memoryCache.set(file, data);

  let sha: string | undefined;
  if (supportsWrites) {
    sha = await fetchFileSha(file);
  }

  return { data, sha };
};

export const saveDataFile = async <T>(file: string, data: T): Promise<SaveResult<T>> => {
  if (!supportsWrites) {
    throw new Error('Il salvataggio richiede la configurazione delle variabili GitHub e di un token.');
  }

  const existingSha = await fetchFileSha(file);
  const response = await fetch(buildContentsUrl(file), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${githubConfig.token}`,
    },
    body: JSON.stringify({
      message: `Aggiorna ${file}`,
      content: encodeToBase64(`${JSON.stringify(data, null, 2)}\n`),
      branch: githubConfig.branch,
      ...(existingSha ? { sha: existingSha } : {}),
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(`Impossibile salvare ${file} su GitHub (status ${response.status}): ${JSON.stringify(errorPayload)}`);
  }

  const payload = await response.json() as { content?: { sha?: string }; commit?: { html_url?: string } };
  const sha = payload.content?.sha ?? existingSha;
  const commitUrl = payload.commit?.html_url;

  memoryCache.set(file, data);

  return { data, sha, commitUrl };
};
