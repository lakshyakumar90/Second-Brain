import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Tag, FolderOpen, FileText, Zap } from 'lucide-react';
import { aiApi, type AISuggestTagsResponse, type AICategorizeResponse, type AISummarizeResponse } from '@/services/aiApi';

interface AISuggestionsProps {
  content: string;
  onTagsSelected?: (tags: string[]) => void;
  onCategorySelected?: (category: string) => void;
  onTitleSuggested?: (title: string) => void;
  onSummaryGenerated?: (summary: string) => void;
  className?: string;
}

interface AISuggestionState {
  tags: string[];
  category: string;
  title: string;
  summary: string;
  isLoading: boolean;
  error: string | null;
}

export default function AISuggestions({
  content,
  onTagsSelected,
  onCategorySelected,
  onTitleSuggested,
  onSummaryGenerated,
  className
}: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<AISuggestionState>({
    tags: [],
    category: '',
    title: '',
    summary: '',
    isLoading: false,
    error: null,
  });

  const [autoSuggest, setAutoSuggest] = useState(false);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);

  // Only auto-suggest if explicitly enabled AND user hasn't generated suggestions yet
  useEffect(() => {
    if (autoSuggest && content.length > 50 && !hasGeneratedOnce) {
      setHasGeneratedOnce(true);
      generateSuggestions();
    }
  }, [content, autoSuggest, hasGeneratedOnce]);

  const generateSuggestions = async () => {
    if (!content.trim() || content.length < 10) {
      setSuggestions(prev => ({ ...prev, error: 'Content too short for AI suggestions' }));
      return;
    }

    setSuggestions(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Generate suggestions in parallel
      const [tagsResponse, categoryResponse, summaryResponse] = await Promise.allSettled([
        aiApi.suggestTags({ content }),
        aiApi.categorizeContent({ content }),
        aiApi.summarizeContent({ content }),
      ]);

      const newSuggestions: Partial<AISuggestionState> = {};

      // Process tags
      if (tagsResponse.status === 'fulfilled') {
        const tags = tagsResponse.value.tags || [];
        newSuggestions.tags = tags;
        onTagsSelected?.(tags);
      }

      // Process category
      if (categoryResponse.status === 'fulfilled') {
        const category = categoryResponse.value.category || '';
        newSuggestions.category = category;
        onCategorySelected?.(category);
      }

      // Process summary and generate title
      if (summaryResponse.status === 'fulfilled') {
        const summary = summaryResponse.value.summary || '';
        newSuggestions.summary = summary;
        onSummaryGenerated?.(summary);

        // Generate title from summary
        const title = generateTitleFromSummary(summary);
        newSuggestions.title = title;
        onTitleSuggested?.(title);
      }

      setSuggestions(prev => ({
        ...prev,
        ...newSuggestions,
        isLoading: false,
      }));

    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
      setSuggestions(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to generate suggestions. Please try again.',
      }));
    }
  };

  const generateTitleFromSummary = (summary: string): string => {
    if (!summary) return '';
    
    // Take the first sentence or first 50 characters
    const firstSentence = summary.split('.')[0];
    const title = firstSentence.length > 50 
      ? firstSentence.substring(0, 50) + '...'
      : firstSentence;
    
    return title.trim();
  };

  const handleTagClick = (tag: string) => {
    onTagsSelected?.([tag]);
  };

  const handleCategoryClick = (category: string) => {
    onCategorySelected?.(category);
  };

  const handleTitleClick = (title: string) => {
    onTitleSuggested?.(title);
  };

  const handleSummaryClick = (summary: string) => {
    onSummaryGenerated?.(summary);
  };

  const handleManualGenerate = () => {
    setHasGeneratedOnce(true);
    generateSuggestions();
  };

  if (!content.trim()) {
    return null;
  }

  return (
    <div className={className}>
      {/* Auto-suggest toggle */}
      <div className="flex items-center space-x-2 mb-4">
        <Switch
          id="auto-suggest"
          checked={autoSuggest}
          onCheckedChange={(checked) => {
            setAutoSuggest(checked);
            if (checked && !hasGeneratedOnce) {
              setHasGeneratedOnce(true);
              generateSuggestions();
            }
          }}
        />
        <Label htmlFor="auto-suggest" className="text-sm">
          Auto-generate AI suggestions (only once)
        </Label>
      </div>

      {/* Manual generate button */}
      {!autoSuggest && (
        <Button
          onClick={handleManualGenerate}
          disabled={suggestions.isLoading || content.length < 10}
          className="mb-4"
          variant="outline"
        >
          {suggestions.isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Generate AI Suggestions
        </Button>
      )}

      {/* Error message */}
      {suggestions.error && (
        <div className="text-sm text-red-500 mb-4">{suggestions.error}</div>
      )}

      {/* Suggestions */}
      {(suggestions.tags.length > 0 || suggestions.category || suggestions.title || suggestions.summary) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4" />
              AI Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tags */}
            {suggestions.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Suggested Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Category */}
            {suggestions.category && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FolderOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Suggested Category</span>
                </div>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleCategoryClick(suggestions.category)}
                >
                  {suggestions.category}
                </Badge>
              </div>
            )}

            {/* Title */}
            {suggestions.title && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Suggested Title</span>
                </div>
                <div
                  className="p-2 border rounded-md cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleTitleClick(suggestions.title)}
                >
                  <p className="text-sm font-medium">{suggestions.title}</p>
                </div>
              </div>
            )}

            {/* Summary */}
            {suggestions.summary && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Summary</span>
                </div>
                <div
                  className="p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleSummaryClick(suggestions.summary)}
                >
                  <p className="text-sm text-muted-foreground">{suggestions.summary}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {suggestions.isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Generating AI suggestions...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
