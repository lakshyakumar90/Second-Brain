import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Tag, CreateTagData } from '@/services/tagApi';

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tag?: Tag | null;
  onSubmit: (data: CreateTagData) => Promise<void>;
}

const TagModal: React.FC<TagModalProps> = ({
  isOpen,
  onClose,
  tag,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateTagData>({
    name: '',
    color: '#6B7280',
    description: '',
    isDefault: false,
    isPublic: false,
    autoSuggest: false,
    aiKeywords: [],
  });
  const [newKeyword, setNewKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const colorOptions = [
    '#6B7280', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#1F2937', '#059669'
  ];

  useEffect(() => {
    if (isOpen) {
      if (tag) {
        setFormData({
          name: tag.name,
          color: tag.color,
          description: tag.description || '',
          isDefault: tag.isDefault,
          isPublic: tag.isPublic,
          autoSuggest: tag.autoSuggest,
          aiKeywords: [...tag.aiKeywords],
        });
      } else {
        setFormData({
          name: '',
          color: '#6B7280',
          description: '',
          isDefault: false,
          isPublic: false,
          autoSuggest: false,
          aiKeywords: [],
        });
      }
      setErrors({});
      setNewKeyword('');
      setIsLoading(false);
    }
  }, [tag, isOpen]);

  // Cleanup effect to ensure no modal remnants remain
  useEffect(() => {
    return () => {
      // Force cleanup of any remaining modal state when component unmounts
      setIsLoading(false);
      setErrors({});
      setNewKeyword('');
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tag name is required';
    } else if (formData.name.length > 30) {
      newErrors.name = 'Tag name must be less than 30 characters';
    } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(formData.name)) {
      newErrors.name = 'Tag name can only contain letters, numbers, spaces, hyphens, and underscores';
    }

    if (formData.description && formData.description.length > 100) {
      newErrors.description = 'Description must be less than 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isLoading) return;

    setIsLoading(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Failed to save tag:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsLoading(false);
    setErrors({});
    setNewKeyword('');
    onClose();
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.aiKeywords?.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        aiKeywords: [...(prev.aiKeywords || []), newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      aiKeywords: prev.aiKeywords?.filter(k => k !== keyword)
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  // Use key to force remount when tag changes to prevent state conflicts
  const modalKey = tag ? `edit-${tag._id}` : 'create';

  return (
    <Dialog key={modalKey} open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent 
        className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking on dropdown menus or other portaled content
          const target = e.target as Element;
          if (target.closest('[data-radix-popper-content-wrapper]') || 
              target.closest('[data-slot="dropdown-menu-content"]')) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={() => {
          handleClose();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {tag ? 'Edit Tag' : 'Create New Tag'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tag Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Tag Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter tag name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Select color ${color}`}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color ? 'border-gray-800 scale-110' : 'border-gray-300 hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Settings</Label>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isDefault">Default Tag</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically apply this tag to new items
                </p>
              </div>
              <Switch
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isPublic">Public Tag</Label>
                <p className="text-sm text-muted-foreground">
                  Make this tag visible to collaborators
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoSuggest">Auto Suggest</Label>
                <p className="text-sm text-muted-foreground">
                  Suggest this tag based on content
                </p>
              </div>
              <Switch
                id="autoSuggest"
                checked={formData.autoSuggest}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoSuggest: checked }))}
              />
            </div>
          </div>

          {/* AI Keywords */}
          <div className="space-y-2">
            <Label>AI Keywords</Label>
            <p className="text-sm text-muted-foreground">
              Keywords that help AI suggest this tag
            </p>
            
            <div className="flex gap-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add keyword"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addKeyword}
                disabled={!newKeyword.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.aiKeywords && formData.aiKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.aiKeywords.map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (tag ? 'Update Tag' : 'Create Tag')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TagModal;
