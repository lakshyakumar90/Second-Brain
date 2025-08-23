import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";

import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { $getRoot, $createParagraphNode, $createTextNode, COMMAND_PRIORITY_LOW, KEY_DOWN_COMMAND, SELECTION_CHANGE_COMMAND, $insertNodes, $getSelection, $isRangeSelection, $isTextNode, type TextNode } from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { HeadingNode, QuoteNode, $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode, INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { CodeNode, $createCodeNode } from "@lexical/code";
import { TRANSFORMERS } from "@lexical/markdown";
import { ImageNode, $createImageNode } from "./nodes/ImageNode.tsx";
import { EmbedNode, $createEmbedNode } from "./nodes/EmbedNode.tsx";
import { DividerNode, $createDividerNode } from "./nodes/DividerNode.tsx";
import { CheckListNode, $createCheckListNode } from "./nodes/CheckListNode.tsx";
import { TableNode, $createTableNode } from "./nodes/TableNode.tsx";
import BubbleToolbar from "./plugins/BubbleToolbar";
// import DraggableBlocks from "./plugins/DraggableBlocks";
import ColumnsPlugin from "./plugins/ColumnsPlugin";
import SimpleTitlePlaceholder, { TitlePolicyPlugin } from "./plugins/TitlePlaceholders";
import ChecklistMarkdownPlugin from "./plugins/ChecklistMarkdownPlugin";
import BlockInsertionPlugin from "./plugins/BlockInsertionPlugin";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


type NotionEditorProps = {
  initialTitle?: string;
  onChange?: (data: { content: string; editorState: any }) => void;
  initialEditorState?: any;
};

const theme = {
  paragraph: "text-foreground group relative",
  quote: "border-l-4 border-muted pl-4 text-muted-foreground group relative",
  heading: {
    h1: "text-6xl font-bold mt-4 mb-2 group relative",
    h2: "text-2xl font-semibold mt-3 mb-2 group relative",
    h3: "text-xl font-semibold mt-2 mb-2 group relative",
  },
  list: {
    ul: "list-disc pl-6",
    ol: "list-decimal pl-6",
    listitem: "my-1 group relative",
  },
  code: "block w-full rounded-md bg-muted p-3 font-mono text-sm overflow-x-auto group relative",
  link: "text-blue-600 hover:underline",
  checklist: "flex items-start gap-3 p-2 rounded hover:bg-muted/50 transition-colors group relative",
};

type MenuItem = {
  key: string;
  title: string;
  shortcut?: string;
  onSelect: () => void;
};

function useSlashMenu(getItems: () => MenuItem[]): {
  open: boolean;
  query: string;
  x: number;
  y: number;
  items: MenuItem[];
  openAtCaret: (initialQuery?: string, removeSlashOnPick?: boolean) => void;
  openAt: (x: number, y: number, removeSlashOnPick?: boolean) => void;
  close: () => void;
  setQuery: (q: string) => void;
  popupRef: React.RefObject<HTMLDivElement | null>;
  lastSlashShouldRemoveRef: React.MutableRefObject<boolean>;
} {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement | null>(null);
  const lastSlashShouldRemoveRef = useRef<boolean>(false);

  const openAt = (x: number, y: number, removeSlashOnPick: boolean = false) => {
    setCoords({ x, y });
    setOpen(true);
    setQuery("");
    lastSlashShouldRemoveRef.current = removeSlashOnPick;
  };

  const openAtCaret = (initialQuery: string = "", removeSlashOnPick: boolean = false) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      openAt(window.innerWidth / 2 - 160, window.scrollY + 100, removeSlashOnPick);
      return;
    }
    const range = sel.getRangeAt(0).cloneRange();
    if (range.collapsed) {
      const dummy = document.createElement("span");
      dummy.textContent = "\u200b"; // zero-width space
      range.insertNode(dummy);
      const rect = dummy.getBoundingClientRect();
      const menuWidth = 320;
      const x = Math.min(Math.max(8, rect.left), window.innerWidth - menuWidth - 8);
      setCoords({ x, y: rect.bottom + window.scrollY });
      dummy.remove();
    } else {
      const rect = range.getBoundingClientRect();
      const menuWidth = 320;
      const x = Math.min(Math.max(8, rect.left), window.innerWidth - menuWidth - 8);
      setCoords({ x, y: rect.bottom + window.scrollY });
    }
    setOpen(true);
    setQuery(initialQuery);
    lastSlashShouldRemoveRef.current = removeSlashOnPick;
  };

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const items = useMemo(() => {
    const all = getItems();
    if (!query) return all;
    const q = query.toLowerCase();
    return all.filter((i) => i.title.toLowerCase().includes(q));
  }, [getItems, query]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popupRef.current && popupRef.current.contains(target)) return;
      close();
    };
    document.addEventListener('mousedown', onDown, true);
    return () => document.removeEventListener('mousedown', onDown, true);
  }, []);

  return { open, query, x: coords.x, y: coords.y, items, openAtCaret, openAt, close, setQuery, popupRef, lastSlashShouldRemoveRef };
}

