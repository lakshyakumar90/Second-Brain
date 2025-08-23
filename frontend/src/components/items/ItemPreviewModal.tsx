import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { UIItem } from "@/types/items";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import CommentableText from "@/components/comments/CommentableText";
import { useAppSelector } from "@/store/hooks";

interface ItemPreviewModalProps {
  open: boolean;
  item: UIItem | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  onToggleTodo?: (itemId: string, todoId: string) => void;
}

const ItemPreviewModal: React.FC<ItemPreviewModalProps> = ({ open, item, onClose, onEdit, onDelete, onToggleTodo }) => {
  const { user } = useAppSelector((state) => state.auth);
  
  if (!item) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-[92%] max-w-2xl rounded-xl border bg-background p-4 shadow-2xl max-h-[90vh] overflow-y-auto relative"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            style={item.color ? { backgroundColor: item.color } : undefined}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold truncate">{item.title}</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onEdit}>Edit</Button>
                {onDelete && <Button variant="destructive" size="sm" onClick={onDelete}>Delete</Button>}
                <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
              </div>
            </div>
            <div className="space-y-3 pr-2">
              {item.type === "text" && (
                <CommentableText
                  content={item.preview || ""}
                  itemId={item.id}
                  currentUserId={user?._id || ""}
                  className="text-sm text-muted-foreground"
                />
              )}
              {item.type !== "text" && (item as any).preview && (
                <CommentableText
                  content={(item as any).preview}
                  itemId={item.id}
                  currentUserId={user?._id || ""}
                  className="text-sm text-muted-foreground"
                />
              )}
              {item.type === "image" && (
                <div className="w-full overflow-hidden rounded-lg">
                  {(item as any).images?.[0]?.url && (
                    <img src={(item as any).images[0].url} className="w-full h-auto object-contain" />
                  )}
                </div>
              )}
              {item.type === "link" && (
                <div className="space-y-2">
                  {(item as any).og?.image && (
                    <img src={(item as any).og.image} className="w-full rounded" />
                  )}
                  <p className="text-sm text-muted-foreground">{(item as any).og?.description || (item as any).url}</p>
                </div>
              )}
              {item.type === "document" && (
                <div className="space-y-1 text-sm">
                  <div className="font-medium">{(item as any).fileName}</div>
                  {(item as any).url && <div className="text-muted-foreground">{(item as any).url}</div>}
                </div>
              )}
              {item.type === "audio" && (
                <div className="space-y-1 text-sm">
                  {(item as any).cover && <img src={(item as any).cover} className="w-24 h-24 rounded object-cover" />}
                  <div className="text-muted-foreground">{(item as any).src}</div>
                </div>
              )}
              {item.type === "todo" && (
                <div className="flex flex-col gap-2">
                  {(item as any).todos?.map((t: any) => (
                    <div key={t.id} className="flex items-start gap-2 text-sm">
                      <Checkbox
                        checked={t.done}
                        onCheckedChange={() => onToggleTodo?.(item.id, t.id)}
                        aria-label={`Mark ${t.text} as ${t.done ? 'not done' : 'done'}`}
                      />
                      <span className={t.done ? "line-through text-muted-foreground" : ""}>{t.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Bottom overlay for scroll indication */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none rounded-b-xl"></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ItemPreviewModal;


