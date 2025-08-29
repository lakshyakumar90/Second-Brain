export type ItemType = "text" | "image" | "link" | "document" | "audio" | "todo";

export interface BaseItem {
  id: string;
  type: ItemType;
  title: string;
  preview?: string; // Added for search results and page summaries
  createdAt?: string;
  updatedAt?: string;
  isFavorite?: boolean;
  isPinned?: boolean;
  color?: string; // hex or css color for note background
  tags?: string[];
}

export interface TextItem extends BaseItem {
  type: "text";
  preview?: string;
}

export interface ImageItem extends BaseItem {
  type: "image";
  images: Array<{ url: string; width?: number; height?: number; alt?: string }>;
}

export interface LinkItem extends BaseItem {
  type: "link";
  url: string;
  og?: { title?: string; description?: string; image?: string; siteName?: string; domain?: string };
}

export interface DocumentItem extends BaseItem {
  type: "document";
  fileName: string;
  fileType: string; // e.g., pdf, docx, md
  sizeBytes?: number;
  url?: string;
}

export interface AudioItem extends BaseItem {
  type: "audio";
  src: string;
  durationSec?: number;
  cover?: string;
}

export interface TodoItem extends BaseItem {
  type: "todo";
  todos: Array<{ id: string; text: string; done: boolean }>;
}

export type UIItem = TextItem | ImageItem | LinkItem | DocumentItem | AudioItem | TodoItem;


