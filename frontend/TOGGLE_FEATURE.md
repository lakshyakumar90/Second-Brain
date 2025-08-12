# Toggle Feature in Text Editor

## Overview
The text editor now includes a toggle/collapsible block feature that allows you to create expandable content sections with titles and collapsible content.

## How to Use

### Adding a Toggle Block
1. Open the text editor
2. Type `/` to open the slash menu
3. Select "Toggle" from the available options
4. Enter a title for your toggle block
5. Add content inside the toggle block

### Features
- **Toggle Title**: Click on the toggle header to expand/collapse the content
- **Rich Content**: The toggle content supports all other editor tools (headings, lists, images, etc.)
- **Inline Editing**: You can edit the toggle title and content directly
- **Keyboard Shortcuts**: Use standard EditorJS shortcuts within toggle content

### Example Usage
```
📋 Toggle Block Example
├── Title: "Project Requirements"
└── Content:
    ├── Heading: "Frontend Requirements"
    ├── List: React, TypeScript, Tailwind CSS
    ├── Heading: "Backend Requirements"
    └── List: Node.js, Express, MongoDB
```

### Styling
The toggle blocks are styled to match your theme:
- Light/Dark mode support
- Consistent with your design system
- Smooth animations for expand/collapse
- Hover effects for better UX

### Technical Details
- Uses `editorjs-toggle-block` package
- Fully integrated with existing EditorJS tools
- Supports undo/redo functionality
- Compatible with drag and drop
