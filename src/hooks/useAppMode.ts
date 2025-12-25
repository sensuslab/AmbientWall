import { useState, useEffect, useCallback, useRef } from 'react';
import type { AppMode } from '../types';

const AMBIENT_TIMEOUT = 90000;

interface UseAppModeReturn {
  mode: AppMode;
  isAmbient: boolean;
  isInteraction: boolean;
  isEdit: boolean;
  isCalibration: boolean;
  enterEdit: () => void;
  exitEdit: () => void;
  toggleEdit: () => void;
  enterCalibration: () => void;
  exitCalibration: () => void;
  recordActivity: () => void;
}

export function useAppMode(): UseAppModeReturn {
  const [mode, setMode] = useState<AppMode>('ambient');
  const timeoutRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const clearAmbientTimeout = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleAmbientReturn = useCallback(() => {
    clearAmbientTimeout();
    timeoutRef.current = window.setTimeout(() => {
      setMode('ambient');
    }, AMBIENT_TIMEOUT);
  }, [clearAmbientTimeout]);

  const recordActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (mode === 'ambient') {
      setMode('interaction');
    }
    if (mode === 'interaction') {
      scheduleAmbientReturn();
    }
  }, [mode, scheduleAmbientReturn]);

  const enterEdit = useCallback(() => {
    clearAmbientTimeout();
    setMode('edit');
  }, [clearAmbientTimeout]);

  const exitEdit = useCallback(() => {
    setMode('interaction');
    scheduleAmbientReturn();
  }, [scheduleAmbientReturn]);

  const toggleEdit = useCallback(() => {
    if (mode === 'edit') {
      exitEdit();
    } else {
      enterEdit();
    }
  }, [mode, enterEdit, exitEdit]);

  const enterCalibration = useCallback(() => {
    clearAmbientTimeout();
    setMode('calibration');
  }, [clearAmbientTimeout]);

  const exitCalibration = useCallback(() => {
    setMode('interaction');
    scheduleAmbientReturn();
  }, [scheduleAmbientReturn]);

  useEffect(() => {
    const handleUserActivity = () => {
      if (mode !== 'edit' && mode !== 'calibration') {
        recordActivity();
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel'];
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      clearAmbientTimeout();
    };
  }, [mode, recordActivity, clearAmbientTimeout]);

  useEffect(() => {
    if (mode === 'interaction') {
      scheduleAmbientReturn();
    }
    return clearAmbientTimeout;
  }, [mode, scheduleAmbientReturn, clearAmbientTimeout]);

  return {
    mode,
    isAmbient: mode === 'ambient',
    isInteraction: mode === 'interaction',
    isEdit: mode === 'edit',
    isCalibration: mode === 'calibration',
    enterEdit,
    exitEdit,
    toggleEdit,
    enterCalibration,
    exitCalibration,
    recordActivity,
  };
}
