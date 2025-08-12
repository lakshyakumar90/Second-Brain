import React, { useState } from "react";
import ItemCardBase from "../ItemCardBase";
import type { TodoItem } from "@/types/items";
import { Plus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface TodoCardProps {
  item: TodoItem;
  onToggleTodo?: (itemId: string, todoId: string) => void;
  onOpenItem?: (item: TodoItem) => void;
  onAddTodo?: (itemId: string, text: string) => void;
  onRemoveTodo?: (itemId: string, todoId: string) => void;
  onTogglePin?: (id: string) => void;
}

const TodoCard: React.FC<TodoCardProps> = ({ item, onToggleTodo, onOpenItem, onAddTodo, onRemoveTodo, onTogglePin }) => {
  const completed = item.todos.filter((t) => t.done).length;
  const total = item.todos.length;
  const [newText, setNewText] = useState("");

  return (
    <ItemCardBase
      item={item}
      onTogglePin={onTogglePin}
      onClick={() => onOpenItem?.(item)}
      header={item.title}
      footer={<div className="truncate text-xs text-muted-foreground">{total > 0 ? `${completed}/${total} completed` : 'Todo List'}</div>}
    >
      <div className="flex flex-col gap-2 -mx-1">
        {item.todos.map((t) => (
          <div key={t.id} className="flex items-center gap-2 text-sm group hover:bg-black/5 dark:hover:bg-white/5 rounded-md p-1">
            <Checkbox
              id={`todo-${t.id}`}
              checked={t.done}
              onCheckedChange={() => {
                onToggleTodo?.(item.id, t.id);
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <label htmlFor={`todo-${t.id}`} className={`flex-1 ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.text}</label>
            <button
              className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => { e.stopPropagation(); onRemoveTodo?.(item.id, t.id); }}
              aria-label="Remove todo"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        {total === 0 && <p className="text-sm text-muted-foreground px-1">No tasks yet. Add one below.</p>}
        <div className="flex items-center gap-2 pt-1 px-1">
          <button
            className="p-1 text-muted-foreground"
            onClick={(e) => { e.stopPropagation(); if (newText.trim()) { onAddTodo?.(item.id, newText.trim()); setNewText(""); } }}
          >
            <Plus size={18} />
          </button>
          <Input
            className="flex-1 w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            placeholder="Add a task..."
            value={newText}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newText.trim()) {
                onAddTodo?.(item.id, newText.trim());
                setNewText("");
              }
            }}
          />
        </div>
      </div>
    </ItemCardBase>
  );
};

export default TodoCard;


