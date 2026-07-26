export type RetryOptions = {
  maxRetries?: number;
  baseDelayMs?: number;
  signal?: AbortSignal;
};

function delayMs(attempt: number, baseDelayMs: number): number {
  const base = baseDelayMs * 2 ** attempt;
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

export async function withRetry<T>(
  fn: () => Promise<T>,
  isRetryable: (err: unknown) => boolean,
  options?: RetryOptions,
): Promise<T> {
  const { maxRetries = 2, baseDelayMs = 500, signal } = options ?? {};

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    try {
      return await fn();
    } catch (err: unknown) {
      if (attempt < maxRetries && isRetryable(err)) {
        console.warn(`[Retry] attempt ${attempt + 1}/${maxRetries} failed, retrying...`, String(err));
        await waitWithAbort(delayMs(attempt, baseDelayMs), signal);
        continue;
      }
      throw err;
    }
  }

  throw new Error('Unreachable');
}
