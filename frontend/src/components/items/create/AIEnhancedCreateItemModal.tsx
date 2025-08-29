import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
// import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import TagInput from '@/components/tags/TagInput';
import ImageUpload from '@/components/ui/image-upload';
import AISuggestions from '@/components/ai/AISuggestions';
import { itemApi, type CreateItemData } from '@/services/itemApi';
import type { ItemType } from '@/types/items';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const createItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['text', 'link', 'image', 'audio', 'video', 'file', 'todo']),
  description: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  todos: z.array(z.object({ text: z.string(), done: z.boolean() })).optional(),
});

type CreateItemFormData = z.infer<typeof createItemSchema>;

interface AIEnhancedCreateItemModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (item: any) => void;
}

const typeOptions: { label: string; value: ItemType }[] = [
  { label: 'Text', value: 'text' },
  { label: 'Link', value: 'link' },
  { label: 'Image', value: 'image' },
  { label: 'Audio', value: 'audio' },
  { label: 'Document', value: 'document' },
  { label: 'Todo', value: 'todo' },
];

export default function AIEnhancedCreateItemModal({
  open,
  onClose,
  onCreate,
}: AIEnhancedCreateItemModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [enableAI, setEnableAI] = useState(true);
  const [aiGeneratedContent, setAiGeneratedContent] = useState({
    title: '',
    tags: [] as string[],
    category: '',
    summary: '',
  });
  const { currentWorkspace } = useWorkspace();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateItemFormData>({
    resolver: zodResolver(createItemSchema) as any,
    defaultValues: {
      type: 'text',
      tags: [],
      todos: [],
    },
  });

  const selectedType = watch('type');
  const title = watch('title');
  const description = watch('description') || '';

  const onSubmit = async (data: CreateItemFormData) => {
    setSubmitting(true);
    try {
      const itemData = {
        ...data,
        // Include AI-generated summary if available
        ...(aiGeneratedContent.summary && { summary: aiGeneratedContent.summary }),
        // Include current workspace
        workspace: currentWorkspace?._id,
      };

      const response = await itemApi.createItem(itemData as unknown as CreateItemData);
      onCreate(response);
      onClose();
    } catch (error) {
      console.error('Failed to create item:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAITagsSelected = (tags: string[]) => {
    setAiGeneratedContent(prev => ({ ...prev, tags }));
    setValue('tags', tags);
  };

  const handleAICategorySelected = (category: string) => {
    setAiGeneratedContent(prev => ({ ...prev, category }));
    setValue('category', category);
  };

  const handleAITitleSuggested = (title: string) => {
    setAiGeneratedContent(prev => ({ ...prev, title }));
    setValue('title', title);
  };

  const handleAISummaryGenerated = (summary: string) => {
    setAiGeneratedContent(prev => ({ ...prev, summary }));
  };

  const getContentForAI = () => {
    const content = [];
    if (title) content.push(`Title: ${title}`);
    if (description) content.push(`Description: ${description}`);
    return content.join('\n\n');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Create New Item with AI</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit as any)} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <div className="space-y-4">
              {/* AI Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-ai"
                  checked={enableAI}
                  onCheckedChange={setEnableAI}
                />
                <Label htmlFor="enable-ai" className="text-sm">
                  Enable AI assistance
                </Label>
              </div>

              {/* Item Type */}
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={selectedType}
                  onValueChange={(value: any) => setValue('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Enter title..."
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* URL for link/audio/video types */}
              {(selectedType === 'link' || selectedType === 'audio' || selectedType === 'video') && (
                <div>
                  <label className="text-sm font-medium">URL</label>
                  <Input
                    placeholder="https://..."
                    {...register('url')}
                  />
                  {errors.url && (
                    <p className="text-xs text-red-500 mt-1">{errors.url.message}</p>
                  )}
                </div>
              )}

              {/* Description for text type */}
              {selectedType === 'text' && (
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Enter description..."
                    {...register('description')}
                    rows={4}
                  />
                </div>
              )}

              {/* Todos for todo type */}
              {selectedType === 'todo' && (
                <div>
                  <label className="text-sm font-medium">Todos (comma separated)</label>
                  <Input
                    placeholder="task one, task two"
                    onChange={(e) => {
                      const raw = e.target.value;
                      const todos = raw
                        .split(',')
                        .map(t => t.trim())
                        .filter(Boolean)
                        .map(t => ({ text: t, done: false }));
                      setValue('todos', todos as any);
                    }}
                  />
                </div>
              )}

              {/* Image upload for image type */}
              {selectedType === 'image' && (
                <div>
                  <label className="text-sm font-medium">Images</label>
                  <ImageUpload
                    multiple
                    onUploaded={(urls) => {
                      (window as any).__tmp_image_urls = urls;
                    }}
                  />
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="text-sm font-medium">Tags</label>
                <TagInput
                  value={watch('tags') || []}
                  onChange={(tags) => setValue('tags', tags)}
                  placeholder="Add tags..."
                  maxTags={10}
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input
                  placeholder="Enter category..."
                  {...register('category')}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Item'}
                </Button>
              </div>
            </div>

            {/* Right Column - AI Suggestions */}
            {enableAI && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">AI Assistant</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AISuggestions
                      content={getContentForAI()}
                      onTagsSelected={handleAITagsSelected}
                      onCategorySelected={handleAICategorySelected}
                      onTitleSuggested={handleAITitleSuggested}
                      onSummaryGenerated={handleAISummaryGenerated}
                    />
                  </CardContent>
                </Card>

                {/* AI Generated Summary Display */}
                {aiGeneratedContent.summary && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">AI Generated Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{aiGeneratedContent.summary}</p>
                    </CardContent>
                  </Card>
                )}

                {/* AI Usage Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">AI Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="w-3 h-3" />
                      <span>Auto-tagging based on content</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="w-3 h-3" />
                      <span>Smart categorization</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="w-3 h-3" />
                      <span>Title suggestions</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="w-3 h-3" />
                      <span>Content summarization</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
