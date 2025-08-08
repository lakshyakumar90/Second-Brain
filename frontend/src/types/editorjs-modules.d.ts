// Type fallbacks for Editor.js ecosystem packages that ship incomplete typings

declare module '@editorjs/checklist';
declare module '@editorjs/marker';
declare module '@editorjs/embed';
declare module 'editorjs-undo';
declare module 'editorjs-drag-drop';

// Some packages have typings but ESM exports can confuse TS in Vite; these fallbacks are safe
declare module '@editorjs/delimiter';
declare module '@editorjs/inline-code';
declare module '@editorjs/warning';
declare module '@editorjs/image';
declare module '@editorjs/table';
declare module '@editorjs/quote';
declare module '@editorjs/list';
declare module '@editorjs/header';


