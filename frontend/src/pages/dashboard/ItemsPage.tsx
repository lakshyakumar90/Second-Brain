import React, { useMemo, useState, useEffect } from "react";
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

const sampleItems: UIItem[] = [
  { id: "1", type: "text", title: "Project Outline", preview: "Kickoff notes, goals, and milestones...", tags: ["project", "q1"], isPinned: true, color: "yellow" },
  { id: "2", type: "image", title: "Moodboard", images: [{ url: "https://images.unsplash.com/photo-1529634899235-9efa9f88ab22" }], tags: ["design"], color: "blue" },
  // video sample removed
  { id: "4", type: "link", title: "Great article", url: "https://vercel.com/blog", og: { title: "Vercel Blog", description: "Ship and iterate faster.", image: "https://assets.vercel.com/image/upload/front/vercel/dps.png", domain: "vercel.com" }, isPinned: true },
  { id: "5", type: "document", title: "Spec v1", fileName: "spec-v1.pdf", fileType: "pdf", sizeBytes: 845923 },
  { id: "6", type: "audio", title: "Meeting Recap", src: "", durationSec: 213, color: "green" },
  { id: "7", type: "todo", title: "Groceries", todos: [
    { id: "t1", text: "Milk", done: true },
    { id: "t2", text: "Eggs", done: false },
    { id: "t3", text: "Bread", done: false },
  ], color: "indigo" },
];

const ItemsPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [items, setItems] = useState<UIItem[]>([]);
  const [previewItem, setPreviewItem] = useState<UIItem | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [quickNote, setQuickNote] = useState("");
  const [activeFilter, setActiveFilter] = useState<ItemType | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectedItemForComments, setSelectedItemForComments] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await itemApi.getItems({ page: 1, limit: 50 });
        const list = (res?.data?.items || res?.items || []).map((it: any) => backendItemToUIItem(it));
        if (mounted) {
          setItems(list);
          // Load comment counts for all items
          loadCommentCounts(list.map(item => item.id));
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load items');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

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

  return (
    <div className="flex-1 flex flex-col gap-8 p-4 md:p-6 min-w-0">
      <div className="max-w-2xl mx-auto w-full">
        <div className="relative">
          <textarea
            className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/80 resize-none transition-all duration-300"
            placeholder="Take a note..."
            rows={quickNote ? 3 : 1}
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            onFocus={() => { if (!previewItem) { setEditorOpen(true); } }}
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

        {pinned.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Pinned</h2>
            <ItemGrid 
            items={pinned} 
            onToggleTodo={handleToggleTodo} 
            onOpenItem={setPreviewItem} 
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
            onOpenItem={setPreviewItem} 
            onAddTodo={handleAddTodo} 
            onRemoveTodo={handleRemoveTodo} 
            onTogglePin={handleTogglePin} 
            onDelete={handleDeleteItem}
            onEdit={handleEdit}
            onOpenComments={handleOpenComments}
            commentCounts={commentCounts}
          />
        </div>
      </div>
      
      <ItemPreviewModal 
        open={!!previewItem && !editorOpen} 
        item={previewItem} 
        onClose={() => setPreviewItem(null)} 
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
          setPreviewItem(null)
        }}
        onOpenComments={() => {
          if (previewItem) {
            handleOpenComments(previewItem.id);
          }
        }}
        onSave={async ({ type, title, content, todos, url, images, isPinned, tags }) => {
          try {
            const payload = uiPayloadToBackend({ type, title, content, todos, url, images, tags });
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
            setPreviewItem(null);
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

function uiPayloadToBackend({ type, title, content, todos, url, images, tags }: { type: ItemType; title: string; content?: string; todos?: Array<{ id: string; text: string; done: boolean }>; url?: string; images?: { url: string }[]; tags?: string[]; }) {
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
    // files upload persistence can be added later; focus on content + blocks
  };
}

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


