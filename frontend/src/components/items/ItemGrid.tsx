import React from "react";
import type { UIItem } from "@/types/items";
import TextCard from "./cards/TextCard.tsx";
import ImageCard from "./cards/ImageCard.tsx";
import LinkCard from "./cards/LinkCard.tsx";
import DocumentCard from "./cards/DocumentCard.tsx";
import AudioCard from "./cards/AudioCard.tsx";
import TodoCard from "./cards/TodoCard.tsx";

interface ItemGridProps {
  items: UIItem[];
  onToggleTodo?: (itemId: string, todoId: string) => void;
  onOpenItem?: (item: UIItem) => void;
  onAddTodo?: (itemId: string, text: string) => void;
  onRemoveTodo?: (itemId: string, todoId: string) => void;
  onTogglePin?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ItemGrid: React.FC<ItemGridProps> = ({ items, onToggleTodo, onOpenItem, onAddTodo, onRemoveTodo, onTogglePin, onDelete }) => {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
      {items.map((item) => {
        const key = `${item.type}_${item.id}`;
        const renderCard = () => {
          const cardProps = { onOpenItem, onTogglePin, onDelete };
          switch (item.type) {
            case "text":
              return <TextCard item={item} {...cardProps} />;
            case "image":
              return <ImageCard item={item} {...cardProps} />;
            case "link":
              return <LinkCard item={item} {...cardProps} />;
            case "document":
              return <DocumentCard item={item} {...cardProps} />;
            case "audio":
              return <AudioCard item={item} {...cardProps} />;
            case "todo":
              return (
                <TodoCard
                  item={item as any}
                  onToggleTodo={onToggleTodo}
                  onAddTodo={onAddTodo}
                  onRemoveTodo={onRemoveTodo}
                  {...cardProps}
                />
              );
            default:
              return null;
          }
        };
        return (
          <div key={key} className="break-inside-avoid">
            {renderCard()}
          </div>
        );
      })}
    </div>
  );
};

export default ItemGrid;


