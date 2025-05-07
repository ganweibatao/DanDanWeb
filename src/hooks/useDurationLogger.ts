import { useEffect, useRef } from 'react';
import { reportDurationLog, DurationLogPayload } from '../services/trackingApi';

const DURATION_CACHE_KEY = 'pending_duration_logs';
const LOCK_KEY = 'duration_lock';
const LOCK_EXPIRE = 10000; // 10秒
const HEARTBEAT = 5 * 60 * 1000; // 5分钟

// --- Helper for consistent logging ---
function logDebug(message: string, ...args: any[]) {
  console.log(`[DurationLogger ${getTabId()}] ${message}`, ...args);
}

function getTabId() {
  if (!window.name) window.name = Math.random().toString(36).slice(2);
  return window.name;
}

function acquireLock(tabId: string) {
  const now = Date.now();
  const lock = JSON.parse(localStorage.getItem(LOCK_KEY) || '{}');
  if (!lock.tabId || now - lock.timestamp > LOCK_EXPIRE) {
    localStorage.setItem(LOCK_KEY, JSON.stringify({ tabId, timestamp: now }));
    // logDebug('Acquired lock (new or expired)');
    return true;
  }
  const acquired = lock.tabId === tabId;
  // logDebug(`Attempt acquire lock: ${acquired ? 'Success' : 'Failed (Owned by ' + lock.tabId + ')'}`);
  return acquired;
}

function renewLock(tabId: string) {
  localStorage.setItem(LOCK_KEY, JSON.stringify({ tabId, timestamp: Date.now() }));
  // logDebug('Renewed lock'); // This can be very noisy, uncomment if needed
}

