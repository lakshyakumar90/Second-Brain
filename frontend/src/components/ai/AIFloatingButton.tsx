import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '@/contexts/AIContext';

interface AIFloatingButtonProps {
  className?: string;
}

export default function AIFloatingButton({ className }: AIFloatingButtonProps) {
  // Use AI context with fallback
  let aiContext;
  try {
    aiContext = useAI();
  } catch (error) {
    // If AI context is not available, use fallback values
    aiContext = {
      openPanel: () => {},
      contextItemIds: [],
      isLoading: false,
    };
  }

  const { openPanel, contextItemIds, isLoading } = aiContext;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={`fixed left-4 bottom-4 z-40 ${className}`}
      >
        <Button
          onClick={openPanel}
          size="lg"
          className="rounded-full shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 group"
          disabled={isLoading}
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            {contextItemIds.length > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-2 -right-2 text-xs px-1.5 py-0.5 min-w-0 h-5"
              >
                {contextItemIds.length}
              </Badge>
            )}
          </div>
          
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </Button>

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-background border rounded-lg px-3 py-2 shadow-lg whitespace-nowrap"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI Assistant</span>
          </div>
          {contextItemIds.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {contextItemIds.length} item{contextItemIds.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
