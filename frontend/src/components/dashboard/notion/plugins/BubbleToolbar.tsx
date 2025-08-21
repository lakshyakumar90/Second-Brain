import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from "lexical";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";

export default function BubbleToolbar() {
  const [editor] = useLexicalComposerContext();
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || selection.isCollapsed()) {
          setCoords(null);
          return;
        }
        const domSelection = window.getSelection();
        if (!domSelection || domSelection.rangeCount === 0) {
          setCoords(null);
          return;
        }
        const range = domSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setCoords({ x: rect.left + rect.width / 2, y: rect.top + window.scrollY - 8 });
      });
    });
  }, [editor]);

  if (!coords) return null;
  return createPortal(
    <div
      ref={container}
      className="absolute z-50 -translate-x-1/2"
      style={{ left: coords.x, top: coords.y }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="rounded-md border bg-background shadow-md px-1 py-0.5 flex items-center gap-0.5">
        <ToolbarButton onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}>B</ToolbarButton>
        <ToolbarButton onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}><i>I</i></ToolbarButton>
        <ToolbarButton onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}>U</ToolbarButton>
        <ToolbarButton onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}><s>S</s></ToolbarButton>
        <ToolbarButton onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}><code>{"</>"}</code></ToolbarButton>
        <ToolbarButton onClick={() => {
          const url = prompt("Enter URL");
          if (url) editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
        }}>Link</ToolbarButton>
      </div>
    </div>,
    document.body
  );
}

function ToolbarButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm px-1.5 py-0.5 rounded hover:bg-muted"
    >
      {children}
    </button>
  );
}


