import  { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  FileText, 
  Tag, 
  Brain, 
  Zap, 
  Loader2,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { aiApi } from '@/services/aiApi';
import AISuggestions from '@/components/ai/AISuggestions';

interface AIEnhancedPageEditorProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange?: (content: string, editorState: unknown) => void;
  onTagsChange?: (tags: string[]) => void;
  onSummaryChange?: (summary: string) => void;
  className?: string;
}

export default function AIEnhancedPageEditor({
  title,
  content,
  onTitleChange,
//   onContentChange,
  onTagsChange,
  onSummaryChange,
  className
}: AIEnhancedPageEditorProps) {
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [enableAutoSuggest, setEnableAutoSuggest] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState({
    title: '',
    tags: [] as string[],
    summary: '',
    category: '',
    themes: [] as string[],
    sentiment: '',
    suggestions: [] as string[],
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Auto-suggest when content changes significantly
  useEffect(() => {
    if (enableAutoSuggest && content.length > 20) {
      const timeoutId = setTimeout(() => {
        generateAISuggestions();
      }, 1500); // Reduced debounce to 1.5 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [content, enableAutoSuggest]);

  const generateAISuggestions = async () => {
    if (!content.trim() || content.length < 20) return;

    setIsAnalyzing(true);
    try {
      const [tagsResponse, summaryResponse, categoryResponse, analysisResponse] = await Promise.allSettled([
        aiApi.suggestTags({ content }),
        aiApi.summarizeContent({ content }),
        aiApi.categorizeContent({ content }),
        aiApi.analyzeContent({ content }),
      ]);

      const newContent: Partial<typeof aiGeneratedContent> = {};

      if (tagsResponse.status === 'fulfilled') {
        newContent.tags = tagsResponse.value.tags || [];
        onTagsChange?.(newContent.tags);
      }

      if (summaryResponse.status === 'fulfilled') {
        newContent.summary = summaryResponse.value.summary || '';
        onSummaryChange?.(newContent.summary);
      }

      if (categoryResponse.status === 'fulfilled') {
        newContent.category = categoryResponse.value.category || '';
      }

      if (analysisResponse.status === 'fulfilled') {
        newContent.themes = analysisResponse.value.themes || [];
        newContent.sentiment = analysisResponse.value.sentiment || '';
        newContent.suggestions = [
          ...(analysisResponse.value.suggestions || []),
          ...(analysisResponse.value.insights || []),
        ];
      }

      setAiGeneratedContent(prev => ({ ...prev, ...newContent }));

    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAITitleSuggested = (suggestedTitle: string) => {
    setAiGeneratedContent(prev => ({ ...prev, title: suggestedTitle }));
    onTitleChange(suggestedTitle);
  };

  const handleAITagsSelected = (tags: string[]) => {
    setAiGeneratedContent(prev => ({ ...prev, tags }));
    onTagsChange?.(tags);
  };

  const handleAISummaryGenerated = (summary: string) => {
    setAiGeneratedContent(prev => ({ ...prev, summary }));
    onSummaryChange?.(summary);
  };

  const handleManualAnalyze = async () => {
    if (!content.trim() || content.length < 20) return;
    await generateAISuggestions();
  };

  const handleManualTags = async () => {
    if (!content.trim() || content.length < 20) return;
    setIsAnalyzing(true);
    try {
      const response = await aiApi.suggestTags({ content });
      setAiGeneratedContent(prev => ({ ...prev, tags: response.tags || [] }));
      onTagsChange?.(response.tags || []);
    } catch (error) {
      console.error('Failed to suggest tags:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualSummarize = async () => {
    if (!content.trim() || content.length < 20) return;
    setIsAnalyzing(true);
    try {
      const response = await aiApi.summarizeContent({ content });
      setAiGeneratedContent(prev => ({ ...prev, summary: response.summary || '' }));
      onSummaryChange?.(response.summary || '');
    } catch (error) {
      console.error('Failed to summarize content:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualCategorize = async () => {
    if (!content.trim() || content.length < 20) return;
    setIsAnalyzing(true);
    try {
      const response = await aiApi.categorizeContent({ content });
      setAiGeneratedContent(prev => ({ ...prev, category: response.category || '' }));
    } catch (error) {
      console.error('Failed to categorize content:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getContentForAI = () => {
    const parts = [];
    if (title) parts.push(`Title: ${title}`);
    if (content) parts.push(`Content: ${content}`);
    return parts.join('\n\n');
  };

  const renderFormatted = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1">
        {lines.map((line, idx) => {
          if (line.startsWith('***')) {
            return <div key={idx} className="font-semibold text-sm">{line.replace(/^\*\*\*/, '').trim()}</div>;
          }
          if (line.trim().startsWith('- ')) {
            return <div key={idx} className="text-sm pl-4 list-disc">{line.replace(/^-\s*/, '')}</div>;
          }
          if (line.trim().startsWith('```')) {
            return <pre key={idx} className="bg-muted/50 rounded p-2 text-xs overflow-x-auto">{line.replace(/^```/, '')}</pre>;
          }
          return <div key={idx} className="text-sm text-muted-foreground">{line}</div>;
        })}
      </div>
    );
  };

  return (
    <div className={className}>
      {/* AI Panel Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Switch
            id="auto-suggest"
            checked={enableAutoSuggest}
            onCheckedChange={setEnableAutoSuggest}
          />
          <Label htmlFor="auto-suggest" className="text-sm">
            Auto AI suggestions
          </Label>
          {isAnalyzing && (
            <div className="flex items-center gap-1 text-xs text-primary">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Analyzing...</span>
            </div>
          )}
          {content.length > 0 && content.length < 20 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Add more content for AI analysis</span>
            </div>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAIPanel(!showAIPanel)}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          AI Assistant
          {showAIPanel ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>

      {/* AI Analysis Indicator */}
      {isAnalyzing && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg mb-4">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">AI is analyzing your content...</span>
        </div>
      )}

      {/* AI Panel */}
      {showAIPanel && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4" />
              AI Writing Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AISuggestions
              content={getContentForAI()}
              onTagsSelected={handleAITagsSelected}
              onTitleSuggested={handleAITitleSuggested}
              onSummaryGenerated={handleAISummaryGenerated}
            />
          </CardContent>
        </Card>
      )}

      {/* AI Generated Content Display */}
      {(aiGeneratedContent.tags.length > 0 || aiGeneratedContent.summary || aiGeneratedContent.category || aiGeneratedContent.themes.length > 0 || aiGeneratedContent.sentiment || aiGeneratedContent.suggestions.length > 0) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">AI Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category */}
            {aiGeneratedContent.category && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Content Category</span>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {aiGeneratedContent.category}
                </Badge>
              </div>
            )}

            {/* Tags */}
            {aiGeneratedContent.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Suggested Tags</span>
                  <Button size="sm" variant="outline" className="ml-auto h-7 px-2" onClick={() => onTagsChange?.(aiGeneratedContent.tags)}>
                    Apply Tags
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiGeneratedContent.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => onTagsChange?.([tag])}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {aiGeneratedContent.summary && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Content Summary</span>
                  <Button size="sm" variant="outline" className="ml-auto h-7 px-2" onClick={() => onSummaryChange?.(aiGeneratedContent.summary)}>
                    Save Summary
                  </Button>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  {renderFormatted(aiGeneratedContent.summary)}
                </div>
              </div>
            )}

            {/* Sentiment and Themes */}
            {(aiGeneratedContent.sentiment || aiGeneratedContent.themes.length > 0) && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Content Analysis</span>
                </div>
                <div className="space-y-2">
                  {aiGeneratedContent.sentiment && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Sentiment:</span>
                      <Badge 
                        variant={aiGeneratedContent.sentiment === 'positive' ? 'default' : 
                                aiGeneratedContent.sentiment === 'negative' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {aiGeneratedContent.sentiment}
                      </Badge>
                    </div>
                  )}
                  {aiGeneratedContent.themes.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground">Key Themes:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {aiGeneratedContent.themes.map((theme, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {aiGeneratedContent.suggestions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Writing Suggestions</span>
                </div>
                <div className="space-y-2">
                  {aiGeneratedContent.suggestions.slice(0, 5).map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg"
                    >
                      <Zap className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">{renderFormatted(suggestion)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Manual AI Actions */}
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualAnalyze}
          disabled={isAnalyzing || content.length < 20}
          className="flex items-center gap-2"
        >
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Analyze Content
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualTags}
          disabled={isAnalyzing || content.length < 20}
          className="flex items-center gap-2"
        >
          <Tag className="w-4 h-4" />
          Suggest Tags
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualSummarize}
          disabled={isAnalyzing || content.length < 20}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Summarize
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleManualCategorize}
          disabled={isAnalyzing || content.length < 20}
          className="flex items-center gap-2"
        >
          <Brain className="w-4 h-4" />
          Categorize
        </Button>
      </div>

      <Separator className="my-6" />
    </div>
  );
}
