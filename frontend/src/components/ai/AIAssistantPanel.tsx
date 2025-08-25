import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  MessageSquare, 
  Sparkles, 
  Zap, 
  Tag, 
  FileText, 
  Brain, 
  BarChart3,
  X,
  Minimize2,
  Maximize2,
  History,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AiInput from '@/components/ui/ai-input';
import { aiApi, type AIUsageStats } from '@/services/aiApi';
import { useAI } from '@/contexts/AIContext';

interface AIAssistantPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  contextItemIds?: string[];
  className?: string;
}

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'summarize',
    label: 'Summarize',
    description: 'Create a concise summary',
    icon: <FileText className="w-4 h-4" />,
    prompt: 'Please provide a concise summary of the selected content.',
  },
  {
    id: 'improve',
    label: 'Improve',
    description: 'Suggest improvements',
    icon: <Zap className="w-4 h-4" />,
    prompt: 'Please suggest improvements for the selected content.',
  },
  {
    id: 'tag',
    label: 'Suggest Tags',
    description: 'Generate relevant tags',
    icon: <Tag className="w-4 h-4" />,
    prompt: 'Please suggest relevant tags for the selected content.',
  },
  {
    id: 'analyze',
    label: 'Analyze',
    description: 'Deep content analysis',
    icon: <Brain className="w-4 h-4" />,
    prompt: 'Please provide a detailed analysis of the selected content.',
  },
];

export default function AIAssistantPanel({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onMinimize: propOnMinimize,
  contextItemIds = [],
  className
}: AIAssistantPanelProps) {
  // Use AI context if available, otherwise use props
  const aiContext = useAI();
  const isOpen = propIsOpen ?? aiContext?.isPanelOpen ?? false;
  const onClose = propOnClose ?? aiContext?.closePanel ?? (() => {});
  const onMinimize = propOnMinimize ?? aiContext?.minimizePanel ?? (() => {});
  const isMinimized = aiContext?.isMinimized ?? false;

  const [activeTab, setActiveTab] = useState('chat');
  const [usageStats, setUsageStats] = useState<AIUsageStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const handleMinimize = () => {
    onMinimize();
  };

  const handleQuickAction = (action: QuickAction) => {
    // This would trigger the AI input with the predefined prompt
    console.log('Quick action:', action.prompt);
    // In a real implementation, you'd want to pass this to the AI input component
  };

  const loadUsageStats = async () => {
    setIsLoadingStats(true);
    try {
      const stats = await aiApi.getUsageStats({ period: 'day' });
      setUsageStats(stats);
    } catch (error) {
      console.error('Failed to load usage stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'usage') {
      loadUsageStats();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ duration: 0.3 }}
        className={`fixed right-4 bottom-4 z-50 ${className}`}
      >
        <Card className="w-96 shadow-xl border-2">
          {/* Header */}
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">AI Assistant</CardTitle>
                {contextItemIds.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {contextItemIds.length} context
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMinimize}
                  className="h-8 w-8 p-0"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="pt-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="chat" className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="actions" className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Actions
                  </TabsTrigger>
                  <TabsTrigger value="usage" className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    Usage
                  </TabsTrigger>
                </TabsList>

                {/* Chat Tab */}
                <TabsContent value="chat" className="mt-4">
                  <div className="space-y-4">
                    {/* Context Indicator */}
                    {contextItemIds.length > 0 && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Context Active</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          AI will reference {contextItemIds.length} selected item{contextItemIds.length !== 1 ? 's' : ''} in responses
                        </p>
                      </div>
                    )}

                    {/* AI Input */}
                    <AiInput
                      contextItemIds={contextItemIds}
                      className="mt-4"
                    />
                  </div>
                </TabsContent>

                {/* Quick Actions Tab */}
                <TabsContent value="actions" className="mt-4">
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground mb-3">
                      Quick actions for selected content
                    </div>
                    
                    {quickActions.map((action) => (
                      <Button
                        key={action.id}
                        variant="outline"
                        className="w-full justify-start h-auto p-3"
                        onClick={() => handleQuickAction(action)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {action.icon}
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{action.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {action.description}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}

                    <Separator className="my-4" />

                    {/* Recent Actions */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <History className="w-4 h-4" />
                        Recent Actions
                      </div>
                      <div className="text-xs text-muted-foreground">
                        No recent actions
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Usage Tab */}
                <TabsContent value="usage" className="mt-4">
                  <div className="space-y-4">
                    {isLoadingStats ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span className="text-sm text-muted-foreground">Loading stats...</span>
                        </div>
                      </div>
                    ) : usageStats ? (
                      <div className="space-y-4">
                        {/* Total Usage */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {usageStats.totalRequests}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Total Requests
                            </div>
                          </div>
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {usageStats.tokensUsed.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Tokens Used
                            </div>
                          </div>
                        </div>

                        {/* Usage by Type */}
                        <div>
                          <div className="text-sm font-medium mb-2">Usage by Type</div>
                          <div className="space-y-2">
                            {Object.entries(usageStats.requestsByType).map(([type, count]) => (
                              <div key={type} className="flex items-center justify-between text-sm">
                                <span className="capitalize">{type.replace('_', ' ')}</span>
                                <Badge variant="secondary">{count}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Period Info */}
                        <div className="text-xs text-muted-foreground text-center">
                          Stats for {usageStats.period}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No usage data available</p>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadUsageStats}
                      className="w-full"
                    >
                      Refresh Stats
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
