import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey } from "lexical";

// Minimal block drag-and-drop: uses native HTML5 DnD on block containers
export default function DraggableBlocks() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const container = document.querySelector('[contenteditable="true"]');
    if (!container) return;

    const onDragStart = (e: any) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const key = target.getAttribute('data-lexical-node-key');
      if (!key) return;
      e.dataTransfer?.setData('text/plain', key);
      e.dataTransfer?.setDragImage(target, 0, 0);
    };
    const onDragOver = (e: any) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    };
    const onDrop = (e: any) => {
      e.preventDefault();
      const srcKey = e.dataTransfer?.getData('text/plain');
      if (!srcKey) return;
      const target = e.target as HTMLElement;
      const block = target.closest('[data-lexical-node-key]') as HTMLElement | null;
      if (!block) return;
      const dstKey = block.getAttribute('data-lexical-node-key');
      if (!dstKey || dstKey === srcKey) return;
      const rect = block.getBoundingClientRect();
      const before = e.clientY < rect.top + rect.height / 2;
      editor.update(() => {
        const src = $getNodeByKey(srcKey);
        const dst = $getNodeByKey(dstKey);
        if (!src || !dst) return;
        // Move top-level elements
        const srcTop = (src as any).getTopLevelElementOrThrow ? (src as any).getTopLevelElementOrThrow() : src;
        const dstTop = (dst as any).getTopLevelElementOrThrow ? (dst as any).getTopLevelElementOrThrow() : dst;
        if (before) {
          dstTop.insertBefore(srcTop);
        } else {
          dstTop.insertAfter(srcTop);
        }
      });
    };

    (container as any).addEventListener('dragstart', onDragStart as any, true);
    (container as any).addEventListener('dragover', onDragOver as any, true);
    (container as any).addEventListener('drop', onDrop as any, true);
    return () => {
      (container as any).removeEventListener('dragstart', onDragStart as any, true);
      (container as any).removeEventListener('dragover', onDragOver as any, true);
      (container as any).removeEventListener('drop', onDrop as any, true);
    };
  }, [editor]);

  return null;
}


