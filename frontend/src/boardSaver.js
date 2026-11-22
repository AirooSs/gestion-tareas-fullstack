export function createBoardSaver({ isCurrent, save, confirm, reconcile, onState }) {
  const pending = new Map();
  const keyFor = ({ projectId, session }) => JSON.stringify([projectId, session]);
  async function check(context, key, conflict) {
    onState(context, { phase: 'checking' });
    const ok = await reconcile(context);
    if (!isCurrent(context)) { pending.delete(key); onState(context, null); return; }
    if (ok) {
      pending.delete(key);
      onState(context, { phase: 'error', message: conflict ? 'El tablero ha cambiado. Se ha actualizado; revisa el orden y vuelve a intentarlo.' : 'No se pudo confirmar el cambio. Se ha actualizado el tablero desde el servidor.' });
    } else {
      onState(context, { phase: 'unknown', message: 'No se pudo actualizar el tablero. Comprueba la conexión y vuelve a consultarlo antes de mover tareas.' });
    }
  }
  async function move(context, move) {
    const key = keyFor(context);
    if (!isCurrent(context) || pending.has(key)) return;
    pending.set(key, context);
    onState(context, { phase: 'saving' });
    try {
      const board = await save(context, move);
      if (isCurrent(context)) await confirm(context, board);
      pending.delete(key);
      onState(context, null);
    } catch (error) {
      if (!isCurrent(context)) { pending.delete(key); onState(context, null); return; }
      await check(context, key, error.status === 409);
    }
  }
  async function recheck(context) {
    const key = keyFor(context), original = pending.get(key);
    if (!original || original.checking || !isCurrent(context)) return;
    original.checking = true;
    try { await check(original, key, false); } finally { original.checking = false; }
  }
  return { move, recheck };
}
