import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Plus, Settings, Users, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import WorkspaceSettingsModal from './WorkspaceSettingsModal';
import WorkspaceMembersModal from './WorkspaceMembersModal';
import { useToast } from '@/hooks/use-toast';
import { categoryApi, type Category, type CreateCategoryData } from '@/services/categoryApi';
import { tagApi, type Tag, type CreateTagData } from '@/services/tagApi';

interface WorkspaceSwitcherProps {
  onOpenCreateModal?: () => void;
  onOpenSettings?: () => void;
  onOpenMembers?: () => void;
  className?: string;
}

type PanelView = 'workspaces' | 'create' | 'settings' | 'members' | 'categories' | 'tags';

const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({ 
  className 
}) => {
  const { workspaces, currentWorkspace, switchWorkspace, isLoading } = useWorkspace();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0, width: 320, height: 'auto' as number | string });
  const [currentView, setCurrentView] = useState<PanelView>('workspaces');
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [filterDefaults, setFilterDefaults] = useState(false);
  const [filterPublic, setFilterPublic] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'usageCount' | 'itemCount' | 'createdAt' | 'updatedAt' | 'sortOrder'>('usageCount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  const { toast } = useToast();

  // Calculate panel position when opening
  const updatePanelPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const panelWidth = 320; // Width of the sub-panel
      
      // Position panel with some margin from top and center it better
      const left = rect.right + 20; // 20px margin from sidebar
      const top = Math.max(20, rect.top - 100); // Position above the trigger with some margin
      
      setPanelPosition({
        top,
        left,
        width: panelWidth,
        height: 'auto' // Let content determine height
      });
    }
  };

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsPanelOpen(false);
        setCurrentView('workspaces');
      }
    };

    if (isPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      updatePanelPosition();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPanelOpen]);

  // Update position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isPanelOpen) {
        updatePanelPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isPanelOpen]);

  // Load categories when switching to categories view
  useEffect(() => {
    if (currentView === 'categories' && isPanelOpen) {
      loadCategories();
    }
  }, [currentView, isPanelOpen]);

  // Load tags when switching to tags view
  useEffect(() => {
    if (currentView === 'tags' && isPanelOpen) {
      loadTags();
    }
  }, [currentView, isPanelOpen]);

  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const response = await categoryApi.getCategories({
        search: categorySearchQuery || undefined,
        limit: 100,
      });
      const categoriesArray = Array.isArray(response?.data?.categories) 
        ? response.data.categories 
        : [];
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [categorySearchQuery]);

  const loadTags = useCallback(async () => {
    setIsLoadingTags(true);
    try {
      const response = await tagApi.getTags({
        search: tagSearchQuery || undefined,
        isDefault: filterDefaults,
        isPublic: filterPublic,
        sortBy,
        sortOrder,
        limit: 100,
      });
      setTags(response.data.tags);
    } catch (error) {
      console.error('Failed to load tags:', error);
      setTags([]);
    } finally {
      setIsLoadingTags(false);
    }
  }, [tagSearchQuery, filterDefaults, filterPublic, sortBy, sortOrder]);

  const handleCreateCategory = async (data: CreateCategoryData) => {
    try {
      await categoryApi.createCategory(data);
      setIsCategoryModalOpen(false);
      loadCategories();
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdateCategory = async (data: CreateCategoryData) => {
    if (!editingCategory) return;
    
    try {
      await categoryApi.updateCategory({
        _id: editingCategory._id,
        ...data,
      });
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      loadCategories();
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await categoryApi.deleteCategory(categoryId);
      loadCategories();
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const handleCreateTag = async (data: CreateTagData) => {
    try {
      await tagApi.createTag(data);
      setIsTagModalOpen(false);
      loadTags();
      toast({
        title: "Success",
        description: "Tag created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create tag",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdateTag = async (data: CreateTagData) => {
    if (!editingTag) return;
    
    try {
      await tagApi.updateTag(editingTag._id, data);
      setIsTagModalOpen(false);
      setEditingTag(null);
      loadTags();
      toast({
        title: "Success",
        description: "Tag updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update tag",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await tagApi.deleteTag(tagId);
      loadTags();
      toast({
        title: "Success",
        description: "Tag deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tag",
        variant: "destructive",
      });
    }
  };

  const goBack = () => {
    setCurrentView('workspaces');
  };

  const handleClose = () => {
    setIsPanelOpen(false);
    setCurrentView('workspaces');
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 p-2 rounded-md bg-muted/50", className)}>
        <div className="w-6 h-6 bg-muted animate-pulse rounded" />
        <div className="flex-1 h-4 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className={cn("p-2", className)}>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={() => {
            setIsPanelOpen(true);
            setCurrentView('create');
            updatePanelPosition();
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Workspace
        </Button>
      </div>
    );
  }

  const renderPanelContent = () => {
    switch (currentView) {
      case 'create':
  return (
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 p-3 border-b">
          <Button 
            variant="ghost" 
            size="sm" 
                className="h-6 w-6 p-0"
                onClick={goBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-medium text-sm">Create Workspace</h3>
            </div>
            <div className="flex-1 overflow-hidden">
              <CreateWorkspaceModal 
                isOpen={true} 
                onClose={handleClose}
                isSubPanel={true}
              />
            </div>
              </div>
        );

      case 'settings':
        return (
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 p-3 border-b">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={goBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-medium text-sm">Workspace Settings</h3>
                </div>
            <div className="flex-1 overflow-hidden">
              <WorkspaceSettingsModal 
                isOpen={true} 
                onClose={handleClose}
                isSubPanel={true}
              />
                </div>
              </div>
        );

      case 'members':
        return (
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 p-3 border-b">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={goBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-medium text-sm">Manage Members</h3>
            </div>
            <div className="flex-1 overflow-hidden">
              <WorkspaceMembersModal 
                isOpen={true} 
                onClose={handleClose}
                isSubPanel={true}
              />
            </div>
          </div>
        );

      default:
        return (
          <>
            {/* Panel Header */}
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-medium text-sm">Workspaces</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsPanelOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
          </div>
          
            {/* Workspaces List */}
            <div className="max-h-64 overflow-y-auto">
          {workspaces.map((workspace) => (
                <div
              key={workspace._id}
              onClick={() => {
                switchWorkspace(workspace._id);
                    setIsPanelOpen(false);
              }}
              className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer hover:bg-accent transition-colors",
                workspace._id === currentWorkspace._id && "bg-accent"
              )}
            >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center text-white text-sm font-bold">
                {workspace.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {workspace.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {workspace.totalMembers} member{workspace.totalMembers !== 1 ? 's' : ''}
                </div>
              </div>
              {workspace.isOwner && (
                    <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      Owner
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Panel Actions */}
            <div className="border-t p-2 space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => setCurrentView('create')}
              >
            <Plus className="h-4 w-4 mr-2" />
            Create Workspace
              </Button>
          
          {currentWorkspace && (
            <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setCurrentView('settings')}
                  >
                <Settings className="h-4 w-4 mr-2" />
                Workspace Settings
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setCurrentView('members')}
                  >
                <Users className="h-4 w-4 mr-2" />
                Manage Members
                  </Button>
            </>
          )}
            </div>
          </>
        );
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <div ref={triggerRef} className={cn("p-2", className)}>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between h-auto p-2"
          onClick={() => {
            if (!isPanelOpen) {
              updatePanelPosition();
            }
            setIsPanelOpen(!isPanelOpen);
            setCurrentView('workspaces');
          }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">
              {currentWorkspace.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="font-medium text-sm truncate">
                {currentWorkspace.name}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {currentWorkspace.totalMembers} member{currentWorkspace.totalMembers !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <ChevronDown className={cn("h-4 w-4 ml-2 flex-shrink-0 transition-transform", isPanelOpen && "rotate-180")} />
        </Button>
    </div>

      {/* Sub Panel - Rendered as Portal */}
      {isPanelOpen && createPortal(
        <div
          ref={panelRef}
          className="fixed bg-popover border rounded-md shadow-lg z-[10000] animate-in slide-in-from-left-2 duration-200"
          style={{
            top: panelPosition.top,
            left: panelPosition.left,
            width: panelPosition.width,
            height: typeof panelPosition.height === 'number' ? panelPosition.height : 'auto',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
        >
          {renderPanelContent()}
        </div>,
        document.body
      )}
    </>
  );
};

export default WorkspaceSwitcher;
