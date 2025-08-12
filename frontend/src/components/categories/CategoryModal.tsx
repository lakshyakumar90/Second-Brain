import React, { useState, useEffect } from 'react';
import { X, Palette, Hash, Eye, EyeOff, Brain, Plus, X as XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import type { Category, CreateCategoryData } from '@/services/categoryApi';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSubmit: (data: CreateCategoryData) => Promise<void>;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '📁',
    isDefault: false,
    isPublic: false,
    autoClassify: false,
    aiKeywords: [],
  });
  const [newKeyword, setNewKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Predefined colors and icons
  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4',
    '#84CC16', '#F97316', '#EC4899', '#6B7280', '#1F2937', '#059669'
  ];

  const iconOptions = [
    '📁', '📚', '💡', '🛠️', '🎯', '📝', '🔗', '📷', '🎵', '📊',
    '🏷️', '⭐', '🔥', '💎', '🚀', '🎨', '🔧', '📱', '💻', '🌐'
  ];

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color,
        icon: category.icon,
        parentId: category.parentId,
        isDefault: category.isDefault,
        isPublic: category.isPublic,
        sortOrder: category.sortOrder,
        autoClassify: category.autoClassify,
        aiKeywords: [...category.aiKeywords],
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6',
        icon: '📁',
        isDefault: false,
        isPublic: false,
        autoClassify: false,
        aiKeywords: [],
      });
    }
    setErrors({});
  }, [category, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (!formData.color) {
      newErrors.color = 'Color is required';
    }

    if (!formData.icon) {
      newErrors.icon = 'Icon is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save category:', error);
      // Handle specific errors here if needed
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.aiKeywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        aiKeywords: [...prev.aiKeywords, newKeyword.trim()],
      }));
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      aiKeywords: prev.aiKeywords.filter(k => k !== keyword),
    }));
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl">
            {category ? 'Edit Category' : 'Create New Category'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description for this category"
                  rows={3}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
              </div>
            </div>

            {/* Visual Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Visual Settings</h3>
              
              <div>
                <Label>Color</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        formData.color === color ? 'border-foreground scale-110' : 'border-border hover:border-foreground/50'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                {errors.color && <p className="text-sm text-destructive mt-1">{errors.color}</p>}
              </div>

              <div>
                <Label>Icon</Label>
                <div className="grid grid-cols-10 gap-2 mt-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className={`w-10 h-10 rounded-lg border-2 text-lg transition-all ${
                        formData.icon === icon ? 'border-foreground bg-secondary' : 'border-border hover:border-foreground/50'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                {errors.icon && <p className="text-sm text-destructive mt-1">{errors.icon}</p>}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Settings</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Default Category</Label>
                    <p className="text-sm text-muted-foreground">
                      Make this the default category for new items
                    </p>
                  </div>
                  <Switch
                    checked={formData.isDefault}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Category</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow others to see and use this category
                    </p>
                  </div>
                  <Switch
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-classify Items</Label>
                    <p className="text-sm text-muted-foreground">
                      Use AI to automatically assign items to this category
                    </p>
                  </div>
                  <Switch
                    checked={formData.autoClassify}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoClassify: checked }))}
                  />
                </div>
              </div>
            </div>

            {/* AI Keywords */}
            {formData.autoClassify && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <Label>AI Keywords</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add keywords that AI will use to automatically classify items into this category
                </p>
                
                <div className="flex gap-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={handleKeywordKeyPress}
                    placeholder="Add a keyword"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={handleAddKeyword}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.aiKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.aiKeywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="gap-1">
                        {keyword}
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="ml-1 hover:text-destructive"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : (category ? 'Update Category' : 'Create Category')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryModal;
