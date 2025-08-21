import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

// Minimal multi-column: wraps selected content into columns via CSS grid
export default function ColumnsPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // This plugin exposes a simple global for quick testing
    (window as any).makeTwoColumns = () => {
      editor.update(() => {
        const container = document.querySelector('[contenteditable="true"]') as HTMLElement | null;
        if (!container) return;
        container.style.display = 'grid';
        container.style.gridTemplateColumns = '1fr 1fr';
        container.style.gap = '16px';
      });
    };
    (window as any).makeOneColumn = () => {
      editor.update(() => {
        const container = document.querySelector('[contenteditable="true"]') as HTMLElement | null;
        if (!container) return;
        container.style.display = '';
        container.style.gridTemplateColumns = '';
        container.style.gap = '';
      });
    };
  }, [editor]);

  return null;
}


