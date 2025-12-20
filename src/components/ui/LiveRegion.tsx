import React, { useState, useEffect } from 'react';

type Politeness = 'polite' | 'assertive' | 'off';

interface LiveRegionProps {
  message: string;
  politeness?: Politeness;
  clearAfter?: number;
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
}

export function LiveRegion({
  message,
  politeness = 'polite',
  clearAfter = 5000,
  atomic = true,
  relevant = 'additions',
}: LiveRegionProps) {
  const [announcement, setAnnouncement] = useState(message);

  useEffect(() => {
    setAnnouncement(message);

    if (clearAfter > 0 && message) {
      const timer = setTimeout(() => {
        setAnnouncement('');
      }, clearAfter);

      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {announcement}
    </div>
  );
}

export function useAnnounce() {
  const [message, setMessage] = useState('');

  const announce = (text: string) => {
    setMessage('');
    setTimeout(() => setMessage(text), 100);
  };

  return { message, announce };
}

export default LiveRegion;
