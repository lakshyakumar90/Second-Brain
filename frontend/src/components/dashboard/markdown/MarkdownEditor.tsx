import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

type MarkdownEditorProps = {
  value: string;
  onChange: (markdown: string) => void;
};

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="border rounded-xl overflow-hidden">
        <div className="px-3 py-2 border-b text-sm text-muted-foreground">Markdown</div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={16}
          className="w-full min-h-[320px] max-h-[70vh] resize-vertical px-3 py-3 outline-none"
          placeholder="Write Markdown here..."
        />
      </div>
      <div className="border rounded-xl overflow-hidden">
        <div className="px-3 py-2 border-b text-sm text-muted-foreground">Preview</div>
        <div className="px-4 py-3 prose max-w-none overflow-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
            {value}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;


