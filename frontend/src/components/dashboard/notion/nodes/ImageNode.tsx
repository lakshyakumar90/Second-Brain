import { DecoratorNode, type EditorConfig, type LexicalEditor, type NodeKey } from "lexical";
import type { ReactElement } from "react";

type ImagePayload = { src: string; alt?: string };

export const INSERT_IMAGE_COMMAND = "custom-insert-image" as any;

export class ImageNode extends DecoratorNode<ReactElement> {
  __src: string;
  __alt?: string;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__alt, node.__key);
  }

  constructor(src: string, alt?: string, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__alt = alt;
  }

  createDOM(): HTMLElement {
    const span = document.createElement("span");
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  exportJSON() {
    return { type: "image", version: 1, src: this.__src, alt: this.__alt };
  }

  static importJSON(serialized: any) {
    return new ImageNode(serialized.src, serialized.alt);
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return (
      <img
        src={this.__src}
        alt={this.__alt}
        className="max-w-full rounded border"
        draggable={false}
      />
    );
  }
}

export function $createImageNode({ src, alt }: ImagePayload) {
  return new ImageNode(src, alt);
}


