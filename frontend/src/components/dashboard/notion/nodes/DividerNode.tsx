import type { NodeKey, SerializedLexicalNode, Spread } from "lexical";
import { DecoratorNode } from "lexical";
import React from "react";

export type SerializedDividerNode = Spread<{}, SerializedLexicalNode>;

export class DividerNode extends DecoratorNode<React.ReactElement> {
  static getType(): string {
    return "divider";
  }

  static clone(node: DividerNode): DividerNode {
    return new DividerNode(node.__key);
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "divider-container";
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  static importJSON(): DividerNode {
    return $createDividerNode();
  }

  exportJSON(): SerializedDividerNode {
    return {
      ...super.exportJSON(),
      type: "divider",
      version: 1,
    };
  }

  decorate(): React.ReactElement {
    return (
      <div className="my-4 flex items-center">
        <div className="flex-1 border-t border-border"></div>
        <div className="mx-4 text-muted-foreground text-xs">•</div>
        <div className="flex-1 border-t border-border"></div>
      </div>
    );
  }
}

export function $createDividerNode(): DividerNode {
  return new DividerNode();
}

export function $isDividerNode(node: any): node is DividerNode {
  return node instanceof DividerNode;
}
