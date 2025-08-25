import { createContext, useContext, type ReactNode } from 'react';
import { useAIAssistant } from '@/hooks/useAIAssistant';

interface AIContextType {
  isPanelOpen: boolean;
  isMinimized: boolean;
  contextItemIds: string[];
  conversation: any[];
  openPanel: () => void;
  closePanel: () => void;
  minimizePanel: () => void;
  maximizePanel: () => void;
  setContextItems: (itemIds: string[]) => void;
  clearContext: () => void;
  sendMessage: (message: string) => Promise<void>;
  startNewConversation: () => void;
  isLoading: boolean;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

interface AIProviderProps {
  children: ReactNode;
}

export function AIProvider({ children }: AIProviderProps) {
  const aiAssistant = useAIAssistant();

  return (
    <AIContext.Provider value={aiAssistant}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}
