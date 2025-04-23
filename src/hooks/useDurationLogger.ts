import { useEffect, useRef } from 'react';
import { reportDurationLog } from '../services/trackingApi';

const DURATION_CACHE_KEY = 'pending_duration_logs';
const LOCK_KEY = 'duration_lock';
const LOCK_EXPIRE = 10000; // 10秒
const HEARTBEAT = 5 * 60 * 1000; // 5分钟

function getTabId() {
  if (!window.name) window.name = Math.random().toString(36).slice(2);
  return window.name;
}

function acquireLock(tabId: string) {
  const now = Date.now();
  const lock = JSON.parse(localStorage.getItem(LOCK_KEY) || '{}');
  if (!lock.tabId || now - lock.timestamp > LOCK_EXPIRE) {
    localStorage.setItem(LOCK_KEY, JSON.stringify({ tabId, timestamp: now }));
    return true;
  }
  return lock.tabId === tabId;
}

function renewLock(tabId: string) {
  localStorage.setItem(LOCK_KEY, JSON.stringify({ tabId, timestamp: Date.now() }));
}

function savePendingLog(log: any) {
  const logs = JSON.parse(localStorage.getItem(DURATION_CACHE_KEY) || '[]');
  logs.push(log);
  localStorage.setItem(DURATION_CACHE_KEY, JSON.stringify(logs));
}

function flushPendingLogs() {
  const logs = JSON.parse(localStorage.getItem(DURATION_CACHE_KEY) || '[]');
  if (logs.length === 0) return;
  const remain: any[] = [];
  logs.forEach((log: any) => {
    reportDurationLog(log).catch(() => remain.push(log));
  });
  if (remain.length > 0) {
    localStorage.setItem(DURATION_CACHE_KEY, JSON.stringify(remain));
  } else {
    localStorage.removeItem(DURATION_CACHE_KEY);
  }
}

export function useDurationLogger(userId: string, type: 'learning' | 'teaching' | 'other') {
  const tabId = useRef(getTabId());
  const startTimeRef = useRef(Date.now());
  const timer = useRef<NodeJS.Timeout | null>(null);
  const lockTimer = useRef<NodeJS.Timeout | null>(null);
  const isActive = useRef(false);

  useEffect(() => {
    function tryAcquire() {
      if (acquireLock(tabId.current)) {
        if (!isActive.current) {
          isActive.current = true;
          startTimeRef.current = Date.now();
        }
        renewLock(tabId.current);
      } else {
        if (isActive.current) {
          isActive.current = false;
        }
      }
    }

    // 定时心跳上报
    timer.current = setInterval(() => {
      if (!isActive.current) return;
      const now = Date.now();
      const duration = Math.floor((now - startTimeRef.current) / 1000);
      if (duration > 0) {
        const log = {
          user: userId,
          type,
          duration,
          client_start_time: new Date(startTimeRef.current).toISOString(),
          client_end_time: new Date(now).toISOString(),
        };
        reportDurationLog(log).catch(() => savePendingLog(log));
        startTimeRef.current = now;
      }
    }, HEARTBEAT);

    // 多标签页互斥锁定
    lockTimer.current = setInterval(tryAcquire, 2000);
    window.addEventListener('storage', tryAcquire);

    // 页面关闭/刷新/切后台
    const handleUnload = () => {
      if (!isActive.current) return;
      const now = Date.now();
      const duration = Math.floor((now - startTimeRef.current) / 1000);
      if (duration > 0) {
        const log = {
          user: userId,
          type,
          duration,
          client_start_time: new Date(startTimeRef.current).toISOString(),
          client_end_time: new Date(now).toISOString(),
        };
        // 优先用 sendBeacon 兜底
        try {
          const blob = new Blob([JSON.stringify(log)], { type: 'application/json' });
          if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/v1/tracking/logs/', blob);
          }
        } catch (e) {
          // 忽略 sendBeacon 错误
        }
        // 同时本地缓存一份
        savePendingLog(log);
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') handleUnload();
    });
    window.addEventListener('online', flushPendingLogs);
    window.addEventListener('load', flushPendingLogs);

    // 首次加载时尝试补发
    flushPendingLogs();
    tryAcquire();

    return () => {
      if (timer.current) clearInterval(timer.current);
      if (lockTimer.current) clearInterval(lockTimer.current);
      window.removeEventListener('storage', tryAcquire);
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleUnload);
      window.removeEventListener('online', flushPendingLogs);
      window.removeEventListener('load', flushPendingLogs);
      // 释放锁
      const lock = JSON.parse(localStorage.getItem(LOCK_KEY) || '{}');
      if (lock.tabId === tabId.current) {
        localStorage.removeItem(LOCK_KEY);
      }
      handleUnload();
    };
  }, [userId, type]);
} 