function savePendingLog(log: DurationLogPayload & { student?: string | number | null }) {
  // logDebug('Saving pending log to LocalStorage:', log); 
  try {
    const logs = JSON.parse(localStorage.getItem(DURATION_CACHE_KEY) || '[]');
    logs.push(log);
    localStorage.setItem(DURATION_CACHE_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Error saving pending log to LocalStorage:', error);
  }
}

function flushPendingLogs() {
  // logDebug('Attempting to flush pending logs from LocalStorage...');
  let logs: any[] = [];
  try {
    logs = JSON.parse(localStorage.getItem(DURATION_CACHE_KEY) || '[]');
  } catch (error) {
    console.error('Error reading pending logs from LocalStorage:', error);
    return; // Cannot proceed if reading fails
  }

  if (logs.length === 0) {
    // logDebug('No pending logs to flush.');
    return;
  }

  // logDebug(`Found ${logs.length} pending logs. Attempting to report...`);
  const remain: any[] = [];
  const reportPromises = logs.map((log: DurationLogPayload & { student?: string | number | null }) => {
    // logDebug('Attempting to report pending log:', log);
    return reportDurationLog(log)
      .then(() => {
        // logDebug('Successfully reported pending log:', log);
      })
      .catch((error) => {
        // logDebug('Failed to report pending log, keeping it:', log, 'Error:', error);
        remain.push(log); // Keep log if reporting failed
      });
  });

  // Wait for all reports to attempt completion
  Promise.allSettled(reportPromises).then(() => {
      if (remain.length > 0) {
          // logDebug(`Finished flushing. ${remain.length} logs remain pending.`);
          try {
              localStorage.setItem(DURATION_CACHE_KEY, JSON.stringify(remain));
          } catch (error) {
              console.error('Error saving remaining pending logs to LocalStorage:', error);
          }
      } else {
          // logDebug('Finished flushing. All pending logs reported successfully. Removing cache key.');
          localStorage.removeItem(DURATION_CACHE_KEY);
      }
  });
}

export function useDurationLogger(
  userId: string | undefined,
  type: 'learning' | 'teaching' | 'other' | undefined,
  studentId?: string | number | null
) {
  const tabId = useRef(getTabId()); // Initialize tabId ref immediately
  const startTimeRef = useRef(Date.now());
  const timer = useRef<NodeJS.Timeout | null>(null);
  const lockTimer = useRef<NodeJS.Timeout | null>(null);
  const isActive = useRef(false);
  const unloadedRef = useRef(false);

  // Log hook initialization
  useEffect(() => {
      // logDebug(`Hook initialized. Type: ${type}, UserID: ${userId}, StudentID: ${studentId}`);
      return () => {
          // logDebug('Hook cleanup.');
      };
  }, [type, userId, studentId]);


  useEffect(() => {
    if (!type) {
        // logDebug('Type is undefined, logger inactive.');
        return;
    }
    // logDebug('Effect re-running. Resetting unloaded state.');
    unloadedRef.current = false; // Reset unloaded state when effect runs

    function tryAcquire() {
      if (acquireLock(tabId.current)) {
        if (!isActive.current) {
          // logDebug('Lock acquired and becoming active. Starting timer.');
          isActive.current = true;
          startTimeRef.current = Date.now();
          unloadedRef.current = false; // Ensure unloaded is false when becoming active
        }
        renewLock(tabId.current);
      } else {
        if (isActive.current) {
          // logDebug('Lost lock, becoming inactive.');
          isActive.current = false;
          // Attempt to log duration before losing lock if not already unloaded
          if (!unloadedRef.current) {
            // logDebug('Lost lock, triggering handleUnload.');
            handleUnload();
          }
        }
      }
    }

    // logDebug('Setting up interval timer for heartbeat reporting.');
    timer.current = setInterval(() => {
      if (!isActive.current) {
         // logDebug('Interval: Inactive, skipping report.'); // Can be noisy
         return;
      }
      const now = Date.now();
      const duration = Math.floor((now - startTimeRef.current) / 1000);
      // logDebug(`Interval: Active. Calculated duration: ${duration}s`);

      if (duration > 0) {
        const payload: DurationLogPayload & { student?: string | number | null } = {
          type,
          duration,
          client_start_time: new Date(startTimeRef.current).toISOString(),
          client_end_time: new Date(now).toISOString(),
        };
        if (type === 'teaching' && studentId) {
          payload.student = studentId;
        }

        // logDebug('Interval: Attempting to report duration log:', payload);
        reportDurationLog(payload)
          .then(() => {
            logDebug('Interval: Successfully reported log.');
          })
          .catch((error) => {
            logDebug('Interval: Failed to report log, saving to pending.', error);
            savePendingLog(payload);
          });
        // Reset start time AFTER attempting report
        // logDebug(`Interval: Resetting start time to ${new Date(now).toISOString()}`);
        startTimeRef.current = now;
      } else {
          // logDebug('Interval: Duration is 0, skipping report.');
      }
    }, HEARTBEAT);

    // logDebug('Setting up lock renewal timer and storage listener.');
    lockTimer.current = setInterval(tryAcquire, 2000);
    window.addEventListener('storage', tryAcquire);

    const handleUnload = () => {
      // logDebug(`handleUnload triggered. unloaded: ${unloadedRef.current}, active: ${isActive.current}`);
      if (unloadedRef.current || !isActive.current || !type) {
        // If already unloaded, but holds the lock, maybe release it?
        if (unloadedRef.current) {
            const lock = JSON.parse(localStorage.getItem(LOCK_KEY) || '{}');
            if (lock.tabId === tabId.current) {
                // logDebug('Releasing lock even though already unloaded.');
                localStorage.removeItem(LOCK_KEY);
            }
        }
        return;
      }


      const now = Date.now();
      const duration = Math.floor((now - startTimeRef.current) / 1000);
      // logDebug(`Calculated duration: ${duration}s`);

      // Mark as unloaded and inactive *immediately*
      // logDebug('Marking as unloaded and inactive.');
      unloadedRef.current = true;
      isActive.current = false;


      if (duration > 0) {
        const payload: DurationLogPayload & { student?: string | number | null } = {
          type,
          duration,
          client_start_time: new Date(startTimeRef.current).toISOString(),
          client_end_time: new Date(now).toISOString(),
        };
        if (type === 'teaching' && studentId) {
          payload.student = studentId;
        }

        // logDebug('Attempting to report duration log:', payload);
        reportDurationLog(payload)
          .then(() => {
              // logDebug('Successfully reported log.');
          })
          .catch((error) => {
            // logDebug('Failed to report log immediately, saving to pending.', error);
            savePendingLog(payload);
          });
      } else {
           // logDebug('Duration is 0, skipping report/save.');
      }

      // Release lock if held by this tab
      const lock = JSON.parse(localStorage.getItem(LOCK_KEY) || '{}');
      if (lock.tabId === tabId.current) {
        // logDebug('Releasing lock.');
        localStorage.removeItem(LOCK_KEY);
      } else {
        //  logDebug(`Lock not held by this tab (current lock: ${lock.tabId || 'none'}).`);
      }
    };

    const handleVisibilityChange = () => {
      // logDebug(`Visibility changed to: ${document.visibilityState}`);
      if (document.visibilityState === 'hidden') {
        // logDebug('Visibility hidden, calling handleUnload.');
        handleUnload();
      } else if (document.visibilityState === 'visible') {
        // logDebug('Visibility visible, resetting unloaded state and attempting lock acquire.');
        unloadedRef.current = false; // Reset unloaded state
        tryAcquire(); // Try to become active again
      }
    };

    // logDebug('Adding event listeners: beforeunload, visibilitychange, online, load.');
    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', flushPendingLogs);
    // Run flush on load AND hook init to catch logs from previous sessions
    window.addEventListener('load', flushPendingLogs);
    flushPendingLogs(); // Initial flush attempt

    // logDebug('Initial attempt to acquire lock.');
    tryAcquire(); // Initial attempt to acquire lock

    // Cleanup function
    return () => {
      // logDebug('Running effect cleanup...');
      if (timer.current) {
         // logDebug('Clearing interval timer.');
         clearInterval(timer.current);
      }
      if (lockTimer.current) {
          // logDebug('Clearing lock timer.');
          clearInterval(lockTimer.current);
      }

      // logDebug('Removing event listeners.');
      window.removeEventListener('storage', tryAcquire);
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', flushPendingLogs);
      window.removeEventListener('load', flushPendingLogs);

      // Final attempt to handle unload ensures data is captured on component unmount
      // logDebug('Calling handleUnload one last time during cleanup.');
      handleUnload();
      // logDebug('Cleanup finished.');
    };
  }, [type, studentId]); // Dependencies: type and studentId
} 