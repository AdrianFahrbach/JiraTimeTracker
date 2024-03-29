import { atom } from 'jotai';
import { deleteRemoteWorklog, getRemoteWorklogs } from '../services/jira.service';
import { syncWorklogs } from '../services/worklog.service';
import { Worklog, WorklogState } from '../types/global.types';
import { userInfoAtom } from './auth';
import { selectedDateAtom } from './navigation';
import { store } from './store';

export const currentWorklogToEditAtom = atom<Worklog | null>(null);

export const worklogsLocalAtom = atom<Worklog[]>([]);
export const worklogsRemoteAtom = atom<Worklog[]>([]);
/**
 * Local and remote worklogs combined.
 * Local worklogs are prioritized over remote worklogs.
 */
export const worklogsAtom = atom<Worklog[]>(get => {
  const local = get(worklogsLocalAtom);
  const remote = get(worklogsRemoteAtom).filter(worklog => !local.some(w => w.id === worklog.id));
  return [...remote, ...local].sort((a, b) => a.id.localeCompare(b.id));
});
const activeWorklogIdAtom = atom<string | null>(null);
export const activeWorklogAtom = atom(get => {
  const worklogId = get(activeWorklogIdAtom);
  return get(worklogsAtom).find(worklog => worklog.id === worklogId) ?? null;
});
export const lastActiveWorklogIdAtom = atom<string | null>(null);
/**
 * Unix timestamp where the tracking of the active worklog started
 */
const activeWorklogTrackingStartedAtom = atom(0);
/**
 * Duration in seconds of the currently running worklog
 */
export const activeWorklogTrackingDurationAtom = atom(0);

/**
 * Tick every 10 seconds to update the current duration
 */
setInterval(() => {
  const activeWorklog = store.get(activeWorklogAtom);
  if (!activeWorklog) {
    return;
  }

  const start = store.get(activeWorklogTrackingStartedAtom);
  let diff: number;
  if (start === 0) {
    diff = 0;
  } else {
    const raw = Date.now() - start;
    // Round to nearest minute
    diff = Math.floor(raw / 1000 / 60) * 60;
  }
  store.set(activeWorklogTrackingDurationAtom, diff);
}, 10_000);

export const worklogsForCurrentDayAtom = atom(get => {
  const worklogs = get(worklogsAtom);
  return worklogs.filter(worklog => worklog.started === get(selectedDateAtom));
});

export const syncWorklogsForCurrentDayAtom = atom(null, async (get, set) => {
  const localWorklogs = get(worklogsLocalAtom);
  const worklogsToSync = get(worklogsForCurrentDayAtom).filter(w => localWorklogs.find(lw => lw.id === w.id));
  await syncWorklogs(worklogsToSync);

  const userInfo = get(userInfoAtom);
  const updatedWorklogs = await getRemoteWorklogs(userInfo!.accountId!);
  set(worklogsRemoteAtom, updatedWorklogs);

  // Remove local worklogs that have been synced
  set(worklogsLocalAtom, worklogs => worklogs.filter(w => !worklogsToSync.find(lw => lw.id === w.id)));

  return updatedWorklogs;
});

export const addWorklogAtom = atom(null, async (_get, set, worklog: Worklog) => {
  set(worklogsLocalAtom, worklogs => [...worklogs, worklog]);
  set(setWorklogAsActiveAtom, worklog.id);
});
export const setWorklogAsActiveAtom = atom(null, (get, set, worklogId: string | null) => {
  const activeWorklog = get(activeWorklogAtom);
  const activeWorklogTrackingDuration = get(activeWorklogTrackingDurationAtom);

  if (activeWorklog && activeWorklogTrackingDuration > 0) {
    set(updateWorklogAtom, {
      ...activeWorklog,
      timeSpentSeconds: activeWorklog.timeSpentSeconds + activeWorklogTrackingDuration,
    });
  }

  set(activeWorklogIdAtom, worklogId);
  if (worklogId) {
    set(lastActiveWorklogIdAtom, worklogId);
  }
  set(activeWorklogTrackingDurationAtom, 0);
  set(activeWorklogTrackingStartedAtom, Date.now());
});
export const updateWorklogAtom = atom(null, (get, set, worklog: Worklog) => {
  if (worklog.state !== WorklogState.LOCAL) {
    worklog.state = WorklogState.EDITED;
  }
  const currentWorklogs = get(worklogsLocalAtom);
  const exists = currentWorklogs.some(w => w.id === worklog.id);
  if (exists) {
    set(worklogsLocalAtom, worklogs => worklogs.map(w => (w.id === worklog.id ? worklog : w)));
  } else {
    set(worklogsLocalAtom, worklogs => [...worklogs, worklog]);
  }
});
export const deleteWorklogAtom = atom(null, async (get, set, worklogId: string) => {
  const worklogsRemote = get(worklogsRemoteAtom);
  const worklogRemote = worklogsRemote.find(w => w.id === worklogId);
  if (worklogRemote) {
    await deleteRemoteWorklog(worklogRemote);
    set(
      worklogsRemoteAtom,
      worklogsRemote.filter(w => w.id !== worklogId)
    );
  }
  const worklogsLocal = get(worklogsLocalAtom);
  const worklogLocal = worklogsLocal.find(w => w.id === worklogId);
  if (worklogLocal) {
    set(
      worklogsLocalAtom,
      worklogsLocal.filter(w => w.id !== worklogId)
    );
  }
});
