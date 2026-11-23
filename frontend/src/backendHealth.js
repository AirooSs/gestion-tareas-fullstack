const aborted = () => new DOMException('Aborted', 'AbortError');

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const onAbort = () => { clearTimeout(timer); reject(aborted()); };
    const timer = setTimeout(() => { signal?.removeEventListener('abort', onAbort); resolve(); }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
    if (signal?.aborted) onAbort();
  });
}

export async function waitForBackend(url, {
  signal, timeoutMs = 90000, requestTimeoutMs = 10000,
  initialDelayMs = 1000, maxDelayMs = 10000, fetchImpl = fetch,
} = {}) {
  const deadline = Date.now() + timeoutMs;
  let delay = initialDelayMs;
  let lastFailure = 'connection';

  while (Date.now() < deadline) {
    if (signal?.aborted) throw aborted();
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, Math.min(requestTimeoutMs, deadline - Date.now()));
    let response;
    try {
      response = await fetchImpl(url, { signal: controller.signal, cache: 'no-store' });
      if (signal?.aborted) throw aborted();
    } catch (error) {
      if (signal?.aborted) throw aborted();
      if (!timedOut && !(error instanceof TypeError)) throw error;
      lastFailure = timedOut ? 'timeout' : 'connection';
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
    }
    if (response) {
      if (response.ok) return;
      if (![408, 429, 500, 502, 503, 504].includes(response.status)) throw new Error('permanent');
      lastFailure = 'server';
    }
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    await wait(Math.min(delay, remaining), signal);
    delay = Math.min(delay * 2, maxDelayMs);
  }
  throw new Error(lastFailure);
}