function SlashMenu({
  open,
  x,
  y,
  items,
  query,
  onQueryChange,
  onClose,
  popupRef,
}: {
  open: boolean;
  x: number;
  y: number;
  items: MenuItem[];
  query: string;
  onQueryChange: (q: string) => void;
  onClose: () => void;
  popupRef: React.RefObject<HTMLDivElement | null>;
}) {
  if (!open) return null;
  return createPortal(
    <div
      ref={popupRef}
      style={{ top: y + 8, left: x }}
      className="absolute z-50 w-80 rounded-lg border bg-background shadow-xl"
    >
      <div className="p-2 border-b">
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full px-2 py-1 text-sm outline-none bg-transparent"
          placeholder="Search for a block..."
        />
      </div>
      <div className="max-h-80 overflow-auto py-1">
        {items
          .filter((item) => 
            query === "" || 
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.key.toLowerCase().includes(query.toLowerCase())
          )
          .map((item) => (
            <button
              key={item.key}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                item.onSelect();
                onClose();
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
            >
              {item.title}
              {item.shortcut && (
                <span className="float-right text-xs text-muted-foreground">{item.shortcut}</span>
              )}
            </button>
          ))}
        {items.filter((item) => 
          query === "" || 
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.key.toLowerCase().includes(query.toLowerCase())
        ).length === 0 && (
          <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default function NotionEditor({ 
  initialTitle = "Untitled", 
  onChange, 
  initialEditorState
}: NotionEditorProps) {
  const initialConfig = useMemo(
    () => ({
      namespace: "notion-editor",
      theme,
      onError: (e: unknown) => console.error(e),
      nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, CodeNode, TableNode, DividerNode, CheckListNode, ImageNode, EmbedNode],
      editorState: (editor: any) => {
        if (initialEditorState) {
          try {
            const state = editor.parseEditorState(initialEditorState);
            editor.setEditorState(state);
            return;
          } catch {}
        }
        editor.update(() => {
          const root = $getRoot();
          root.clear();
        });
      },
    }), [initialTitle, initialEditorState]
  );

  const [editorRef, setEditorRef] = useState<any>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);
  const isLargeSelectionRef = useRef<boolean>(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");

  function getEmbedPreview(url: string) {
    if (!url) return null;
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
        const id = u.searchParams.get("v") || u.pathname.replace("/", "");
        return (
          <iframe
            className="w-full aspect-video rounded border"
            title="Embed preview"
            src={`https://www.youtube.com/embed/${id}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }
      return (
        <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">
          {url}
        </a>
      );
    } catch {
      return (
        <span className="text-sm text-muted-foreground">Enter a valid URL to preview</span>
      );
    }
  }

  // Slash menu state
  const slash = useSlashMenu(() => {
    const editor = editorRef;
    if (!editor) return [];
    const items: MenuItem[] = [
      { key: "p", title: "Text", onSelect: () => onPickSlash(editor, slash.lastSlashShouldRemoveRef.current, () => insertParagraph(editor)) },
      { key: "h1", title: "Heading 1", onSelect: () => onPickSlash(editor, slash.lastSlashShouldRemoveRef.current, () => insertHeading(editor, 1)) },
      { key: "h2", title: "Heading 2", onSelect: () => onPickSlash(editor, slash.lastSlashShouldRemoveRef.current, () => insertHeading(editor, 2)) },
      { key: "h3", title: "Heading 3", onSelect: () => onPickSlash(editor, slash.lastSlashShouldRemoveRef.current, () => insertHeading(editor, 3)) },
      { key: "ul", title: "Bullet list", onSelect: () => onPickSlash(editor, slash.lastSlashShouldRemoveRef.current, () => insertList(editor, "bullet")) },
      { key: "ol", title: "Numbered list", onSelect: () => onPickSlash(editor, slash.lastSlashShouldRemoveRef.current, () => insertList(editor, "number")) },
      { key: "check", title: "Checklist", onSelect: () => onPickSlash(editor, slash.lastSlashShouldRemoveRef.current, () => insertList(editor, "check")) },
      { key: "quote", title: "Quote", onSelect: () => onPickSlash(editor, slash.lastSlashShouldRemoveRef.current, () => insertQuote(editor)) },
      { key: "code", title: "Code block", onSelect: () => onPickSlash(editor, slash.lastSlashShouldRemoveRef.current, () => insertCodeBlock(editor)) },
      { key: "divider", title: "Divider", onSelect: () => onPickSlash(editor, slash.lastSlashShouldRemoveRef.current, () => insertDivider(editor)) },
      { key: "image", title: "Image", onSelect: () => onPickSlash(editor, slash.lastSlashShouldRemoveRef.current, () => triggerImageUpload(editor)) },
      { key: "table", title: "Table", onSelect: () => onPickSlash(editor, slash.lastSlashShouldRemoveRef.current, () => insertTable(editor)) },
      { key: "callout", title: "Callout", onSelect: () => onPickSlash(editor, slash.lastSlashShouldRemoveRef.current, () => insertCallout(editor)) },
      { key: "embed", title: "Embed (URL)", onSelect: () => {
          const removeSlash = slash.lastSlashShouldRemoveRef.current;
          onPickSlash(editor, removeSlash, () => {});
          setEmbedOpen(true);
        }
      },
    ];
    return items;
  });

  // When a slash item is picked, optionally remove the leading '/'
  function onPickSlash(editor: any, removeSlash: boolean | undefined, action: () => void) {
    editor.update(() => {
      if (removeSlash) {
        const sel = $getSelection();
        if ($isRangeSelection(sel)) {
          // Move one char back if the slash still exists just before caret
          const anchor = sel.anchor;
          const node = anchor.getNode();
          if ($isTextNode(node)) {
            const text = (node as TextNode).getTextContent();
          const offset = anchor.offset;
            if (offset > 0 && text[offset - 1] === '/') {
              (node as TextNode).spliceText(offset - 1, 1, "");
            }
          }
        }
      }
      action();
    });
  }

  // Show slash menu when user types '/'
  const onKey = useCallback((event: KeyboardEvent) => {
    if (event.key === "/") {
      slash.openAtCaret("", true);
      return true;
    }
    
    // Handle Ctrl+A specifically to prevent performance issues
    if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
      // Set flag to indicate large selection is happening
      isLargeSelectionRef.current = true;
      // Reset flag after a short delay
      setTimeout(() => {
        isLargeSelectionRef.current = false;
      }, 100);
      // Let the default behavior happen, but we'll handle the performance in the update listeners
      return false;
    }
    
    return false;
  }, [slash]);

  const onSelectionChange = useCallback(() => {
    // Check if we're in a large selection and skip expensive operations
    if (isLargeSelectionRef.current) {
      return true; // Prevent further processing
    }
    
    // Check selection size and skip if too large
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const content = range.toString();
      if (content.length > 1000) {
        return true; // Skip processing for large selections
      }
    }
    
    return false;
  }, []);

  const handleChange = (editorState: any, editor: any) => {
    if (!onChange) return;
    try {
      const json = editorState.toJSON();
      let plain = '';
      editor.read(() => {
        const root = $getRoot();
        plain = root.getTextContent();
      });
      onChange({ content: plain, editorState: json });
    } catch {}
  };
  // Ensure first block becomes H1 on initial typing
  useEffect(() => {
    if (!editorRef) return;
    const editor = editorRef;
    const unregister = editor.registerTextContentListener(() => {
      editor.update(() => {
        const root = $getRoot();
        const first = root.getFirstChild();
        if (!first) return;
        const text = first.getTextContent?.() ?? "";
        // If first node has content and is not heading, set to H1 once
        if (text.length > 0 && (first as any).getType && (first as any).getType() !== 'heading') {
          const sel = $getSelection();
          if ($isRangeSelection(sel)) {
            $setBlocksType(sel, () => $createHeadingNode('h1' as any));
          }
        }
      });
    });
    return () => unregister();
  }, [editorRef]);

  return (
    <div className="relative">
      <LexicalComposer initialConfig={initialConfig}>
        <div ref={composerRef}>
          <div className="relative">
            <RichTextPlugin
              contentEditable={<ContentEditable className="min-h-[60vh] py-6 outline-none overflow-y-auto [&>*]:group" />}
              placeholder={null}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <ListPlugin />
            <LinkPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <ChecklistMarkdownPlugin />
            <OnChangePlugin onChange={handleChange} />
            {/* Key listener for '/' */}
            <KeyHandler onKey={onKey} onSelectionChange={onSelectionChange} setEditorRef={setEditorRef} />
            <UploaderPlugins />
            <BlockInsertionPlugin />
            <BubbleToolbar />
            {/* Dragging disabled per request */}
            <ColumnsPlugin />
            <SimpleTitlePlaceholder />
            <TitlePolicyPlugin />

          </div>
        </div>
        <SlashMenu
          open={slash.open}
          x={slash.x}
          y={slash.y}
          items={slash.items}
          query={slash.query}
          onQueryChange={slash.setQuery}
          onClose={slash.close}
          popupRef={slash.popupRef}
        />
      </LexicalComposer>

      {/* Embed Dialog */}
      <Dialog open={embedOpen} onOpenChange={setEmbedOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Embed URL</DialogTitle>
            <DialogDescription>Paste a URL to preview it before inserting into the document.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="https://..."
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
            />
            <div className="border rounded-md p-2 min-h-20">
              {getEmbedPreview(embedUrl)}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEmbedOpen(false);
                setEmbedUrl("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const url = embedUrl.trim();
                if (!url) return;
                const ed = editorRef;
                if (!ed) return;
                ed.update(() => {
                  $insertNodes([$createEmbedNode({ url })]);
                });
                setEmbedOpen(false);
                setEmbedUrl("");
              }}
            >
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KeyHandler({ onKey, onSelectionChange, setEditorRef }: { onKey: (e: KeyboardEvent) => boolean; onSelectionChange: () => boolean; setEditorRef: (e: any) => void; }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    setEditorRef(editor);
    return editor.registerCommand(KEY_DOWN_COMMAND, (payload: KeyboardEvent) => onKey(payload), COMMAND_PRIORITY_LOW);
  }, [editor, onKey, setEditorRef]);
  useEffect(() => editor.registerCommand(SELECTION_CHANGE_COMMAND, onSelectionChange, COMMAND_PRIORITY_LOW), [editor, onSelectionChange]);
  return null;
}

function triggerImageUpload(editor: any) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      editor.update(() => {
        $insertNodes([$createImageNode({ src: url, alt: file.name })]);
      });
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function insertTable(editor: any) {
  editor.update(() => {
    $insertNodes([$createTableNode(4, 3)]);
  });
}

// Legacy prompt-based embed disabled in favor of dialog

// Voice input removed per design

function UploaderPlugins() {
  // Placeholder for future upload drop handlers
  return null;
}



// Insert helpers using Lexical API
function insertParagraph(editor: any) {
  editor.update(() => {
    const p = $createParagraphNode();
    p.append($createTextNode(""));
    $insertNodes([p]);
  });
}

function insertHeading(editor: any, level: 1 | 2 | 3) {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    const tag = (level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3') as any;
    $setBlocksType(selection, () => $createHeadingNode(tag));
  });
}

function insertList(editor: any, type: "bullet" | "number" | "check") {
  editor.update(() => {
    if (type === "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined as any);
    } else if (type === "check") {
      $insertNodes([$createCheckListNode("", false)]);
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined as any);
    }
  });
}

function insertQuote(editor: any) {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    $setBlocksType(selection, () => $createQuoteNode());
  });
}

function insertCodeBlock(editor: any) {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    const code = $createCodeNode("javascript");
    $setBlocksType(selection, () => code);
  });
}

function insertDivider(editor: any) {
  editor.update(() => {
    $insertNodes([$createDividerNode()]);
  });
}

function insertCallout(editor: any) {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    $setBlocksType(selection, () => $createQuoteNode());
    const p = $createParagraphNode();
    p.append($createTextNode("💡  "));
    $insertNodes([p]);
  });
}






