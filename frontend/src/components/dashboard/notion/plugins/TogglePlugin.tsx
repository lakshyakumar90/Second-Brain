import { useEffect } from "react";
import { $getSelection, $isRangeSelection, $createParagraphNode, $createTextNode, $insertNodes } from "lexical";

export default function TogglePlugin() {
  useEffect(() => {
    // Add CSS for Notion-like toggle and sub-page blocks
    const style = document.createElement('style');
    style.textContent = `
      .notion-toggle-block {
        position: relative;
        margin: 0.25rem 0;
        cursor: pointer;
        user-select: none;
        font-size: 0.875rem;
        line-height: 1.25rem;
        padding: 0.25rem 0;
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
      }
      
      .notion-toggle-block:hover {
        background-color: var(--muted/20);
        border-radius: 0.25rem;
      }
      
      .notion-toggle-line {
        width: 1px;
        background-color: var(--border);
        min-height: 1.5rem;
        flex-shrink: 0;
      }
      
      .notion-toggle-header {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        flex: 1;
      }
      
      .notion-toggle-icon {
        cursor: pointer;
        font-size: 0.75rem;
        color: var(--foreground);
        transition: transform 0.15s;
        flex-shrink: 0;
      }
      
      .notion-toggle-content {
        margin-left: 1.5rem;
        margin-top: 0.25rem;
        transition: all 0.15s;
        padding-left: 0.5rem;
        border-left: 1px solid var(--border);
        flex: 1;
      }
      
      .notion-toggle-content.collapsed {
        display: none;
      }
      
      .notion-subpage-block {
        position: relative;
        margin: 0.5rem 0;
        padding: 0.5rem;
        border: 1px solid var(--border);
        border-radius: 0.375rem;
        background-color: var(--card);
        transition: all 0.15s;
      }
      
      .notion-subpage-block:hover {
        border-color: var(--primary);
        box-shadow: 0 0 0 1px var(--primary);
      }
      
      .notion-subpage-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
      }
      
      .notion-subpage-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        color: var(--primary);
      }
      
      .notion-subpage-title {
        flex: 1;
        font-weight: 500;
        color: var(--foreground);
      }
      
      .notion-subpage-actions {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        opacity: 0;
        transition: opacity 0.15s;
      }
      
      .notion-subpage-block:hover .notion-subpage-actions {
        opacity: 1;
      }
      
      .notion-subpage-action {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 0.25rem;
        color: var(--muted-foreground);
        transition: all 0.15s;
        background: none;
        border: none;
        cursor: pointer;
      }
      
      .notion-subpage-action:hover {
        background-color: var(--muted);
        color: var(--foreground);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
}

// Helper function to create toggle blocks
export function createToggleBlock(editor: any, title: string = "Toggle") {
  console.log("createToggleBlock called with title:", title);
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    // Create a paragraph node and insert it
    const paragraph = $createParagraphNode();
    const textNode = $createTextNode(title);
    paragraph.append(textNode);
    $insertNodes([paragraph]);

    // After the node is inserted, we'll add the toggle functionality to the DOM
    setTimeout(() => {
      const editorElement = editor.getRootElement();
      if (editorElement) {
        const lastParagraph = editorElement.querySelector('p:last-child');
        if (lastParagraph) {
          const blockId = `toggle_${Date.now()}`;
          
          // Clear the paragraph and create proper toggle structure
          lastParagraph.innerHTML = '';
          lastParagraph.classList.add('notion-toggle-block');
          lastParagraph.setAttribute('data-block-id', blockId);
          
          // Create the vertical line
          const toggleLine = document.createElement('div');
          toggleLine.className = 'notion-toggle-line';
          lastParagraph.appendChild(toggleLine);
          
          // Create the toggle header
          const toggleHeader = document.createElement('div');
          toggleHeader.className = 'notion-toggle-header';
          
          // Create the toggle icon
          const toggleIcon = document.createElement('span');
          toggleIcon.className = 'notion-toggle-icon';
          toggleIcon.textContent = '▼';
          toggleHeader.appendChild(toggleIcon);
          
          // Create the toggle title
          const toggleTitle = document.createElement('span');
          toggleTitle.textContent = title;
          toggleHeader.appendChild(toggleTitle);
          
          lastParagraph.appendChild(toggleHeader);
          
          // Create the toggle content div
          const toggleContent = document.createElement('div');
          toggleContent.className = 'notion-toggle-content';
          toggleContent.innerHTML = '<p>Click to expand/collapse this content.</p>';
          lastParagraph.appendChild(toggleContent);

          // Add click handler for the toggle icon
          toggleIcon.addEventListener('click', function(e: any) {
            e.preventDefault();
            e.stopPropagation();
            
            const content = lastParagraph.querySelector('.notion-toggle-content');
            
            if (content) {
              const isCollapsed = content.classList.contains('collapsed');
              
              if (isCollapsed) {
                content.classList.remove('collapsed');
                toggleIcon.textContent = '▼'; // Down arrow for expanded
              } else {
                content.classList.add('collapsed');
                toggleIcon.textContent = '▶'; // Right arrow for collapsed
              }
            }
          });
          
          // Make the paragraph look clickable
          lastParagraph.style.cursor = 'pointer';
          lastParagraph.style.userSelect = 'none';
        }
      }
    }, 0);
  });
}

// Helper function to create sub-page blocks
export function createSubPageBlock(editor: any, title: string = "Untitled page") {
  console.log("createSubPageBlock called with title:", title);
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    // Create a paragraph node and insert it
    const paragraph = $createParagraphNode();
    const textNode = $createTextNode('');
    paragraph.append(textNode);
    $insertNodes([paragraph]);

    // After the node is inserted, we'll add the sub-page HTML to the DOM
    setTimeout(() => {
      const editorElement = editor.getRootElement();
      if (editorElement) {
        const lastParagraph = editorElement.querySelector('p:last-child');
        if (lastParagraph) {
          lastParagraph.innerHTML = `
            <div class="notion-subpage-block">
              <div class="notion-subpage-header">
                <div class="notion-subpage-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                </div>
                <span class="notion-subpage-title">${title}</span>
                <div class="notion-subpage-actions">
                  <button class="notion-subpage-action" title="Create page">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          `;

          // Add click handlers for this specific sub-page
          const subPageBlock = lastParagraph.querySelector('.notion-subpage-block');
          const subPageHeader = lastParagraph.querySelector('.notion-subpage-header');
          const plusButton = lastParagraph.querySelector('.notion-subpage-action');

          if (subPageHeader && plusButton) {
            // Handle clicking the sub-page header (create page)
            subPageHeader.addEventListener('click', function(e: any) {
              if (e.target === plusButton || plusButton.contains(e.target as Node)) {
                return; // Don't create page if clicking the plus button
              }
              
              e.preventDefault();
              e.stopPropagation();
              
              // Create a new page
              const pageId = `page_${Date.now()}`;
              console.log(`Creating new page: ${pageId}`);
              
              // Update the sub-page to show it's created
              const actions = subPageBlock?.querySelector('.notion-subpage-actions');
              if (actions) {
                actions.innerHTML = `
                  <button class="notion-subpage-action" title="Open page">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15,3 21,3 21,9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </button>
                `;
                
                // Add click handler for the new external link button
                const newButton = actions.querySelector('.notion-subpage-action');
                if (newButton) {
                  newButton.addEventListener('click', function(e: any) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`Opening page: ${pageId}`);
                  });
                }
              }
            });

            // Handle clicking the plus button specifically
            plusButton.addEventListener('click', function(e: any) {
              e.preventDefault();
              e.stopPropagation();
              
              // Create a new page
              const pageId = `page_${Date.now()}`;
              console.log(`Creating new page: ${pageId}`);
              
              // Update the sub-page to show it's created
              const actions = subPageBlock?.querySelector('.notion-subpage-actions');
              if (actions) {
                actions.innerHTML = `
                  <button class="notion-subpage-action" title="Open page">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15,3 21,3 21,9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </button>
                `;
                
                // Add click handler for the new external link button
                const newButton = actions.querySelector('.notion-subpage-action');
                if (newButton) {
                  newButton.addEventListener('click', function(e: any) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`Opening page: ${pageId}`);
                  });
                }
              }
            });
          }
        }
      }
    }, 0);
  });
}
