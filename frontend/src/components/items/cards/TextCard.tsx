import React from "react";
import ItemCardBase from "../ItemCardBase";
import { Badge } from "@/components/ui/badge";
import { Tag } from 'lucide-react';
import type { TextItem } from "@/types/items";

interface TextCardProps {
  item: TextItem;
  onOpenItem?: (item: TextItem) => void;
  onTogglePin?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onOpenComments?: (id: string) => void;
  commentCount?: number;
}

const TextCard: React.FC<TextCardProps> = ({ 
  item, 
  onOpenItem, 
  onTogglePin, 
  onDelete, 
  onEdit, 
  onOpenComments, 
  commentCount 
}) => {
  return (
    <ItemCardBase
      item={item}
      onTogglePin={onTogglePin}
      onDelete={onDelete}
      onEdit={onEdit}
      onOpenComments={onOpenComments}
      commentCount={commentCount}
      onClick={() => onOpenItem?.(item)}
      header={item.title}
      footer={
        <div className="flex items-center gap-2">
          {item.tags && item.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Tag className="h-3 w-3 text-muted-foreground" />
              {item.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      }
    >
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.preview || "Rich note content"}</p>
    </ItemCardBase>
  );
};

export default TextCard;


