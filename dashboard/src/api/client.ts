export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

const DEFAULT_TIMEOUT_MS = 15_000;

const baseUrl = () => {
  const configured = import.meta.env.VITE_API_BASE_URL;
  return configured ? configured.replace(/\/$/, '') : '';
};

function buildUrl(path: string, params?: Record<string, unknown>) {
  const url = new URL(`${baseUrl()}${path.startsWith('/') ? path : `/${path}`}`, window.location.origin);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, String(item)));
      return;
    }
    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

async function request<T>(method: string, path: string, body?: unknown, params?: Record<string, unknown>): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(buildUrl(path, params), {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type') ?? '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      const error: ApiError = {
        status: response.status,
        message:
          typeof payload === 'object' && payload !== null && 'error' in payload
            ? String((payload as { error: unknown }).error)
            : `Request failed with HTTP ${response.status}`,
        details: payload,
      };
      throw error;
    }

    return payload as T;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw { status: 0, message: 'Request timed out' } satisfies ApiError;
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function apiGet<T>(path: string, params?: Record<string, unknown>) {
  return request<T>('GET', path, undefined, params);
}

export function apiPost<T>(path: string, body: unknown) {
  return request<T>('POST', path, body);
}

export function apiPatch<T>(path: string, body: unknown) {
  return request<T>('PATCH', path, body);
}

export function apiDelete<T>(path: string) {
  return request<T>('DELETE', path);
}
