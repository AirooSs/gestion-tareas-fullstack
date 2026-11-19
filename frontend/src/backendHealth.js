export async function waitForBackend(url, { signal, timeoutMs = 150000, fetchImpl = fetch } = {}) {
  const deadline = Date.now() + timeoutMs;
  let delay = 1000;
  let lastFailure = 'connection';
  while (Date.now() < deadline) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    const timer = setTimeout(abort, Math.min(10000, deadline - Date.now()));
    try {
      const response = await fetchImpl(url, { signal: controller.signal, cache: 'no-store' });
      if (response.ok) return;
      lastFailure = 'server';
    } catch (error) {
      if (signal?.aborted) throw error;
      lastFailure = 'connection';
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
    }
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    await new Promise((resolve, reject) => {
      const onAbort = () => { clearTimeout(wait); reject(new DOMException('Aborted', 'AbortError')); };
      const wait = setTimeout(() => { signal?.removeEventListener('abort', onAbort); resolve(); }, Math.min(delay, remaining));
      signal?.addEventListener('abort', onAbort, { once: true });
      if (signal?.aborted) onAbort();
    });
    delay = Math.min(delay * 2, 10000);
  }
  throw new Error(lastFailure);
}
