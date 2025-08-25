import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  FileText, 
  Tag, 
  Brain, 
  Zap, 
  Loader2,
  MessageSquare,
  Save
} from 'lucide-react';
import { aiApi } from '@/services/aiApi';
import { useAI } from '@/contexts/AIContext';

interface AIContentAnalyzerProps {
  content: string;
  title?: string;
  className?: string;
  onSaveSummary?: (summary: string) => void;
  onSaveTags?: (tags: string[]) => void;
}

export default function AIContentAnalyzer({ 
  content, 
  title = '', 
  className,
  onSaveSummary,
  onSaveTags
}: AIContentAnalyzerProps) {
  const { openPanel } = useAI();
  const [analysis, setAnalysis] = useState<{
    summary?: string;
    tags?: string[];
    category?: string;
    themes?: string[];
    sentiment?: string;
    suggestions?: string[];
  }>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeContent = async () => {
    if (!content.trim() || content.length < 20) {
      return;
    }

    setIsAnalyzing(true);
    try {
      const fullContent = title ? `${title}\n\n${content}` : content;
      
      // Run all AI analyses in parallel
      const [summaryRes, tagsRes, categoryRes, analysisRes] = await Promise.allSettled([
        aiApi.summarizeContent({ content: fullContent }),
        aiApi.suggestTags({ content: fullContent }),
        aiApi.categorizeContent({ content: fullContent }),
        aiApi.analyzeContent({ content: fullContent }),
      ]);

      const newAnalysis: typeof analysis = {};

      if (summaryRes.status === 'fulfilled') {
        newAnalysis.summary = summaryRes.value.summary;
      }

      if (tagsRes.status === 'fulfilled') {
        newAnalysis.tags = tagsRes.value.tags;
      }

      if (categoryRes.status === 'fulfilled') {
        newAnalysis.category = categoryRes.value.category;
      }

      if (analysisRes.status === 'fulfilled') {
        newAnalysis.themes = analysisRes.value.themes;
        newAnalysis.sentiment = analysisRes.value.sentiment;
        newAnalysis.suggestions = analysisRes.value.suggestions;
      }

      setAnalysis(newAnalysis);
    } catch (error) {
      console.error('Failed to analyze content:', error);
    } finally {
      setIsAnalyzing(false);
    }
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
            return <div key={idx} className="text-sm pl-4">• {line.replace(/^-\s*/, '')}</div>;
          }
          if (line.trim().startsWith('```')) {
            return <pre key={idx} className="bg-muted/50 rounded p-2 text-xs overflow-x-auto">{line.replace(/^```/, '')}</pre>;
          }
          return <div key={idx} className="text-sm text-muted-foreground">{line}</div>;
        })}
      </div>
    );
  };

  const hasAnalysis = Object.keys(analysis).length > 0;

  return (
    <div className={className}>
      {/* AI Analysis Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">AI Content Analysis</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={analyzeContent}
            disabled={isAnalyzing || content.length < 20}
            className="flex items-center gap-2"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Analyze Content'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openPanel}
            className="flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Chat with AI
          </Button>
        </div>
      </div>

      {/* Analysis Results */}
      {hasAnalysis && (
        <div className="space-y-4">
          {/* Summary */}
          {analysis.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4" />
                  Content Summary
                  {onSaveSummary && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="ml-auto h-7 px-2" 
                      onClick={() => onSaveSummary(analysis.summary!)}
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderFormatted(analysis.summary)}
              </CardContent>
            </Card>
          )}

          {/* Tags and Category */}
          {(analysis.tags || analysis.category) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Tag className="w-4 h-4" />
                  Content Classification
                  {onSaveTags && analysis.tags && analysis.tags.length > 0 && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="ml-auto h-7 px-2" 
                      onClick={() => onSaveTags(analysis.tags!)}
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save Tags
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.category && (
                  <div>
                    <span className="text-xs text-muted-foreground">Category:</span>
                    <Badge variant="secondary" className="ml-2">
                      {analysis.category}
                    </Badge>
                  </div>
                )}
                {analysis.tags && analysis.tags.length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {analysis.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Themes and Sentiment */}
          {(analysis.themes || analysis.sentiment) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Brain className="w-4 h-4" />
                  Content Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.sentiment && (
                  <div>
                    <span className="text-xs text-muted-foreground">Sentiment:</span>
                    <Badge 
                      variant={analysis.sentiment === 'positive' ? 'default' : 
                              analysis.sentiment === 'negative' ? 'destructive' : 'secondary'}
                      className="ml-2"
                    >
                      {analysis.sentiment}
                    </Badge>
                  </div>
                )}
                {analysis.themes && analysis.themes.length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground">Key Themes:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {analysis.themes.map((theme, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Suggestions */}
          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">AI Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.suggestions.slice(0, 5).map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg"
                    >
                      <Sparkles className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">{renderFormatted(suggestion)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Content Preview */}
      {content && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Content Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-32 overflow-y-auto">
              <p className="text-sm text-muted-foreground">
                {content.length > 200 ? `${content.substring(0, 200)}...` : content}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {content.length} characters • {content.split(' ').length} words
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
