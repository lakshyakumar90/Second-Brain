import React from "react";
import ItemCardBase from "../ItemCardBase";
import type { DocumentItem } from "@/types/items";
import { FileText } from "lucide-react";

interface DocumentCardProps {
  item: DocumentItem;
  onOpenItem?: (item: DocumentItem) => void;
  onTogglePin?: (id: string) => void;
}

const formatSize = (bytes?: number) => {
  if (!bytes) return undefined;
  const units = ["B", "KB", "MB", "GB"]; let i = 0; let n = bytes;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(1)} ${units[i]}`;
};

const DocumentCard: React.FC<DocumentCardProps> = ({ item, onOpenItem, onTogglePin }) => {
  return (
    <ItemCardBase
      item={item}
      onTogglePin={onTogglePin}
      onClick={() => onOpenItem?.(item)}
      header={item.title}
      footer={<div className="truncate uppercase text-[10px]">{item.fileType} {item.sizeBytes ? `• ${formatSize(item.sizeBytes)}` : ''}</div>}
    >
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate font-medium">{item.fileName}</p>
        </div>
      </div>
    </ItemCardBase>
  );
};

export default DocumentCard;


