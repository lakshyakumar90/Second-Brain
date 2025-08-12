import React from "react";
import ItemCardBase from "../ItemCardBase";
import type { LinkItem } from "@/types/items";

interface LinkCardProps {
  item: LinkItem;
  onOpenItem?: (item: LinkItem) => void;
  onTogglePin?: (id: string) => void;
}

const getDomain = (url: string) => {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
};

const LinkCard: React.FC<LinkCardProps> = ({ item, onOpenItem, onTogglePin }) => {
  const domain = item.og?.domain || getDomain(item.url);
  return (
    <ItemCardBase
      item={item}
      onTogglePin={onTogglePin}
      onClick={() => onOpenItem?.(item)}
      header={item.title}
      footer={<div className="truncate">{domain}</div>}
      className="p-0"
    >
      {item.og?.image && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img src={item.og.image} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        </div>
      )}
      <div className="p-4">
        <p className="font-semibold text-sm">{item.og?.title || item.title}</p>
        <p className="text-sm text-muted-foreground line-clamp-2">{item.og?.description || item.url}</p>
      </div>
    </ItemCardBase>
  );
};

export default LinkCard;


