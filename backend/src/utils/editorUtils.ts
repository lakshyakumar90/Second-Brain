interface LexicalNode {
  type: string;
  children?: LexicalNode[];
  text?: string;
  format?: number;
  [key: string]: any;
}

interface LexicalEditorState {
  root: {
    children: LexicalNode[];
    [key: string]: any;
  };
}

interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
  attrs?: Record<string, any>;
  marks?: Array<{ type: string; attrs?: Record<string, any> }>;
}

interface TipTapDocument {
  type: 'doc';
  content?: TipTapNode[];
}

/**
 * Extracts plain text content from Lexical editor state
 * @param editorState - The Lexical editor state object
 * @returns Plain text string extracted from the editor state
 */
export function extractPlainTextFromEditorState(editorState: LexicalEditorState | null): string {
  if (!editorState || !editorState.root || !editorState.root.children) {
    return '';
  }

  const extractTextFromNode = (node: LexicalNode): string => {
    let text = '';

    // Handle text nodes
    if (node.text) {
      text += node.text;
    }

    // Handle nodes with children (recursive)
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        text += extractTextFromNode(child);
      }
    }

    // Add line breaks for block-level elements
    if (isBlockElement(node.type)) {
      text += '\n';
    }

    return text;
  };

  // Process all root children
  let plainText = '';
  for (const node of editorState.root.children) {
    plainText += extractTextFromNode(node);
  }

  // Clean up extra whitespace and normalize line breaks
  return plainText
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple line breaks with double line breaks
    .replace(/\n+$/, '') // Remove trailing line breaks
    .trim();
}

/**
 * Determines if a node type is a block-level element
 * @param nodeType - The type of the Lexical node
 * @returns True if the node is a block element
 */
function isBlockElement(nodeType: string): boolean {
  const blockElements = [
    'paragraph',
    'heading',
    'list',
    'listitem',
    'quote',
    'code',
    'table',
    'tablecell',
    'tablerow',
    'divider',
    'image',
    'video',
    'embed'
  ];
  
  return blockElements.includes(nodeType);
}

/**
 * Extracts plain text content from TipTap JSON document
 * @param document - The TipTap document object
 * @returns Plain text string extracted from the document
 */
export function extractPlainTextFromTipTap(document: TipTapDocument | null): string {
  if (!document || !document.content) {
    return '';
  }

  const extractTextFromNode = (node: TipTapNode): string => {
    let text = '';

    // Handle text nodes
    if (node.type === 'text' && node.text) {
      text += node.text;
    }

    // Handle nodes with content (recursive)
    if (node.content && Array.isArray(node.content)) {
      for (const child of node.content) {
        text += extractTextFromNode(child);
      }
    }

    // Add appropriate spacing/line breaks for block-level elements
    if (isTipTapBlockElement(node.type)) {
      text += '\n';
    } else if (node.type === 'hardBreak') {
      text += '\n';
    }

    return text;
  };

  // Process all document content
  let plainText = '';
  for (const node of document.content) {
    plainText += extractTextFromNode(node);
  }

  // Clean up extra whitespace and normalize line breaks
  return plainText
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple line breaks with double line breaks
    .replace(/\n+$/, '') // Remove trailing line breaks
    .trim();
}

/**
 * Determines if a TipTap node type is a block-level element
 * @param nodeType - The type of the TipTap node
 * @returns True if the node is a block element
 */
function isTipTapBlockElement(nodeType: string): boolean {
  const blockElements = [
    'paragraph',
    'heading',
    'bulletList',
    'orderedList',
    'listItem',
    'blockquote',
    'codeBlock',
    'horizontalRule',
    'table',
    'tableRow',
    'tableCell',
    'tableHeader',
    'taskList',
    'taskItem'
  ];
  
  return blockElements.includes(nodeType);
}

/**
 * Generates a summary from plain text content
 * @param content - Plain text content
 * @param maxLength - Maximum length of summary (default: 200 characters)
 * @returns Summary string
 */
export function generateSummary(content: string, maxLength: number = 200): string {
  if (!content || content.length <= maxLength) {
    return content;
  }

  // Find the last complete sentence within the limit
  const truncated = content.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?'),
    truncated.lastIndexOf('\n')
  );

  if (lastSentenceEnd > maxLength * 0.7) { // If we can find a sentence end in the last 30%
    return content.substring(0, lastSentenceEnd + 1).trim();
  }

  // Otherwise, just truncate and add ellipsis
  return truncated.trim() + '...';
}
