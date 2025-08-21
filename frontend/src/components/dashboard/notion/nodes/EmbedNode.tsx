import { DecoratorNode, type EditorConfig, type LexicalEditor, type NodeKey } from "lexical";
import type { ReactElement } from "react";

type EmbedPayload = { url: string };

export const INSERT_EMBED_COMMAND = "custom-insert-embed" as any;

function getEmbedHTML(url: string): ReactElement {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      const id = u.searchParams.get("v") || u.pathname.replace("/", "");
      return (
        <iframe
          className="w-full aspect-video rounded border"
          src={`https://www.youtube.com/embed/${id}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    if (u.hostname.includes("twitter.com")) {
      return <a href={url} className="text-blue-600 underline" target="_blank" rel="noreferrer">{url}</a>;
    }
    // Fallback generic embed link
    return <a href={url} className="text-blue-600 underline" target="_blank" rel="noreferrer">{url}</a>;
  } catch {
    return <a href={url} className="text-blue-600 underline" target="_blank" rel="noreferrer">{url}</a>;
  }
}

export class EmbedNode extends DecoratorNode<ReactElement> {
  __url: string;

  static getType(): string {
    return "embed";
  }

  static clone(node: EmbedNode): EmbedNode {
    return new EmbedNode(node.__url, node.__key);
  }

  constructor(url: string, key?: NodeKey) {
    super(key);
    this.__url = url;
  }

  createDOM(): HTMLElement {
    const span = document.createElement("span");
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  exportJSON() {
    return { type: "embed", version: 1, url: this.__url };
  }

  static importJSON(serialized: any) {
    return new EmbedNode(serialized.url);
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return (
      <div className="my-2">{getEmbedHTML(this.__url)}</div>
    );
  }
}

export function $createEmbedNode({ url }: EmbedPayload) {
  return new EmbedNode(url);
}


