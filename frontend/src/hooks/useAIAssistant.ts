import { useState, useCallback, useRef } from 'react';
import { aiApi, type AIChatRequest, type AIMessage } from '@/services/aiApi';

interface UseAIAssistantReturn {
  isPanelOpen: boolean;
  isMinimized: boolean;
  contextItemIds: string[];
  conversation: AIMessage[];
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

export function useAIAssistant(): UseAIAssistantReturn {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [contextItemIds, setContextItemIds] = useState<string[]>([]);
  const [conversation, setConversation] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentChatIdRef = useRef<string | undefined>(undefined);

  const openPanel = useCallback(() => {
    setIsPanelOpen(true);
    setIsMinimized(false);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
    setIsMinimized(false);
  }, []);

  const minimizePanel = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const maximizePanel = useCallback(() => {
    setIsMinimized(false);
  }, []);

  const setContextItems = useCallback((itemIds: string[]) => {
    setContextItemIds(itemIds);
  }, []);

  const clearContext = useCallback(() => {
    setContextItemIds([]);
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (isLoading) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setConversation(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const chatRequest: AIChatRequest = {
        chatId: currentChatIdRef.current,
        message,
        contextItemIds: contextItemIds.length > 0 ? contextItemIds : undefined,
      };

      const response = await aiApi.chatWithAI(chatRequest);
      
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
      };

      setConversation(prev => [...prev, assistantMessage]);
      currentChatIdRef.current = response.chatId;
      
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: AIMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        timestamp: new Date().toISOString(),
      };
      
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, contextItemIds]);

  const startNewConversation = useCallback(() => {
    setConversation([]);
    currentChatIdRef.current = undefined;
  }, []);

  return {
    isPanelOpen,
    isMinimized,
    contextItemIds,
    conversation,
    openPanel,
    closePanel,
    minimizePanel,
    maximizePanel,
    setContextItems,
    clearContext,
    sendMessage,
    startNewConversation,
    isLoading,
  };
}
