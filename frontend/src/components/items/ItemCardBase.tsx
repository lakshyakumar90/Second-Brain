import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Pin, Archive, MoreVertical, Trash2 } from "lucide-react";

interface ItemCardBaseProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  item: { id: string; isPinned?: boolean; };
  onTogglePin?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ItemCardBase: React.FC<ItemCardBaseProps> = ({ children, className, onClick, header, footer, item, onTogglePin, onDelete }) => {
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={cn(
        "group relative rounded-lg border bg-muted/50 text-card-foreground overflow-hidden cursor-pointer",
        "transition-shadow duration-200 hover:shadow-lg max-h-[300px]",
        className
      )}
      onClick={onClick}
    >
      <div className="p-4 flex flex-col h-full">
        {header && <div className="mb-2 text-sm font-medium flex items-center gap-2">{header}</div>}
        <div className="flex-grow min-h-[40px]">
          {children}
        </div>
        <div className="mt-2 h-10 flex items-center justify-between">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button onClick={(e) => { handleActionClick(e); onTogglePin?.(item.id); }} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
              <Pin size={16} className={cn(item.isPinned && "fill-current")} />
            </button>
            <button onClick={(e) => { handleActionClick(e); onDelete?.(item.id); }} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><Trash2 size={16} /></button>
            <button onClick={handleActionClick} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><MoreVertical size={16} /></button>
          </div>
          <div className="text-xs text-muted-foreground self-end">
            {footer}
          </div>
        </div>
      </div>
      {item.isPinned && <div className="absolute top-2 right-2 p-1 bg-background/50 rounded-full"><Pin size={12} className="text-foreground fill-current" /></div>}
    </motion.div>
  );
};

export default ItemCardBase;


