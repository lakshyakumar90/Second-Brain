import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import {
  TRANSFORMERS,
  $convertToMarkdownString,
  $convertFromMarkdownString,
} from "@lexical/markdown";
import { $getRoot, $insertNodes, $createTextNode } from "lexical";
import type { LexicalEditor as LexicalCoreEditor, EditorState } from "lexical";
import { CodeNode, $createCodeNode } from "@lexical/code";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";

type LexicalEditorProps = {
  markdown: string;
  onMarkdownChange?: (markdown: string) => void;
  onError?: (error: unknown) => void;
};

const theme = {
  paragraph: "text-foreground",
  quote: "border-l-4 border-muted pl-4 text-muted-foreground",
  heading: {
    h1: "text-3xl font-bold mt-4 mb-2",
    h2: "text-2xl font-semibold mt-4 mb-2",
    h3: "text-xl font-semibold mt-3 mb-2",
    h4: "text-lg font-semibold mt-3 mb-2",
    h5: "text-base font-semibold mt-2 mb-1",
    h6: "text-sm font-semibold mt-2 mb-1",
  },
  list: {
    ul: "list-disc pl-6",
    ol: "list-decimal pl-6",
    listitem: "my-1",
  },
  code: "block w-full rounded-md bg-muted p-3 font-mono text-sm overflow-x-auto",
  link: "text-blue-600 hover:underline",
};

function Toolbar({ onInsertCode }: { onInsertCode: () => void }) {
  return (
    <div className="flex items-center gap-2 border rounded-lg px-2 py-1 bg-background">
      <button type="button" className="px-2 py-1 rounded hover:bg-muted" onClick={onInsertCode}>
        Insert code block
      </button>
    </div>
  );
}

function InsertCodePlugin() {
  const [editor] = useLexicalComposerContext();
  const [show, setShow] = useState(false);
  const [language, setLanguage] = useState("typescript");
  const [code, setCode] = useState("// write code here\n");

  return (
    <>
      <Toolbar onInsertCode={() => setShow(true)} />
      {show ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[90vw] max-w-4xl rounded-lg bg-background p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <label className="text-sm">Language</label>
                <select
                  className="border rounded px-2 py-1"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="markdown">Markdown</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded hover:bg-muted" onClick={() => setShow(false)}>
                  Cancel
                </button>
                <button
                  className="px-3 py-1 rounded bg-primary text-primary-foreground"
                  onClick={() => {
                    editor.update(() => {
                      const codeNode = $createCodeNode(language);
                      // Insert code text content into the code node
                      // CodeNode supports appending simple text nodes as children
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore - internal typing doesn't expose append text directly
                      codeNode.append($createTextNode(code));
                      $insertNodes([codeNode]);
                    });
                    setShow(false);
                  }}
                >
                  Insert
                </button>
              </div>
            </div>
            {/* Monaco editor */}
            <div className="h-[60vh] border rounded overflow-hidden">
              {/* Lazy load Monaco to avoid SSR issues */}
              <MonacoHost value={code} onChange={setCode} language={language} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function MonacoHost({
  value,
  onChange,
  language,
}: {
  value: string;
  onChange: (v: string) => void;
  language: string;
}) {
  const [Editor, setEditor] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    import("@monaco-editor/react").then((mod) => {
      if (mounted) setEditor(() => mod.default);
    });
    return () => {
      mounted = false;
    };
  }, []);
  if (!Editor) return <div className="w-full h-full grid place-items-center text-muted-foreground">Loading editor…</div>;
  return (
    <Editor
      height="100%"
      language={language}
      value={value}
              onChange={(v: string | undefined) => onChange(v ?? "")}
      options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false }}
    />
  );
}

function Placeholder() {
  return <div className="pointer-events-none absolute left-3 top-3 text-muted-foreground">Start typing…</div>;
}

function MarkdownBridge({ markdown, lastEmittedMarkdownRef }: { markdown: string; lastEmittedMarkdownRef: React.MutableRefObject<string> }) {
  const [editor] = useLexicalComposerContext();
  const lastMarkdown = React.useRef<string>("");

  useEffect(() => {
    // Skip if this markdown was just emitted from this editor (prevents cursor reset)
    if (markdown === lastEmittedMarkdownRef.current) return;
    if (markdown === lastMarkdown.current) return;
    lastMarkdown.current = markdown;
    editor.update(() => {
      $getRoot().clear();
      $convertFromMarkdownString(markdown, TRANSFORMERS);
    });
  }, [editor, markdown]);
  return null;
}

export default function LexicalEditor({ markdown, onMarkdownChange, onError }: LexicalEditorProps) {
  const lastEmittedMarkdownRef = useRef<string>("");
  const initialConfig = useMemo(
    () => ({
      namespace: "lexical-editor",
      nodes: [HeadingNode, QuoteNode, CodeNode, ListNode, ListItemNode, LinkNode],
      theme,
      onError: (error: unknown) => {
        if (onError) onError(error);
        // eslint-disable-next-line no-console
        console.error(error);
      },
      editorState: null,
    }), [onError]
  );

  const handleChange = useCallback(
    (_state: EditorState, editor: LexicalCoreEditor) => {
      if (!onMarkdownChange) return;
      editor.getEditorState().read(() => {
        const md = $convertToMarkdownString(TRANSFORMERS);
        // Only propagate when content truly changed to avoid loops
        if (md !== lastEmittedMarkdownRef.current) {
          lastEmittedMarkdownRef.current = md;
          onMarkdownChange(md);
        }
      });
    },
    [onMarkdownChange]
  );

  return (
    <div className="w-full">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="border rounded-xl">
          <div className="p-2 border-b">
            <InsertCodePlugin />
          </div>
          <div className="relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="min-h-[320px] max-h-[70vh] overflow-auto px-3 py-3 focus:outline-none" />
              }
              placeholder={<Placeholder />}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <ListPlugin />
            <LinkPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <OnChangePlugin onChange={handleChange} />
            <MarkdownBridge markdown={markdown} lastEmittedMarkdownRef={lastEmittedMarkdownRef} />
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
}


