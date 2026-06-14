import { useState, useEffect } from 'react';
import { InputMode } from '../types/tool';

export function useInputMode() {
  const [mode, setMode] = useState<InputMode>('auto');
  const [detected, setDetected] = useState<'mouse' | 'touch'>('mouse');

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    setDetected(mq.matches ? 'touch' : 'mouse');
    
    const listener = (e: MediaQueryListEvent) => {
      setDetected(e.matches ? 'touch' : 'mouse');
    };
    
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  const activeMode = mode === 'auto' ? detected : (mode as 'mouse' | 'touch');
  return { mode, activeMode, setMode };
}
