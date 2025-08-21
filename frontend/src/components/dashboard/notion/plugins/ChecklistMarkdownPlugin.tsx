import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, $isTextNode } from "lexical";
import { $createCheckListNode } from "../nodes/CheckListNode";

export default function ChecklistMarkdownPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        const anchor = selection.anchor;
        const anchorNode = anchor.getNode();
        if (!$isTextNode(anchorNode)) return;

        const textContent = anchorNode.getTextContent();
        const offset = anchor.offset;

        // Check for checklist patterns
        const checklistPatterns = [
          /^- \[ \] (.+)$/, // - [ ] task
          /^- \[x\] (.+)$/i, // - [x] completed task
          /^- \[X\] (.+)$/, // - [X] completed task
        ];

        for (const pattern of checklistPatterns) {
          const match = textContent.match(pattern);
          if (match && offset >= textContent.length) {
            const isChecked = /\[x\]/i.test(match[0]);
            const taskText = match[1];

            editor.update(() => {
              // Remove the markdown text
              anchorNode.remove();
              
              // Create checklist item
              const checklistItem = $createCheckListNode(taskText, isChecked);
              
              // Insert the checklist item
              const parent = anchorNode.getParent();
              if (parent) {
                parent.insertAfter(checklistItem);
              }
            });
            return;
          }
        }
      });
    });
  }, [editor]);

  return null;
}
