import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { FeedbackToast } from './MicroInteractions';

// ============= FEEDBACK CONTEXT =============

type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'celebration';

interface FeedbackOptions {
  type: FeedbackType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface FeedbackContextType {
  showFeedback: (options: FeedbackOptions) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showLoading: (title: string, message?: string) => void;
  showCelebration: (title: string, message?: string) => void;
  hideFeedback: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | null>(null);

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}

interface FeedbackProviderProps {
  children: ReactNode;
}

export function FeedbackProvider({ children }: FeedbackProviderProps) {
  const [feedback, setFeedback] = useState<FeedbackOptions | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showFeedback = useCallback((options: FeedbackOptions) => {
    setFeedback(options);
    setIsVisible(true);
  }, []);

  const hideFeedback = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setFeedback(null), 300);
  }, []);

  const showSuccess = useCallback((title: string, message?: string) => {
    showFeedback({ type: 'success', title, message });
  }, [showFeedback]);

  const showError = useCallback((title: string, message?: string) => {
    showFeedback({ type: 'error', title, message });
  }, [showFeedback]);

  const showWarning = useCallback((title: string, message?: string) => {
    showFeedback({ type: 'warning', title, message });
  }, [showFeedback]);

  const showInfo = useCallback((title: string, message?: string) => {
    showFeedback({ type: 'info', title, message });
  }, [showFeedback]);

  const showLoading = useCallback((title: string, message?: string) => {
    showFeedback({ type: 'loading', title, message });
  }, [showFeedback]);

  const showCelebration = useCallback((title: string, message?: string) => {
    showFeedback({ type: 'celebration', title, message });
  }, [showFeedback]);

  return (
    <FeedbackContext.Provider
      value={{
        showFeedback,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showLoading,
        showCelebration,
        hideFeedback,
      }}
    >
      {children}
      {feedback && (
        <FeedbackToast
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
          isVisible={isVisible}
          onClose={hideFeedback}
          duration={feedback.duration}
          action={feedback.action}
        />
      )}
    </FeedbackContext.Provider>
  );
}

export default FeedbackProvider;
