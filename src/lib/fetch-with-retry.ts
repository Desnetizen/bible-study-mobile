import { withRetry } from './retry-helper';

const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);

export class HttpError extends Error {
  status: number;
  retryAfter: number | null;

  constructor(status: number, retryAfter: number | null) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const seconds = Number(header);
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : null;
}

export async function fetchJsonWithRetry(
  url: string,
  signal?: AbortSignal,
  maxRetries = 2,
): Promise<any> {
  return withRetry(
    async () => {
      const response = await fetch(url, { signal });

      if (response.ok) {
        return response.json();
      }

      if (!TRANSIENT_STATUSES.has(response.status)) {
        throw new HttpError(response.status, null);
      }

      throw new HttpError(response.status, parseRetryAfter(response.headers.get('Retry-After')));
    },
    (err) => err instanceof HttpError && TRANSIENT_STATUSES.has(err.status),
    { maxRetries, signal },
  );
}
