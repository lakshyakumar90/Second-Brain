import React from "react";
import ItemCardBase from "../ItemCardBase";
import type { ImageItem } from "@/types/items";

interface ImageCardProps {
  item: ImageItem;
  onOpenItem?: (item: ImageItem) => void;
  onTogglePin?: (id: string) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ item, onOpenItem, onTogglePin }) => {
  const cover = item.images?.[0]?.url;
  return (
    <ItemCardBase
      item={item}
      onTogglePin={onTogglePin}
      onClick={() => onOpenItem?.(item)}
      header={item.title}
      footer={<div className="truncate">{item.tags?.map(t => `#${t}`).join("  ")}</div>}
      className="p-0"
    >
      {cover && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img src={cover} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        </div>
      )}
      <div className="px-4 pt-3">
        <p className="text-xs text-muted-foreground">{item.images.length} image{item.images.length > 1 ? 's' : ''}</p>
      </div>
    </ItemCardBase>
  );
};

export default ImageCard;


