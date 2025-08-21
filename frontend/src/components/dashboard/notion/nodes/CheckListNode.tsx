import type { NodeKey, SerializedLexicalNode, Spread } from "lexical";
import {
  DecoratorNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $createTextNode,
} from "lexical";
import { Plus } from "lucide-react";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export type SerializedCheckListNode = Spread<
  {
    checked: boolean;
    value: string;
  },
  SerializedLexicalNode
>;

export class CheckListNode extends DecoratorNode<React.ReactElement> {
  __checked: boolean;
  __value: string;

  static getType(): string {
    return "checklist";
  }

  static clone(node: CheckListNode): CheckListNode {
    return new CheckListNode(node.__value, node.__checked, node.__key);
  }

  constructor(value: string, checked: boolean = false, key?: NodeKey) {
    super(key);
    this.__value = value;
    this.__checked = checked;
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "checklist-item";
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  static importJSON(serializedNode: SerializedCheckListNode): CheckListNode {
    return new CheckListNode(serializedNode.value, serializedNode.checked);
  }

  exportJSON(): SerializedCheckListNode {
    return {
      ...super.exportJSON(),
      type: "checklist",
      version: 1,
      checked: this.__checked,
      value: this.__value,
    };
  }

  getChecked(): boolean {
    return this.__checked;
  }

  setChecked(checked: boolean): void {
    this.__checked = checked;
    this.markDirty();
  }

  getValue(): string {
    return this.__value;
  }

  setValue(value: string): void {
    this.__value = value;
    this.markDirty();
  }

  toggleChecked(): void {
    this.__checked = !this.__checked;
    this.markDirty();
  }

  decorate(): React.ReactElement {
    return (
      <CheckListComponent
        nodeKey={this.getKey()}
        checked={this.__checked}
        value={this.__value}
      />
    );
  }
}

function CheckListComponent({
  nodeKey,
  checked,
  value,
}: {
  nodeKey: NodeKey;
  checked: boolean;
  value: string;
}) {
  const [editor] = useLexicalComposerContext();
  const [localValue, setLocalValue] = useState(value);
  const [localChecked, setLocalChecked] = useState(checked);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local state when props change
  useEffect(() => {
    setLocalValue(value);
    setLocalChecked(checked);
  }, [value, checked]);

  const updateNode = useCallback((newValue: string, newChecked: boolean) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node && $isCheckListNode(node)) {
        node.setValue(newValue);
        node.setChecked(newChecked);
      }
    });
  }, [editor, nodeKey]);

  const handleToggleChecked = useCallback(() => {
    const newChecked = !localChecked;
    setLocalChecked(newChecked);
    updateNode(localValue, newChecked);
  }, [localChecked, localValue, updateNode]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      updateNode(newValue, localChecked);
    },
    [updateNode, localChecked]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();

        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if (node && $isCheckListNode(node)) {
            // If current item is empty, convert to paragraph
            if (localValue.trim() === "") {
              const paragraph = $createParagraphNode();
              paragraph.append($createTextNode(""));
              node.insertAfter(paragraph);
              node.remove();

              // Focus the new paragraph
              setTimeout(() => {
                editor.update(() => {
                  const selection = $getSelection();
                  if ($isRangeSelection(selection)) {
                    selection.focus.set(paragraph.getKey(), 0, "text");
                  }
                });
              }, 0);
            } else {
              // Create new checklist item below
              const newItem = $createCheckListNode("", false);
              node.insertAfter(newItem);

              // Focus the new item
              setTimeout(() => {
                editor.update(() => {
                  const selection = $getSelection();
                  if ($isRangeSelection(selection)) {
                    selection.focus.set(newItem.getKey(), 0, "text");
                  }
                });
              }, 0);
            }
          }
        });
      } else if (e.key === "Backspace" && localValue === "") {
        e.preventDefault();

        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if (node && $isCheckListNode(node)) {
            const prevNode = node.getPreviousSibling();
            if (prevNode && $isCheckListNode(prevNode)) {
              // Merge with previous checklist item
              const prevValue = (prevNode as CheckListNode).getValue();
              const newPrevNode = new CheckListNode(prevValue + " ", (prevNode as CheckListNode).getChecked());
              prevNode.replace(newPrevNode);
              node.remove();

              // Focus the previous item
              setTimeout(() => {
                editor.update(() => {
                  const selection = $getSelection();
                  if ($isRangeSelection(selection)) {
                    selection.focus.set(
                      newPrevNode.getKey(),
                      prevValue.length + 1,
                      "text"
                    );
                  }
                });
              }, 0);
            } else {
              // Convert to paragraph
              const paragraph = $createParagraphNode();
              paragraph.append($createTextNode(""));
              node.insertAfter(paragraph);
              node.remove();

              // Focus the new paragraph
              setTimeout(() => {
                editor.update(() => {
                  const selection = $getSelection();
                  if ($isRangeSelection(selection)) {
                    selection.focus.set(paragraph.getKey(), 0, "text");
                  }
                });
              }, 0);
            }
          }
        });
      }
    },
    [editor, nodeKey, localValue]
  );

  return (
    <div className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors group relative">
      <Checkbox
        checked={localChecked}
        onCheckedChange={handleToggleChecked}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <Input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={`border-0 shadow-none p-0 h-auto text-sm leading-relaxed transition-all duration-200 focus-visible:ring-0 focus-visible:border-0 ${
            localChecked
              ? "line-through text-muted-foreground"
              : "text-foreground"
          }`}
          placeholder="Add a task..."
        />
      </div>
      {/* Plus icon that appears on hover */}
      <button
        type="button"
        className="opacity-0 group-hover:opacity-100 h-6 w-6 rounded border bg-background hover:bg-muted text-sm flex items-center justify-center transition-opacity duration-200 shadow-sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // Create new checklist item below
          editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if (node && $isCheckListNode(node)) {
              const newItem = $createCheckListNode("", false);
              node.insertAfter(newItem);
              
              // Focus the new item
              setTimeout(() => {
                editor.update(() => {
                  const selection = $getSelection();
                  if ($isRangeSelection(selection)) {
                    selection.focus.set(newItem.getKey(), 0, "text");
                  }
                });
              }, 0);
            }
          });
        }}
        aria-label="Add new checklist item"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

export function $createCheckListNode(
  value: string = "",
  checked: boolean = false
): CheckListNode {
  return new CheckListNode(value, checked);
}

export function $isCheckListNode(node: any): node is CheckListNode {
  return node instanceof CheckListNode;
}

