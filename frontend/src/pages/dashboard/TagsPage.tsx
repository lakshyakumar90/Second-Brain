import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Trash2, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { tagApi, type Tag, type CreateTagData } from '@/services/tagApi';
import TagModal from '@/components/tags/TagModal';
import TagCard from '@/components/tags/TagCard';

const TagsPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterDefaults, setFilterDefaults] = useState<boolean | undefined>(undefined);
  const [filterPublic, setFilterPublic] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'name' | 'usageCount' | 'itemCount' | 'createdAt' | 'updatedAt' | 'sortOrder'>('usageCount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadTags = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await tagApi.getTags({
        search: searchQuery || undefined,
        isDefault: filterDefaults,
        isPublic: filterPublic,
        sortBy,
        sortOrder,
        limit: 100,
      });
      setTags(response.data.tags);
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filterDefaults, filterPublic, sortBy, sortOrder]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const handleCreateTag = async (data: CreateTagData) => {
    try {
      await tagApi.createTag(data);
      closeModal();
      loadTags();
    } catch (error) {
      console.error('Failed to create tag:', error);
      throw error;
    }
  };

  const handleUpdateTag = async (data: CreateTagData) => {
    if (!editingTag) return;
    
    try {
      await tagApi.updateTag(editingTag._id, data);
      closeModal();
      loadTags();
    } catch (error) {
      console.error('Failed to update tag:', error);
      throw error;
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await tagApi.deleteTag(tagId);
      loadTags();
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTags.length === 0) return;
    
    try {
      await tagApi.bulkDeleteTags(selectedTags);
      setSelectedTags([]);
      loadTags();
    } catch (error) {
      console.error('Failed to bulk delete tags:', error);
    }
  };

  const openCreateModal = () => {
    setEditingTag(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tag: Tag) => {
    // Ensure any existing modal state is cleared first
    setIsModalOpen(false);
    setEditingTag(null);
    
    // Use setTimeout to ensure state is cleared before opening new modal
    setTimeout(() => {
      setEditingTag(tag);
      setIsModalOpen(true);
    }, 10);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
  };

  const handleTagSelect = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterDefaults(undefined);
    setFilterPublic(undefined);
    setSortBy('usageCount');
    setSortOrder('desc');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tags</h1>
          <p className="text-muted-foreground">
            Organize your content with tags and labels
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedTags.length > 0 && (
            <Button variant="outline" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete {selectedTags.length}
            </Button>
          )}
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            New Tag
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-secondary' : ''}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Tags</label>
                  <select
                    value={filterDefaults === undefined ? '' : filterDefaults.toString()}
                    onChange={(e) => setFilterDefaults(e.target.value === '' ? undefined : e.target.value === 'true')}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All</option>
                    <option value="true">Default Only</option>
                    <option value="false">Non-Default Only</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Public Tags</label>
                  <select
                    value={filterPublic === undefined ? '' : filterPublic.toString()}
                    onChange={(e) => setFilterPublic(e.target.value === '' ? undefined : e.target.value === 'true')}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All</option>
                    <option value="true">Public Only</option>
                    <option value="false">Private Only</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'usageCount' | 'itemCount' | 'createdAt' | 'updatedAt' | 'sortOrder')}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="usageCount">Usage Count</option>
                    <option value="itemCount">Item Count</option>
                    <option value="name">Name</option>
                    <option value="createdAt">Created Date</option>
                    <option value="updatedAt">Updated Date</option>
                    <option value="sortOrder">Sort Order</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'} {sortBy}
                </Button>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tags.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <TagIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No tags found</h3>
              <p className="mb-4">
                {searchQuery || filterDefaults !== undefined || filterPublic !== undefined
                  ? 'Try adjusting your search or filters'
                  : 'Create your first tag to start organizing your content'
                }
              </p>
              {!searchQuery && filterDefaults === undefined && filterPublic === undefined && (
                <Button onClick={openCreateModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Tag
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((tag) => (
            <TagCard
              key={tag._id}
              tag={tag}
              onEdit={openEditModal}
              onDelete={handleDeleteTag}
              isSelected={selectedTags.includes(tag._id)}
              onSelect={handleTagSelect}
            />
          ))}
        </div>
      )}

      {/* Tag Modal */}
      <TagModal
        isOpen={isModalOpen}
        onClose={closeModal}
        tag={editingTag}
        onSubmit={editingTag ? handleUpdateTag : handleCreateTag}
      />
    </div>
  );
};

export default TagsPage;
