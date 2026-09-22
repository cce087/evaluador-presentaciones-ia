import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_MODEL } from '../types';

const STORAGE_KEY = 'gemini-model';

export function useModel() {
  const [model, setModelState] = useState<string>(DEFAULT_MODEL);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setModelState(stored);
  }, []);

  const setModel = useCallback((m: string) => {
    setModelState(m);
    localStorage.setItem(STORAGE_KEY, m);
  }, []);

  return { model, setModel };
}
