export function createTaskLoader({ fetchTasks, getSession, onTasks, onError }) {
  let current;
  let controller;
  let sequence = 0;

  function cancel() {
    sequence++;
    controller?.abort();
    controller = undefined;
  }

  function select(projectId, session) {
    cancel();
    current = projectId && session ? { projectId, session } : undefined;
  }

  async function load(projectId, session) {
    if (!current || current.projectId !== projectId || current.session !== session || getSession() !== session) return false;
    cancel();
    controller = new AbortController();
    const request = controller;
    const id = sequence;
    try {
      const response = await fetchTasks(projectId, request.signal);
      const tasks = await response.json();
      if (!request.signal.aborted && id === sequence && current?.projectId === projectId && current?.session === session && getSession() === session) {
        onTasks(tasks, projectId, session);
        return true;
      }
    } catch (error) {
      if (!request.signal.aborted && id === sequence && getSession() === session) onError(error);
    }
    return false;
  }

  return { select, load, cancel, isCurrent: (projectId, session) => current?.projectId === projectId && current?.session === session && getSession() === session };
}
