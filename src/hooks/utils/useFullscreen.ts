import { useState, useCallback, useEffect, RefObject } from 'react';

export function useFullscreen(ref?: RefObject<HTMLElement>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const enter = useCallback(async () => {
    const element = ref?.current || document.documentElement;
    await element.requestFullscreen?.();
  }, [ref]);

  const exit = useCallback(async () => {
    await document.exitFullscreen?.();
  }, []);

  const toggle = useCallback(() => {
    isFullscreen ? exit() : enter();
  }, [isFullscreen, enter, exit]);

  return { isFullscreen, enter, exit, toggle };
}
