import React from "react";
import ItemCardBase from "../ItemCardBase";
import type { AudioItem } from "@/types/items";
import { Mic2 } from "lucide-react";

interface AudioCardProps {
  item: AudioItem;
  onOpenItem?: (item: AudioItem) => void;
  onTogglePin?: (id: string) => void;
}

const formatDuration = (sec?: number) => {
  if (!sec) return undefined;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const AudioCard: React.FC<AudioCardProps> = ({ item, onOpenItem, onTogglePin }) => {
  return (
    <ItemCardBase
      item={item}
      onTogglePin={onTogglePin}
      onClick={() => onOpenItem?.(item)}
      header={item.title}
      footer={<div className="truncate">{item.tags?.map(t => `#${t}`).join("  ")}</div>}
    >
      <div className="flex items-center gap-3">
        <Mic2 className="h-6 w-6 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{item.title}</p>
          {item.durationSec && (
            <p className="text-xs text-muted-foreground">{formatDuration(item.durationSec)}</p>
          )}
        </div>
      </div>
    </ItemCardBase>
  );
};

export default AudioCard;


