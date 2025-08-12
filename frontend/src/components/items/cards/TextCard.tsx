import React from "react";
import ItemCardBase from "../ItemCardBase";
import type { TextItem } from "@/types/items";

interface TextCardProps {
  item: TextItem;
  onOpenItem?: (item: TextItem) => void;
  onTogglePin?: (id: string) => void;
}

const TextCard: React.FC<TextCardProps> = ({ item, onOpenItem, onTogglePin }) => {
  return (
    <ItemCardBase
      item={item}
      onTogglePin={onTogglePin}
      onClick={() => onOpenItem?.(item)}
      header={item.title}
      footer={<div className="truncate">{item.tags?.map(t => `#${t}`).join("  ")}</div>}
    >
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.preview || "Rich note content"}</p>
    </ItemCardBase>
  );
};

export default TextCard;


