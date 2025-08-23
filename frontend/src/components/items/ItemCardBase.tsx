import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Pin, MoreVertical, Trash2, MessageSquare, Edit } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface ItemCardBaseProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  item: { id: string; isPinned?: boolean; };
  onTogglePin?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onOpenComments?: (id: string) => void;
  commentCount?: number;
}

const ItemCardBase: React.FC<ItemCardBaseProps> = ({ 
  children, 
  className, 
  onClick, 
  header, 
  footer, 
  item, 
  onTogglePin, 
  onDelete, 
  onEdit, 
  onOpenComments, 
  commentCount = 0 
}) => {
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button onClick={handleActionClick} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                  <MoreVertical size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(item.id); }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onOpenComments?.(item.id); }}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Comments
                  {commentCount > 0 && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {commentCount}
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete?.(item.id); }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground self-end">
            {commentCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span>{commentCount}</span>
              </div>
            )}
            {footer}
          </div>
        </div>
      </div>
      {item.isPinned && <div className="absolute top-2 right-2 p-1 bg-background/50 rounded-full"><Pin size={12} className="text-foreground fill-current" /></div>}
    </motion.div>
  );
};

export default ItemCardBase;


