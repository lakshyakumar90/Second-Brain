import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  Search,
  Home,
  Inbox,
  Plus,
  ChevronDown,
  ChevronRight,
  Settings,
  FileStack,
  Trash2,
  UserPlus,
  FileText,
  Star,
  Clock,
  Hash,
  CircleQuestionMark,
  Tag as TagIcon,
  BarChart3,
  Edit,
  MoreVertical,
  X,
} from "lucide-react";
import SidebarHeader from "./SidebarHeader";
import { cn } from "@/lib/utils";
import SearchModal from "@/components/search/SearchModal";
import WorkspaceSwitcher from "@/components/workspaces/WorkspaceSwitcher";
import { categoryApi, type Category } from "@/services/categoryApi";
import { tagApi, type Tag as TagType } from "@/services/tagApi";
import { pageApi } from "@/services/pageApi";
import CategoryModal from "@/components/categories/CategoryModal";
import TagModal from "@/components/tags/TagModal";
import PagesPanel from "./PagesPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  onToggleSidebar?: () => void;
  sidebarState?: "collapsed" | "expanded";
  onSearchOpen?: () => void;
  onCloseSidebar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onToggleSidebar,
  sidebarState,
  onSearchOpen,
  onCloseSidebar,
}) => {
  const { currentWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();

  const [isWorkspacesExpanded, setIsWorkspacesExpanded] = useState(true);
  const [isPrivateExpanded, setIsPrivateExpanded] = useState(true);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);
  const [isTagsExpanded, setIsTagsExpanded] = useState(true);
  const [isPagesExpanded, setIsPagesExpanded] = useState(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isPagesPanelOpen, setIsPagesPanelOpen] = useState(false);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Tags state
  const [tags, setTags] = useState<TagType[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [editingTag, setEditingTag] = useState<TagType | null>(null);

  // Pages state
  const [pages, setPages] = useState<any[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [pageSearchQuery, setPageSearchQuery] = useState('');

  const isCollapsed = sidebarState === "collapsed";
  const showLabels = !isCollapsed;

  // Load categories
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoadingCategories(true);
        const res = await categoryApi.getCategories({
          search: categorySearchQuery || undefined,
          limit: 100,
          sortBy: "sortOrder",
          sortOrder: "asc",
        });
        const list = (res?.data?.categories || []) as Category[];
        if (mounted) setCategories(list);
      } catch (e) {
        if (mounted) setCategories([]);
      } finally {
        if (mounted) setIsLoadingCategories(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [categorySearchQuery]);

  // Load tags
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoadingTags(true);
        const res = await tagApi.getTags({
          search: tagSearchQuery || undefined,
          limit: 100,
          sortBy: "usageCount",
          sortOrder: "desc",
        });
        const list = (res?.data?.tags || []) as TagType[];
        if (mounted) setTags(list);
      } catch (e) {
        if (mounted) setTags([]);
      } finally {
        if (mounted) setIsLoadingTags(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [tagSearchQuery]);

  // Load pages
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!currentWorkspace) return;
        setIsLoadingPages(true);
        const res = await pageApi.getPages({
          page: 1,
          limit: 100,
          workspace: currentWorkspace._id,
        });
        const list = (res?.data?.pages || res?.pages || []);
        if (mounted) setPages(list);
      } catch (e) {
        if (mounted) setPages([]);
      } finally {
        if (mounted) setIsLoadingPages(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [currentWorkspace]);

  const MenuItem = ({
    icon: Icon,
    label,
    count,
    onClick,
    className = "",
    isActive = false,
  }: {
    icon: React.ElementType;
    label: string;
    count?: number;
    onClick?: () => void;
    className?: string;
    isActive?: boolean;
  }) => (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors text-sm",
        "hover:bg-secondary/50 text-muted-foreground hover:text-foreground",
        isActive && "bg-secondary text-foreground",
        className
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {showLabels && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {count !== undefined && (
            <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
              {count}
            </span>
          )}
        </>
      )}
    </div>
  );

  const SectionHeader = ({
    label,
    isExpanded,
    onToggle,
    hasAddButton = false,
    onAdd,
  }: {
    label: string;
    isExpanded: boolean;
    onToggle: () => void;
    hasAddButton?: boolean;
    onAdd?: () => void;
  }) => (
    <div className="flex items-center justify-between group py-1">
      <div
        onClick={onToggle}
        className="flex items-center gap-1 cursor-pointer hover:text-foreground text-muted-foreground flex-1"
      >
        {isExpanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {showLabels && (
          <span className="text-xs font-medium uppercase tracking-wider">
            {label}
          </span>
        )}
      </div>
      {showLabels && hasAddButton && (
        <Plus
          onClick={onAdd}
          className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
        />
      )}
    </div>
  );

  const handleSearchOpen = () => {
    setIsSearchModalOpen(true);
    onSearchOpen?.();
    onCloseSidebar?.();
  };

  const handleItemClick = (item: any) => {
    // Simple navigation - check if it's a page and navigate accordingly
    const isPage =
      (item as any).searchType === "page" || item.type === "document";
    const targetUrl = isPage ? `/pages/${item.id}` : `/items/${item.id}`;
    navigate(targetUrl);
    setIsSearchModalOpen(false);
  };

  // Category handlers
  const openCategoryCreate = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const openCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const handleCreateCategory = async (data: any) => {
    try {
      if (editingCategory) {
        await categoryApi.updateCategory({
          _id: editingCategory._id,
          ...data,
        });
      } else {
      await categoryApi.createCategory(data);
      }
      closeCategoryModal();
      // reload categories
      const res = await categoryApi.getCategories({
        search: categorySearchQuery || undefined,
        limit: 100,
        sortBy: "sortOrder",
        sortOrder: "asc",
      });
      setCategories((res?.data?.categories || []) as Category[]);
    } catch (e) {
      throw e;
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await categoryApi.deleteCategory(categoryId);
      // reload categories
      const res = await categoryApi.getCategories({
        search: categorySearchQuery || undefined,
        limit: 100,
        sortBy: "sortOrder",
        sortOrder: "asc",
      });
      setCategories((res?.data?.categories || []) as Category[]);
    } catch (e) {
      console.error('Failed to delete category:', e);
    }
  };

  // Tag handlers
  const openTagCreate = () => {
    setEditingTag(null);
    setIsTagModalOpen(true);
  };

  const openTagEdit = (tag: TagType) => {
    setEditingTag(tag);
    setIsTagModalOpen(true);
  };

  const closeTagModal = () => {
    setIsTagModalOpen(false);
    setEditingTag(null);
  };

  const handleCreateTag = async (data: any) => {
    try {
      if (editingTag) {
        await tagApi.updateTag(editingTag._id, data);
      } else {
        await tagApi.createTag(data);
      }
      closeTagModal();
      // reload tags
      const res = await tagApi.getTags({
        search: tagSearchQuery || undefined,
        limit: 100,
        sortBy: "usageCount",
        sortOrder: "desc",
      });
      setTags((res?.data?.tags || []) as TagType[]);
    } catch (e) {
      throw e;
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;
    
    try {
      await tagApi.deleteTag(tagId);
      // reload tags
      const res = await tagApi.getTags({
        search: tagSearchQuery || undefined,
        limit: 100,
        sortBy: "usageCount",
        sortOrder: "desc",
      });
      setTags((res?.data?.tags || []) as TagType[]);
    } catch (e) {
      console.error('Failed to delete tag:', e);
    }
  };

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-background border-r transition-all duration-200",
        isCollapsed ? "w-0 overflow-hidden" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-2 border-b">
        <SidebarHeader
          onToggleSidebar={onToggleSidebar}
          sidebarState={sidebarState}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-y-auto py-2">
        {/* Section 1: Search, Home, Inbox */}
        <div className="px-2 space-y-1 mb-4">
          <MenuItem icon={Search} label="Search" onClick={handleSearchOpen} />
          <MenuItem
            icon={Home}
            label="Home"
            isActive={location.pathname === "/home"}
            onClick={() => navigate("/home")}
          />
          <MenuItem icon={Inbox} label="Inbox" count={3} />
        </div>

        {/* Section 2: Workspaces/Teamspaces */}
        <div className="px-2 mb-4">
          <SectionHeader
            label="Workspaces"
            isExpanded={isWorkspacesExpanded}
            onToggle={() => setIsWorkspacesExpanded(!isWorkspacesExpanded)}
            hasAddButton
            onAdd={() => {}}
          />
          {isWorkspacesExpanded && (
            <WorkspaceSwitcher
              onOpenCreateModal={() => {}}
              onOpenSettings={() => {}}
              onOpenMembers={() => {}}
            />
          )}
        </div>

        {/* Section 3: Private Collection */}
        <div className="px-2 mb-4">
          <SectionHeader
            label="Private"
            isExpanded={isPrivateExpanded}
            onToggle={() => setIsPrivateExpanded(!isPrivateExpanded)}
          />
          {isPrivateExpanded && showLabels && (
            <div className="ml-2 space-y-1 mt-2">
              <MenuItem
                icon={FileText}
                label="Items"
                isActive={location.pathname === "/items"}
                onClick={() => navigate("/items")}
              />
              <MenuItem
                icon={Star}
                label="Favorites"
                onClick={() => navigate("/items?isFavorite=true")}
              />
              <MenuItem
                icon={Clock}
                label="Recent"
                onClick={() =>
                  navigate("/items?sortBy=lastViewedAt&sortOrder=desc")
                }
              />
            </div>
          )}
                  </div>

        {/* Section 4: Categories Panel */}
        <div className="px-2 mb-4">
          <SectionHeader
            label="Categories"
            isExpanded={isCategoriesExpanded}
            onToggle={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
            hasAddButton
            onAdd={openCategoryCreate}
          />
          {isCategoriesExpanded && showLabels && (
            <div className="ml-2 space-y-2 mt-2">
              {/* Category Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3" />
                <Input
                  placeholder="Search categories..."
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  className="pl-7 h-7 text-xs"
                  />
                </div>

              {/* Categories List */}
              <div className="space-y-1 max-h-48 overflow-y-auto">
                    {isLoadingCategories && (
                      <div className="text-xs text-muted-foreground px-2 py-1.5">
                        Loading…
                      </div>
                    )}
                    {!isLoadingCategories &&
                      categories.map((category) => (
                        <div
                          key={category._id}
                      className="group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-secondary/50 text-sm"
                          onClick={() =>
                            navigate(`/items?categories=${category._id}`)
                          }
                        >
                          <span className="text-sm">{category.icon}</span>
                          <span className="flex-1 truncate">
                            {category.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {category.itemCount}
                          </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            openCategoryEdit(category);
                          }}>
                            <Edit className="h-3 w-3 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCategory(category._id);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                        </div>
                      ))}
                {!isLoadingCategories && categories.length === 0 && (
                  <div className="text-xs text-muted-foreground px-2 py-1.5">
                    No categories found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Tags Panel */}
        <div className="px-2 mb-4">
          <SectionHeader
            label="Tags"
            isExpanded={isTagsExpanded}
            onToggle={() => setIsTagsExpanded(!isTagsExpanded)}
            hasAddButton
            onAdd={openTagCreate}
          />
          {isTagsExpanded && showLabels && (
            <div className="ml-2 space-y-2 mt-2">
              {/* Tag Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3" />
                <Input
                  placeholder="Search tags..."
                  value={tagSearchQuery}
                  onChange={(e) => setTagSearchQuery(e.target.value)}
                  className="pl-7 h-7 text-xs"
                />
              </div>

              {/* Tags List */}
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {isLoadingTags && (
                  <div className="text-xs text-muted-foreground px-2 py-1.5">
                    Loading…
                  </div>
                )}
                {!isLoadingTags &&
                  tags.map((tag) => (
                    <div
                      key={tag._id}
                      className="group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-secondary/50 text-sm"
                      onClick={() =>
                        navigate(`/items?tags=${tag._id}`)
                      }
                    >
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="flex-1 truncate">
                        {tag.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {tag.usageCount}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            openTagEdit(tag);
                          }}>
                            <Edit className="h-3 w-3 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTag(tag._id);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                {!isLoadingTags && tags.length === 0 && (
                  <div className="text-xs text-muted-foreground px-2 py-1.5">
                    No tags found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section 6: Pages Panel */}
        <div className="px-2 mb-4">
          <SectionHeader
            label="Pages"
            isExpanded={isPagesExpanded}
            onToggle={() => setIsPagesExpanded(!isPagesExpanded)}
            hasAddButton
            onAdd={() => navigate('/home')}
          />
          {isPagesExpanded && showLabels && (
            <div className="ml-2 space-y-2 mt-2">
              {/* Pages List */}
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {isLoadingPages && (
                  <div className="text-xs text-muted-foreground px-2 py-1.5">
                    Loading…
                  </div>
                )}
                {!isLoadingPages &&
                  pages.slice(0, 7).map((page) => (
                    <div
                      key={page._id}
                      className="group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-secondary/50 text-sm"
                      onClick={() => navigate(`/pages/${page._id}`)}
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 truncate">
                        {page.title || 'Untitled'}
                      </span>
                    </div>
                  ))}
                {!isLoadingPages && pages.length === 0 && (
                  <div className="text-xs text-muted-foreground px-2 py-1.5">
                    No pages found
                  </div>
                )}
                {!isLoadingPages && pages.length > 7 && (
                  <div
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-secondary/50 text-sm text-muted-foreground"
                    onClick={() => setIsPagesPanelOpen(true)}
                  >
                    <span className="text-xs">+{pages.length - 7} more pages</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section 7: Settings, Templates, Trash */}
        <div className="px-2 mb-4">
          <MenuItem
            icon={BarChart3}
            label="Analytics"
            isActive={location.pathname === "/analytics"}
            onClick={() => navigate("/analytics")}
          />
          <MenuItem icon={Settings} label="Settings" />
          <MenuItem icon={FileStack} label="Templates" />
          <MenuItem icon={Trash2} label="Trash" />
        </div>
      </div>

      {/* Footer - User section when expanded */}
      {showLabels && (
        <div className="border-t pb-2">
          <div className="px-2 pt-4">
            <MenuItem icon={UserPlus} label="Invite members" />
          </div>
          <div className="px-2">
            <MenuItem icon={CircleQuestionMark} label="Help" />
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onItemClick={handleItemClick}
      />

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={closeCategoryModal}
        category={editingCategory}
        onSubmit={handleCreateCategory}
      />

      {/* Tag Modal */}
      <TagModal
        isOpen={isTagModalOpen}
        onClose={closeTagModal}
        tag={editingTag}
        onSubmit={handleCreateTag}
      />

      {/* Pages Panel */}
      <PagesPanel
        isOpen={isPagesPanelOpen}
        onClose={() => setIsPagesPanelOpen(false)}
        pages={pages}
        isLoading={isLoadingPages}
      />
    </div>
  );
};

export default Sidebar;
