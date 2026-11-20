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
  signal, timeoutMs = 120000, requestTimeoutMs = 15000, maxAttempts = 12,
  maxNetworkFailures = 3, initialDelayMs = 1000, maxDelayMs = 10000, fetchImpl = fetch,
} = {}) {
  const deadline = Date.now() + timeoutMs;
  let delay = initialDelayMs;
  let networkFailures = 0;
  let lastFailure = 'connection';

  for (let attempt = 0; attempt < maxAttempts && Date.now() < deadline; attempt++) {
    if (signal?.aborted) throw aborted();
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, Math.min(requestTimeoutMs, deadline - Date.now()));
    try {
      const response = await fetchImpl(url, { signal: controller.signal, cache: 'no-store' });
      if (signal?.aborted) throw aborted();
      if (response.ok) return;
      lastFailure = 'server';
      networkFailures = 0;
    } catch {
      if (signal?.aborted) throw aborted();
      lastFailure = timedOut ? 'timeout' : 'connection';
      if (!timedOut) networkFailures++;
      else networkFailures = 0;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
    }
    const remaining = deadline - Date.now();
    if (remaining <= 0 || attempt + 1 >= maxAttempts || networkFailures >= maxNetworkFailures) break;
    await wait(Math.min(delay, remaining), signal);
    delay = Math.min(delay * 2, maxDelayMs);
  }
  throw new Error(lastFailure);
}
