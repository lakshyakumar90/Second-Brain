import React, { useState } from "react";
import type { OutputData } from "@editorjs/editorjs";
import EditorJSClient from "./EditorJSClient";

const EditorShell: React.FC = () => {
  const [data, setData] = useState<OutputData | undefined>(undefined);

  return (
    <div className="w-full w-full mx-auto">
      {/* <div className="flex items-center justify-between mb-4 px-1">
        <h1 className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>
          Editor
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setData(undefined)}
            className="px-3 py-1.5 rounded-md text-sm"
            style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}
          >
            Clear
          </button>
          <button
            onClick={() => {
              if (!data) return;
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "editor-content.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-3 py-1.5 rounded-md text-sm"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            Export JSON
          </button>
        </div>
      </div> */}

      <div
        className="rounded-2xl"
        style={{
        //   background: "var(--card)",
        //   border: "1px solid var(--border)",
        //   boxShadow: "var(--shadow-xs)",
        }}
      >
        <EditorJSClient data={data} onChange={setData} />
      </div>
    </div>
  );
};

export default EditorShell;


