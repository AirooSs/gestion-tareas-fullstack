export function createStatusSaver({ isCurrent, save, confirm, reconcile, onState }) {
  const pending = new Map();
  const keyFor = ({ projectId, session, taskId }) => JSON.stringify([projectId, session, taskId]);
  const emit = (context, value) => onState(context, value);

  async function check(context, key) {
    emit(context, { phase: 'checking' });
    const ok = await reconcile(context);
    if (pending.get(key) !== context) return;
    if (!isCurrent(context)) { pending.delete(key); emit(context, null); return; }
    if (ok) {
      pending.delete(key);
      emit(context, { phase: 'error', message: 'No se pudo confirmar el resultado del cambio. Se ha consultado el estado en el servidor.' });
    } else {
      emit(context, { phase: 'unknown', message: 'No se pudo confirmar el estado. Comprueba la conexión y consulta el servidor antes de volver a mover esta tarea.' });
    }
  }

  async function change(context, newStatus) {
    const key = keyFor(context);
    if (!isCurrent(context) || pending.has(key) || newStatus === context.status) return;
    pending.set(key, context);
    emit(context, { phase: 'saving' });
    try {
      const task = await save(context, newStatus);
      if (isCurrent(context)) await confirm(context, task);
      pending.delete(key);
      emit(context, null);
    } catch {
      if (!isCurrent(context)) { pending.delete(key); emit(context, null); return; }
      await check(context, key);
    }
  }

  async function recheck(context) {
    const key = keyFor(context);
    const original = pending.get(key);
    if (!original || original.checking || !isCurrent(context)) return;
    original.checking = true;
    try { await check(original, key); } finally { original.checking = false; }
  }

  return { change, recheck };
}
