import React, { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import type { OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Table from "@editorjs/table";
import Checklist from "@editorjs/checklist";
import Quote from "@editorjs/quote";
import Code from "@editorjs/code";
import Delimiter from "@editorjs/delimiter";
import InlineCode from "@editorjs/inline-code";
import Marker from "@editorjs/marker";
import Embed from "@editorjs/embed";
import ImageTool from "@editorjs/image";
// @ts-ignore
import ToggleBlock from "editorjs-toggle-block";
// @ts-ignore
import Undo from "editorjs-undo";
// @ts-ignore
import DragDrop from "editorjs-drag-drop";

type EditorJSClientProps = {
  data?: OutputData;
  onChange?: (data: OutputData) => void;
  holderId?: string;
};

const EditorJSClient: React.FC<EditorJSClientProps> = ({
  data,
  onChange,
  holderId = "editorjs",
}) => {
  const editorRef = useRef<EditorJS | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const editor = new EditorJS({
      holder: holderId,
      autofocus: true,
      logLevel: "ERROR" as any,
      placeholder: "Start typing here...",
      data,
      tools: {
        // ✅ All heading variants in slash menu
        heading1: {
          class: Header,
          inlineToolbar: ["marker", "inlineCode"],
          config: { levels: [1], defaultLevel: 1 },
          shortcut: "CMD+SHIFT+1",
          toolbox: { title: "Heading 1" },
        },
        heading2: {
          class: Header,
          inlineToolbar: ["marker", "inlineCode"],
          config: { levels: [2], defaultLevel: 2 },
          shortcut: "CMD+SHIFT+2",
          toolbox: { title: "Heading 2" },
        },
        heading3: {
          class: Header,
          inlineToolbar: ["marker", "inlineCode"],
          config: { levels: [3], defaultLevel: 3 },
          shortcut: "CMD+SHIFT+3",
          toolbox: { title: "Heading 3" },
        },
        heading4: {
          class: Header,
          inlineToolbar: ["marker", "inlineCode"],
          config: { levels: [4], defaultLevel: 4 },
          toolbox: { title: "Heading 4" },
        },
        heading5: {
          class: Header,
          inlineToolbar: ["marker", "inlineCode"],
          config: { levels: [5], defaultLevel: 5 },
          toolbox: { title: "Heading 5" },
        },
        heading6: {
          class: Header,
          inlineToolbar: ["marker", "inlineCode"],
          config: { levels: [6], defaultLevel: 6 },
          toolbox: { title: "Heading 6" },
        },

        list: { class: List as any, inlineToolbar: true },
        table: Table,
        checklist: Checklist,
        quote: {
          class: Quote,
          inlineToolbar: true,
          config: {
            quotePlaceholder: "Enter a quote",
            captionPlaceholder: "Quote author",
          },
        },
        code: {
          class: Code,
        },
        delimiter: Delimiter,
        inlineCode: InlineCode,
        marker: Marker,
        embed: Embed,
        image: {
          class: ImageTool,
          config: {
            uploader: {
              async uploadByFile(file: File) {
                const base64 = await fileToBase64(file);
                return { success: 1, file: { url: base64 } } as any;
              },
              async uploadByUrl(url: string) {
                return { success: 1, file: { url } } as any;
              },
            },
          },
        },
        toggle: {
          class: ToggleBlock,
          inlineToolbar: true,
        },
      },
      onChange: async () => {
        if (onChange) {
          const saved = await editor.save();
          onChange(saved);
        }
      },
      onReady: () => {
        // @ts-ignore
        new Undo({ editor });
        // @ts-ignore
        new DragDrop(editor);
      },
    });

    editorRef.current = editor;

    return () => {
      if (editorRef.current) {
        if (typeof editorRef.current.destroy === "function") {
          editorRef.current.destroy();
        } else {
          editorRef.current.isReady
            .then(() => editorRef.current?.destroy())
            .catch(() => {});
        }
        editorRef.current = null;
      }
    };
  }, [holderId, data, onChange]);

  return (
    <div
      id={holderId}
      className="prose max-w-none py-8 min-h-[60vh] text-foreground overflow-x-hidden"
      style={{
        maxWidth: "100%",
        // overflowX: "hidden",
        wordWrap: "break-word",
        overflowWrap: "break-word",
      }}
    />
  );
};

export default EditorJSClient;

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
