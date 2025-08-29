import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection, $isRangeSelection, $createTextNode } from 'lexical';
import { $createHeadingNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';

interface TitlePlaceholdersProps {
  onTitleChange?: (title: string) => void;
}

export default function SimpleTitlePlaceholder({ onTitleChange }: TitlePlaceholdersProps) {
  const [editor] = useLexicalComposerContext();
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const first = root.getFirstChild();
        
        if (first && first.getType() === 'heading') {
          const textContent = first.getTextContent();
          const hasContent = textContent.trim().length > 0;
          
          setShowPlaceholder(!hasContent);
          
          // Call the title change callback if provided
          if (onTitleChange && hasContent) {
            onTitleChange(textContent.trim());
          }
        } else {
          setShowPlaceholder(true);
        }
      });
    });
  }, [editor, onTitleChange]);

  const handlePlaceholderClick = () => {
    editor.update(() => {
      const root = $getRoot();
      const first = root.getFirstChild();
      
      if (!first) {
        // Create H1 if no content exists
        const heading = $createHeadingNode('h1');
        const textNode = $createTextNode('');
        heading.append(textNode);
        root.append(heading);
        
        // Set selection to the text node
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.setTextNodeRange(textNode, 0, textNode, 0);
        }
      } else {
        // Ensure first block is H1
        if ((first as any).getType?.() !== 'heading') {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode('h1'));
          }
        }
        
        // Position cursor at the beginning of the first block
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const firstChild = (first as any).getFirstChild?.();
          if (firstChild) {
            selection.setTextNodeRange(firstChild, 0, firstChild, 0);
          }
        }
      }
    });
    
    // Focus the editor after updating
    setTimeout(() => {
      editor.focus();
    }, 0);
  };

  if (!showPlaceholder) return null;

  return (
    <div
      className="absolute left-2 top-4 cursor-text z-10"
      onClick={handlePlaceholderClick}
    >
      <div className="text-6xl font-bold text-muted-foreground">New page</div>
    </div>
  );
}

export function TitlePolicyPlugin() {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    return editor.registerUpdateListener(() => {
      editor.update(() => {
        const root = $getRoot();
        const first = root.getFirstChild();
        
        if (!first) {
          // Create an empty H1 if no content exists
          const heading = $createHeadingNode('h1');
          root.append(heading);
        } else if ((first as any).getType?.() !== 'heading') {
          // If first block is not a heading, convert it to H1
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode('h1'));
          }
        }
      });
    });
  }, [editor]);
  
  return null;
}


