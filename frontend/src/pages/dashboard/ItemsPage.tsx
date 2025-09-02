import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ItemGrid from "@/components/items/ItemGrid";
import type { UIItem } from "@/types/items";
import ItemPreviewModal from "@/components/items/ItemPreviewModal";
import ItemEditorModal from "@/components/items/ItemEditorModal";
import { Button } from "@/components/ui/button";
import type { ItemType } from "@/types/items";
import { itemApi, type Block } from "@/services/itemApi";
import { commentApi } from "@/services/commentApi";
import { CommentsPanel } from "@/components/comments";
import { useAppSelector } from "@/store/hooks";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useWorkspacePermissions } from "@/hooks/useWorkspacePermissions";
import WorkspaceGuard from "@/components/workspace/WorkspaceGuard";
import { useToast } from "@/hooks/use-toast";

const ItemsPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { currentWorkspace } = useWorkspace();
  const permissions = useWorkspacePermissions();
  const { toast } = useToast();
  const [items, setItems] = useState<UIItem[]>([]);

  const uiPayloadToBackend = ({ type, title, content, todos, url, tags }: { type: ItemType; title: string; content?: string; todos?: Array<{ id: string; text: string; done: boolean }>; url?: string; tags?: string[]; }) => {
    const blocks: Block[] | undefined = todos && todos.length > 0 ? todos.map(t => ({
      id: t.id,
      type: 'checklist',
      content: t.text,
      checked: t.done,
    })) : undefined;
    return {
      type: type === 'todo' ? 'text' : (type as any),
      title: title || 'Untitled',
      content: content || undefined,
      blocks,
      url: url || undefined,
      tags: tags || undefined,
      workspace: currentWorkspace!._id,
      // files upload persistence can be added later; focus on content + blocks
    };
  };
  const [previewItem, setPreviewItem] = useState<UIItem | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [quickNote, setQuickNote] = useState("");
  const [activeFilter, setActiveFilter] = useState<ItemType | 'all'>('all');
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectedItemForComments, setSelectedItemForComments] = useState<string | null>(null);

  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!currentWorkspace) {
          console.log('No workspace selected, skipping items load');
          return;
        }
        
        const params: any = { page: 1, limit: 50, workspace: currentWorkspace._id };
        // Parse URL query parameters and pass through to API
        const searchParams = new URLSearchParams(location.search);
        const setBool = (key: string) => {
          const v = searchParams.get(key);
          if (v === 'true' || v === 'false') params[key] = v === 'true';
        };
        const setStr = (key: string) => {
          const v = searchParams.get(key);
          if (v) params[key] = v;
        };
        const setEnum = (key: string) => setStr(key);
        // supported filters
        setStr('type');
        setBool('isPublic');
        setBool('isFavorite');
        setBool('isArchived');
        setStr('search');
        setStr('tags');
        setStr('categories');
        setStr('socialPlatform');
        setEnum('sentiment');
        setEnum('complexity');
        setStr('dateFrom');
        setStr('dateTo');
        setStr('sortBy');
        setEnum('sortOrder');
        const res = await itemApi.getItems(params);
        const list = (res?.data?.items || res?.items || []).map((it: any) => backendItemToUIItem(it));
        if (mounted) {
          setItems(list); // TODO: add pagination and sorting here
          loadCommentCounts(list.map((item: any) => item.id));
        }
      } catch (e: any) {
        if (mounted) console.error('Failed to load items', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [currentWorkspace, location.search]);

  useEffect(() => {
    if (itemId && items.length > 0) {
      const itemToPreview = items.find(item => item.id === itemId);
      if (itemToPreview) {
        setPreviewItem(itemToPreview);
      } else {
        // Optional: handle case where item ID is not found, e.g., show a notification
        console.warn(`Item with id ${itemId} not found.`);
        navigate('/items', { replace: true });
      }
    }
  }, [itemId, items, navigate]);


  const loadCommentCounts = async (itemIds: string[]) => {
    try {
      const counts: Record<string, number> = {};
      await Promise.all(
        itemIds.map(async (itemId) => {
          try {
            const response = await commentApi.getCommentsCount(itemId);
            counts[itemId] = response.count;
          } catch (error) {
            counts[itemId] = 0;
          }
        })
      );
      setCommentCounts(counts);
    } catch (error) {
      console.error('Failed to load comment counts:', error);
    }
  };

  const handleOpenPreview = (item: UIItem) => {
    setPreviewItem(item);
    navigate(`/items/${item.id}`);
  };

  const handleClosePreview = () => {
    setPreviewItem(null);
    navigate('/items');
  };

  const handleTogglePin = (itemId: string) => {
    setItems(prev => prev.map(it => it.id === itemId ? { ...it, isPinned: !it.isPinned } : it));
  };

  useEffect(() => {
    if (previewItem) {
      const updatedPreviewItem = items.find(item => item.id === previewItem.id);
      if (updatedPreviewItem) {
        setPreviewItem(updatedPreviewItem);
      } else {
        setPreviewItem(null);
      }
    }
  }, [items, previewItem]);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items;
    return items.filter(i => i.type === activeFilter);
  }, [items, activeFilter]);

  const pinned = filteredItems.filter((i) => i.isPinned);
  const others = filteredItems.filter((i) => !i.isPinned);

  const handleToggleTodo = (itemId: string, todoId: string) => {
    setItems((prev) => prev.map((it) => {
      if (it.id !== itemId || it.type !== "todo") return it;
      return {
        ...it,
        todos: (it as any).todos.map((t: any) => t.id === todoId ? { ...t, done: !t.done } : t)
      } as UIItem;
    }));
  };

  const handleAddTodo = (itemId: string, text: string) => {
    setItems((prev) => prev.map((it) => {
      if (it.id !== itemId || it.type !== "todo") return it;
      const newId = `${itemId}_${Date.now()}`;
      return { ...it, todos: [...(it as any).todos, { id: newId, text, done: false }] } as UIItem;
    }));
  };

  const handleRemoveTodo = (itemId: string, todoId: string) => {
    setItems((prev) => prev.map((it) => {
      if (it.id !== itemId || it.type !== "todo") return it;
      return { ...it, todos: (it as any).todos.filter((t: any) => t.id !== todoId) } as UIItem;
    }));
  };

  const handleOpenComments = (itemId: string) => {
    setSelectedItemForComments(itemId);
    setCommentsOpen(true);
  };

  const handleEdit = (itemId: string) => {
    const item = items.find(it => it.id === itemId);
    if (item) {
      setPreviewItem(item);
      setEditorOpen(true);
    }
  };

  // const handleQuickAdd = () => {
  //   const note = quickNote.trim();
  //   if (!note) return;
  //   const id = `${Date.now()}`;
  //   const newItem: UIItem = { id, type: "text", title: "", preview: note } as UIItem;
  //   setItems((prev) => [newItem, ...prev]);
  //   setQuickNote("");
  //   setPreviewItem(newItem);
  //   setEditorOpen(true);
  // };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setItems(prev => prev.filter(it => it.id !== itemId));
      setPreviewItem(null);
      setEditorOpen(false);
      // Optional: call backend delete here in future
    }
  };

  // const handleCreateItem = (item: any) => {
  //   const ui = backendItemToUIItem(item);
  //   setItems(prev => [ui, ...prev]);
  // };

  return (
    <WorkspaceGuard type="item">
      <div className="flex-1 flex flex-col gap-8 p-4 md:p-6 min-w-0">
      <div className="max-w-2xl mx-auto w-full">
        <div className="relative">
          <textarea
            className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/80 resize-none transition-all duration-300"
            placeholder={permissions.canCreateItems ? "Take a note..." : "View-only mode - You cannot create items"}
            rows={quickNote ? 3 : 1}
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            onFocus={() => { 
              if (!permissions.canCreateItems) {
                toast({
                  title: "Permission Denied",
                  description: "You have view-only access to this workspace.",
                  variant: "destructive",
                });
                return;
              }
              if (!previewItem) { setEditorOpen(true); } 
            }}
            disabled={!permissions.canCreateItems}
          />
        </div>
      </div>
      
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <FilterButton active={activeFilter} filter="all" onClick={setActiveFilter}>All</FilterButton>
          <FilterButton active={activeFilter} filter="text" onClick={setActiveFilter}>Text</FilterButton>
          <FilterButton active={activeFilter} filter="todo" onClick={setActiveFilter}>Todo</FilterButton>
          <FilterButton active={activeFilter} filter="image" onClick={setActiveFilter}>Image</FilterButton>
          <FilterButton active={activeFilter} filter="link" onClick={setActiveFilter}>Link</FilterButton>
          <FilterButton active={activeFilter} filter="audio" onClick={setActiveFilter}>Audio</FilterButton>
          <FilterButton active={activeFilter} filter="document" onClick={setActiveFilter}>Document</FilterButton>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              {currentWorkspace ? `No items found in ${currentWorkspace.name}` : 'No items found'}
            </div>
            {permissions.canCreateItems && (
              <Button onClick={() => setEditorOpen(true)}>
                Create your first item
              </Button>
            )}
            {!permissions.canCreateItems && (
              <p className="text-sm text-muted-foreground">
                You have view-only access to this workspace
              </p>
            )}
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Pinned</h2>
                <ItemGrid 
                items={pinned} 
                onToggleTodo={handleToggleTodo} 
                onOpenItem={handleOpenPreview} 
                onAddTodo={handleAddTodo} 
                onRemoveTodo={handleRemoveTodo} 
                onTogglePin={handleTogglePin} 
                onDelete={handleDeleteItem}
                onEdit={handleEdit}
                onOpenComments={handleOpenComments}
                commentCounts={commentCounts}
              />
              </div>
            )}

            <div>
              {pinned.length > 0 && <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Others</h2>}
              <ItemGrid 
                items={others} 
                onToggleTodo={handleToggleTodo} 
                onOpenItem={handleOpenPreview} 
                onAddTodo={handleAddTodo} 
                onRemoveTodo={handleRemoveTodo} 
                onTogglePin={handleTogglePin} 
                onDelete={handleDeleteItem}
                onEdit={handleEdit}
                onOpenComments={handleOpenComments}
                commentCounts={commentCounts}
              />
            </div>
          </>
        )}
      </div>
      
      <ItemPreviewModal 
        open={!!previewItem && !editorOpen} 
        item={previewItem} 
        onClose={handleClosePreview} 
        onEdit={() => {
          setEditorOpen(true);
        }}
        onDelete={() => previewItem && handleDeleteItem(previewItem.id)}
        onToggleTodo={handleToggleTodo}
      />
      
      {/* The ItemEditorModal is used for both creating and editing items */}
      <ItemEditorModal
        open={editorOpen}
        item={previewItem}
        onClose={() => {
          setEditorOpen(false)
          if (itemId) {
            handleClosePreview();
          } else {
            setPreviewItem(null);
          }
        }}
        onOpenComments={() => {
          if (previewItem) {
            handleOpenComments(previewItem.id);
          }
        }}
        onSave={async ({ type, title, content, todos, url, tags }) => {
          try {
            if (!currentWorkspace) {
              throw new Error('No workspace selected');
            }
            const payload = uiPayloadToBackend({ type, title, content, todos, url, tags });
            if (previewItem) {
              const updated = await itemApi.updateItem({ itemId: previewItem.id, ...payload });
              const ui = backendItemToUIItem(updated?.item || updated);
              setItems(prev => prev.map(it => (it.id === ui.id ? ui : it)));
            } else {
              const created = await itemApi.createItem(payload);
              const ui = backendItemToUIItem(created?.item || created);
              setItems(prev => [ui, ...prev]);
            }
          } catch (e) {
            console.error('Failed to save item', e);
          } finally {
            setEditorOpen(false);
            if (itemId) {
              handleClosePreview();
            } else {
              setPreviewItem(null);
            }
          }
        }}
      />

      {/* Comments Panel */}
      {selectedItemForComments && (
        <CommentsPanel
          itemId={selectedItemForComments}
          currentUserId={user?._id || ""}
          isOpen={commentsOpen}
          onToggle={() => setCommentsOpen(!commentsOpen)}
        />
      )}
    </div>
    </WorkspaceGuard>
  );
};

