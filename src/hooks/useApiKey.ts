import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'gemini-api-key';

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setApiKeyState(stored);
    else setIsEditing(true);
  }, []);

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    localStorage.setItem(STORAGE_KEY, key);
    setIsEditing(false);
  }, []);

  const removeApiKey = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKeyState('');
    setIsEditing(true);
  }, []);

  return { apiKey, isEditing, setIsEditing, setApiKey, removeApiKey };
}
