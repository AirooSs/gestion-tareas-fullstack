const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '');
export const HEALTH_URL = `${API_URL}/health`;
const KEY = 'demo-session';
let pendingSession;

export async function startSession() {
  const stored = sessionStorage.getItem(KEY);
  if (stored) {
    const session = JSON.parse(stored);
    if (Date.parse(session.expiresAt) <= Date.now()) throw new Error('expired');
    return;
  }
  if (!pendingSession) {
    pendingSession = (async () => {
      const response = await fetch(`${API_URL}/api/demo/session`, { method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error('unavailable');
      const session = await response.json();
      sessionStorage.setItem(KEY, JSON.stringify(session));
    })().finally(() => { pendingSession = null; });
  }
  return pendingSession;
}

export function resetSession() { sessionStorage.removeItem(KEY); }

export async function apiFetch(path, options = {}) {
  const session = JSON.parse(sessionStorage.getItem(KEY) || 'null');
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { ...options.headers, Authorization: `Bearer ${session?.token || ''}` } });
  const current = JSON.parse(sessionStorage.getItem(KEY) || 'null');
  if (current?.token !== session?.token) throw new Error('stale-session');
  if (response.status === 401) { window.dispatchEvent(new Event('demo-expired')); throw new Error('expired'); }
  if (response.status === 429) { window.dispatchEvent(new Event('demo-limit')); throw new Error('limit'); }
  if (!response.ok) throw new Error('request-failed');
  return response;
}
