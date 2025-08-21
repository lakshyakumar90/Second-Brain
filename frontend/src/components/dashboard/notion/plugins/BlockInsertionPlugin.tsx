import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, $createParagraphNode, $createTextNode } from "lexical";

import { $createHeadingNode } from "@lexical/rich-text";
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from "@lexical/list";
import { $createCodeNode } from "@lexical/code";
import { $createQuoteNode } from "@lexical/rich-text";
import { $createCheckListNode } from "../nodes/CheckListNode";
import { $createDividerNode } from "../nodes/DividerNode";
import { $createImageNode } from "../nodes/ImageNode";
import { $createEmbedNode } from "../nodes/EmbedNode";
import { $createTableNode } from "../nodes/TableNode";
import { Plus, Type, Heading1, Heading2, Heading3, List, CheckSquare, Quote, Code, Minus, Image, Link, Table } from "lucide-react";

type BlockType = {
  key: string;
  title: string;
  icon: React.ReactNode;
  onSelect: () => void;
  shortcut?: string;
};

export default function BlockInsertionPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [currentBlockKey, setCurrentBlockKey] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Block type definitions
  const blockTypes: BlockType[] = [
    {
      key: "text",
      title: "Text",
      icon: <Type className="w-4 h-4" />,
      onSelect: () => insertBlock("text"),
      shortcut: "T",
    },
    {
      key: "h1",
      title: "Heading 1",
      icon: <Heading1 className="w-4 h-4" />,
      onSelect: () => insertBlock("h1"),
      shortcut: "H1",
    },
    {
      key: "h2",
      title: "Heading 2",
      icon: <Heading2 className="w-4 h-4" />,
      onSelect: () => insertBlock("h2"),
      shortcut: "H2",
    },
    {
      key: "h3",
      title: "Heading 3",
      icon: <Heading3 className="w-4 h-4" />,
      onSelect: () => insertBlock("h3"),
      shortcut: "H3",
    },
    {
      key: "bullet",
      title: "Bullet list",
      icon: <List className="w-4 h-4" />,
      onSelect: () => insertBlock("bullet"),
      shortcut: "•",
    },
    {
      key: "number",
      title: "Numbered list",
      icon: <List className="w-4 h-4" />,
      onSelect: () => insertBlock("number"),
      shortcut: "1.",
    },
    {
      key: "checklist",
      title: "Checklist",
      icon: <CheckSquare className="w-4 h-4" />,
      onSelect: () => insertBlock("checklist"),
      shortcut: "☐",
    },
    {
      key: "quote",
      title: "Quote",
      icon: <Quote className="w-4 h-4" />,
      onSelect: () => insertBlock("quote"),
      shortcut: "\"",
    },
    {
      key: "code",
      title: "Code block",
      icon: <Code className="w-4 h-4" />,
      onSelect: () => insertBlock("code"),
      shortcut: "{}",
    },
    {
      key: "divider",
      title: "Divider",
      icon: <Minus className="w-4 h-4" />,
      onSelect: () => insertBlock("divider"),
      shortcut: "---",
    },
    {
      key: "image",
      title: "Image",
      icon: <Image className="w-4 h-4" />,
      onSelect: () => insertBlock("image"),
      shortcut: "📷",
    },
    {
      key: "embed",
      title: "Embed",
      icon: <Link className="w-4 h-4" />,
      onSelect: () => insertBlock("embed"),
      shortcut: "🔗",
    },
    {
      key: "table",
      title: "Table",
      icon: <Table className="w-4 h-4" />,
      onSelect: () => insertBlock("table"),
      shortcut: "⊞",
    },
  ];

  // Insert block function
  const insertBlock = useCallback((type: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      // Get the current block
      const currentNode = selection.anchor.getNode();
      const topLevelElement = currentNode.getTopLevelElement();
      
      if (!topLevelElement) return;

      let newNode;
      
      switch (type) {
        case "text":
          newNode = $createParagraphNode();
          newNode.append($createTextNode(""));
          break;
        case "h1":
          newNode = $createHeadingNode("h1");
          newNode.append($createTextNode(""));
          break;
        case "h2":
          newNode = $createHeadingNode("h2");
          newNode.append($createTextNode(""));
          break;
        case "h3":
          newNode = $createHeadingNode("h3");
          newNode.append($createTextNode(""));
          break;
        case "bullet":
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
          return;
        case "number":
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
          return;
        case "checklist":
          newNode = $createCheckListNode("", false);
          break;
        case "quote":
          newNode = $createQuoteNode();
          newNode.append($createTextNode(""));
          break;
        case "code":
          newNode = $createCodeNode("javascript");
          newNode.append($createTextNode(""));
          break;
        case "divider":
          newNode = $createDividerNode();
          break;
        case "image":
          triggerImageUpload();
          return;
        case "embed":
          triggerEmbedInsert();
          return;
        case "table":
                      newNode = $createTableNode(4, 3);
          break;
        default:
          newNode = $createParagraphNode();
          newNode.append($createTextNode(""));
      }

      // Insert the new node after the current block
      topLevelElement.insertAfter(newNode);

      // Focus the new node
      setTimeout(() => {
        editor.update(() => {
          const newSelection = $getSelection();
          if ($isRangeSelection(newSelection)) {
            newSelection.focus.set(newNode.getKey(), 0, "text");
          }
        });
      }, 0);
    });

    setIsMenuOpen(false);
  }, [editor]);

  // Trigger image upload
  const triggerImageUpload = () => {
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
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;
          
          const currentNode = selection.anchor.getNode();
          const topLevelElement = currentNode.getTopLevelElement();
          
          if (!topLevelElement) return;
          
          const imageNode = $createImageNode({ src: url, alt: file.name });
          topLevelElement.insertAfter(imageNode);
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // Trigger embed insert
  const triggerEmbedInsert = () => {
    const url = window.prompt("Enter embed URL (YouTube, Figma, etc.)");
    if (!url) return;
    
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      
      const currentNode = selection.anchor.getNode();
      const topLevelElement = currentNode.getTopLevelElement();
      
      if (!topLevelElement) return;
      
      const embedNode = $createEmbedNode({ url });
      topLevelElement.insertAfter(embedNode);
    });
  };

  // Update position based on selection and mouse hover
  useEffect(() => {
    let hoverTimeout: NodeJS.Timeout | null = null;

    const updateFromSelection = () => {
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return;
        }

        const node = selection.anchor.getNode();
        const topLevelElement = node.getTopLevelElement();
        
        if (!topLevelElement) {
          return;
        }

        const key = topLevelElement.getKey();
        const element = editor.getElementByKey(key);
        
        if (!element) {
          return;
        }

        const rect = element.getBoundingClientRect();
        // Make sure the button is always visible within the viewport
        const buttonX = Math.max(8, rect.left + window.scrollX - 36);
        const buttonY = Math.max(8, rect.top + window.scrollY + rect.height / 2 - 14);
        
        setPosition({
          x: buttonX,
          y: buttonY
        });
        setCurrentBlockKey(key);
        setIsVisible(true);
      });
    };

    const handleMouseMove = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const blockElement = target?.closest('[data-lexical-node-key]') as HTMLElement | null;
      
      if (blockElement) {
        const key = blockElement.getAttribute('data-lexical-node-key');
        if (key) {
          setCurrentBlockKey(key);
          const rect = blockElement.getBoundingClientRect();
          // Make sure the button is always visible within the viewport
          const buttonX = Math.max(8, rect.left + window.scrollX - 36);
          const buttonY = Math.max(8, rect.top + window.scrollY + rect.height / 2 - 14);
          
          setPosition({
            x: buttonX,
            y: buttonY
          });
          setIsVisible(true);
        }
        
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }
      } else {
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }
        hoverTimeout = setTimeout(() => {
          setIsVisible(false);
        }, 200);
      }
    };

    const offSel = editor.registerUpdateListener(updateFromSelection);
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      offSel();
      document.removeEventListener('mousemove', handleMouseMove);
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [editor]);

  // Handle clicks outside menu and keyboard events
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isMenuOpen) return;

      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setSearchQuery("");
        setSelectedIndex(0);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) => 
          prev < filteredBlockTypes.length - 1 ? prev + 1 : 0
        );
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) => 
          prev > 0 ? prev - 1 : filteredBlockTypes.length - 1
        );
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (filteredBlockTypes[selectedIndex]) {
          filteredBlockTypes[selectedIndex].onSelect();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  // Handle plus button click
  const handlePlusClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      // Calculate menu position with bounds checking
      const menuWidth = 256; // w-64 = 16rem = 256px
      const menuHeight = 320; // max-h-80 = 20rem = 320px
      
      let x = rect.left + window.scrollX + 24;
      let y = rect.top + window.scrollY - 8;
      
      // Check if menu would go off the right edge
      if (x + menuWidth > window.innerWidth) {
        x = rect.left + window.scrollX - menuWidth - 8;
      }
      
      // Check if menu would go off the bottom edge
      if (y + menuHeight > window.innerHeight + window.scrollY) {
        y = rect.top + window.scrollY - menuHeight + 8;
      }
      
      setMenuPosition({ x, y });
    }
    setIsMenuOpen(!isMenuOpen);
    setSearchQuery("");
    setSelectedIndex(0);
  }, [isMenuOpen]);

  // Filter block types based on search query
  const filteredBlockTypes = blockTypes.filter(blockType =>
    blockType.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blockType.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset selected index when search query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  if (!isVisible || !currentBlockKey) return null;

  return createPortal(
    <>
             <button
         ref={buttonRef}
         type="button"
         onMouseDown={handlePlusClick}
         onMouseEnter={() => setIsVisible(true)}
         onMouseLeave={() => {
           // Only hide if not hovering over the button itself
           setTimeout(() => {
             if (!buttonRef.current?.matches(':hover')) {
               setIsVisible(false);
             }
           }, 100);
         }}
         className="absolute z-40 h-7 w-7 rounded border bg-background hover:bg-muted text-sm flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm"
         style={{ left: position.x, top: position.y }}
         aria-label="Insert block"
       >
         <Plus className="w-3 h-3" />
       </button>
      
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute z-50 w-64 rounded-lg border bg-background shadow-xl"
          style={{ left: menuPosition.x, top: menuPosition.y }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="p-2 border-b">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a block..."
              className="w-full px-2 py-1 text-sm outline-none bg-transparent"
              autoFocus
            />
          </div>
          <div className="max-h-80 overflow-auto py-1">
            {filteredBlockTypes.length > 0 ? (
              filteredBlockTypes.map((blockType, index) => (
                <button
                  key={blockType.key}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={blockType.onSelect}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-3 transition-colors ${
                    index === selectedIndex ? "bg-muted" : ""
                  }`}
                >
                  <span className="text-muted-foreground">{blockType.icon}</span>
                  <span>{blockType.title}</span>
                  {blockType.shortcut && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {blockType.shortcut}
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No blocks found
              </div>
            )}
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