const FilterButton = ({ active, filter, onClick, children }: { active: string, filter: string, onClick: (f: any) => void, children: React.ReactNode }) => (
  <Button
    variant={active === filter ? "secondary" : "ghost"}
    size="sm"
    onClick={() => onClick(filter)}
  >
    {children}
  </Button>
);

export default ItemsPage;



function backendItemToUIItem(it: any): UIItem {
  const id = it._id || it.id;
  const type = (it.type || 'text') as ItemType;
  const title = it.title || '';
  const preview = it.content || '';
  const tags = it.tags || [];
  // Derive UI type 'todo' from blocks
  const checklistBlocks = (it.blocks || []).filter((b: any) => b.type === 'checklist');
  if (checklistBlocks.length > 0) {
    const todos = checklistBlocks.map((b: any) => ({ id: b.id, text: b.content || '', done: !!b.checked }));
    return { id, type: 'todo', title, todos, tags } as UIItem;
  }
  if (type === 'image') {
    const images = it.images || [];
    return { id, type: 'image', title, images, tags } as UIItem;
  }
  if (type === 'link') {
    return { id, type: 'link', title, url: it.url, tags } as UIItem;
  }
  if (type === 'audio') {
    return { id, type: 'audio', title, src: it.url || '', tags } as UIItem;
  }
  if (type === 'document') {
    return { id, type: 'document', title, fileName: it.metadata?.fileName || 'file', fileType: it.metadata?.fileType || 'doc', url: it.url, tags } as UIItem;
  }
  return { id, type: 'text', title, preview, tags } as UIItem;
}


