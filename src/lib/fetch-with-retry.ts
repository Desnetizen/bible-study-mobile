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

function delayMs(attempt: number, retryAfterMs: number | null): number {
  if (retryAfterMs !== null) return retryAfterMs;
  const base = 500 * 2 ** attempt;
  return Math.min(base, 8000);
}

function waitWithAbort(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

export async function fetchJsonWithRetry(
  url: string,
  signal?: AbortSignal,
  maxRetries = 2,
): Promise<any> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    let response: Response;

    try {
      response = await fetch(url, { signal });
    } catch (err: unknown) {
      if (attempt < maxRetries && err instanceof TypeError) {
        console.warn('[Fetch] Network failure, retrying...', String(err.message));
        await waitWithAbort(delayMs(attempt, null), signal);
        continue;
      }
      throw err;
    }

    if (response.ok) {
      return response.json();
    }

    if (!TRANSIENT_STATUSES.has(response.status)) {
      throw new HttpError(response.status, null);
    }

    if (attempt === maxRetries) {
      throw new HttpError(response.status, parseRetryAfter(response.headers.get('Retry-After')));
    }

    const retryAfterMs = parseRetryAfter(response.headers.get('Retry-After'));
    console.warn('[Fetch] HTTP', response.status, 'retrying...');
    await waitWithAbort(delayMs(attempt, retryAfterMs), signal);
  }

  throw new Error('Unreachable');
}
