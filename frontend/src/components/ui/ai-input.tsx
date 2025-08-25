import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { AtSign, Send, Bot, User, Loader2, Sparkles } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { aiApi, type AIMessage, type AIChatRequest } from "@/services/aiApi"

// Form validation schema
const chatSchema = z.object({
  message: z.string().min(1, "Message is required").max(5000, "Message too long"),
});

type ChatFormData = z.infer<typeof chatSchema>;

interface UseAutoResizeTextareaProps {
  minHeight: number
  maxHeight?: number
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return

      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }

      textarea.style.height = `${minHeight}px`
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      )

      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight]
  )

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = `${minHeight}px`
    }
  }, [minHeight])

  useEffect(() => {
    const handleResize = () => adjustHeight()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [adjustHeight])

  return { textareaRef, adjustHeight }
}

const MIN_HEIGHT = 48
const MAX_HEIGHT = 248

interface AiInputProps {
  contextItemIds?: string[];
  onMessageSent?: (message: string) => void;
  className?: string;
}

export default function AiInput({ contextItemIds = [], onMessageSent, className }: AiInputProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [conversation, setConversation] = useState<AIMessage[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | undefined>()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChatFormData>({
    resolver: zodResolver(chatSchema),
  });

  // Load conversation from localStorage on mount
  useEffect(() => {
    const savedConversation = localStorage.getItem('ai-conversation');
    const savedChatId = localStorage.getItem('ai-chat-id');
    
    if (savedConversation) {
      try {
        setConversation(JSON.parse(savedConversation));
      } catch (error) {
        console.error('Failed to parse saved conversation:', error);
      }
    }
    
    if (savedChatId) {
      setCurrentChatId(savedChatId);
    }
  }, []);

  // Save conversation to localStorage whenever it changes
  useEffect(() => {
    if (conversation.length > 0) {
      localStorage.setItem('ai-conversation', JSON.stringify(conversation));
    }
  }, [conversation]);

  // Save chat ID to localStorage
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('ai-chat-id', currentChatId);
    }
  }, [currentChatId]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [conversation]);

  const onSubmit = async (data: ChatFormData) => {
    if (isLoading) return;

    // Validate that we have a message
    if (!data.message || data.message.trim() === '') {
      console.error('No message provided');
      return;
    }

    const userMessage: AIMessage = {
      role: 'user',
      content: data.message,
      timestamp: new Date().toISOString(),
    };

    // Add user message to conversation
    setConversation(prev => [...prev, userMessage]);
    
    // Call the callback if provided
    onMessageSent?.(data.message);

    setIsLoading(true);
    reset();

    try {
      const chatRequest: AIChatRequest = {
        chatId: currentChatId,
        message: data.message,
        contextItemIds: contextItemIds && contextItemIds.length > 0 ? contextItemIds : [],
      };

      const response = await aiApi.chatWithAI(chatRequest);
      
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
      };

      setConversation(prev => [...prev, assistantMessage]);
      setCurrentChatId(response.chatId);
      
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
  };

  const handleAtClick = () => {
    // Handle @ symbol click functionality for context selection
    console.log("@ symbol clicked - context selection");
  };

  const startNewConversation = () => {
    setConversation([]);
    setCurrentChatId(undefined);
    localStorage.removeItem('ai-conversation');
    localStorage.removeItem('ai-chat-id');
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Conversation History */}
      {conversation.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Conversation History</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={startNewConversation}
              className="text-xs"
            >
              New Chat
            </Button>
          </div>
          
          <ScrollArea className="h-64 border rounded-lg p-4">
            <div ref={scrollAreaRef} className="space-y-4">
              {conversation.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.timestamp && (
                      <p className="text-xs opacity-70 mt-1">
                        {formatTimestamp(message.timestamp)}
                      </p>
                    )}
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Context Indicator */}
      {contextItemIds.length > 0 && (
        <div className="mb-3">
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Context: {contextItemIds.length} item{contextItemIds.length !== 1 ? 's' : ''} selected
          </Badge>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div className="relative w-full border rounded-[22px] border-black/5 mx-auto">
          <div className="relative rounded-2xl border border-black/5 bg-neutral-800/5 flex flex-col">
            <div
              className="overflow-y-auto"
              style={{ maxHeight: `${MAX_HEIGHT}px` }}
            >
              <div className="relative">
                <Textarea
                  {...register("message")}
                  placeholder="Ask the Assistant..."
                  className="w-full rounded-2xl rounded-b-none px-4 py-3 bg-black/5 dark:bg-white/5 border-none dark:text-white resize-none focus-visible:ring-0 leading-[1.2]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(onSubmit)()
                    }
                  }}
                  disabled={isLoading}
                />
                {errors.message && (
                  <p className="text-xs text-red-500 mt-1 px-4">{errors.message.message}</p>
                )}
              </div>
            </div>

            <div className="h-12 bg-black/5 dark:bg-white/5 rounded-b-xl">
              <div className="absolute left-3 bottom-3 flex items-center gap-2">
                <motion.button
                  type="button"
                  onClick={handleAtClick}
                  className="cursor-pointer rounded-full p-2 bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  <AtSign className="w-4 h-4" />
                </motion.button>
              </div>
              <div className="absolute right-3 bottom-3">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading}
                  className={cn(
                    "rounded-full p-2 transition-colors",
                    isLoading
                      ? "bg-muted text-muted-foreground"
                      : "bg-[#ff3f17]/15 text-[#ff3f17] hover:bg-[#ff3f17]/25"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
      </form>
    </div>
  );
}
