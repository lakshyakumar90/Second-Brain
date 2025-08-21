import { useEffect, useRef, useState } from "react";
import NotionEditor from "@/components/dashboard/notion/NotionEditor";
import { pageApi } from "@/services/pageApi";
import { Button } from "@/components/ui/button";

const TextEditor = () => {
  const [pageId, setPageId] = useState<string | null>(null);
  const [initialState, setInitialState] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const latest = useRef<{ content: string; editorState: any } | null>(null);

  useEffect(() => {
    // Optionally load last page or create a fresh buffer
    let mounted = true;
    (async () => {
      try {
        const res = await pageApi.getPages({ page: 1, limit: 1 });
        const first = res?.data?.pages?.[0];
        if (mounted && first) {
          setPageId(first._id || first.id);
          setInitialState(first.editorState || null);
        }
      } catch {}
    })();
    return () => { mounted = false };
  }, []);

  const save = async () => {
    if (!latest.current) return;
    setSaving(true);
    try {
      if (pageId) {
        await pageApi.updatePage({ pageId, title: 'Untitled', content: latest.current.content, editorState: latest.current.editorState });
      } else {
        const created = await pageApi.createPage({ title: 'Untitled', content: latest.current.content, editorState: latest.current.editorState });
        const id = created?.page?._id || created?.page?.id;
        if (id) setPageId(id);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-6 px-4">
      <h1 className="text-xl font-semibold mb-4">Editor</h1>
      <div className="flex items-center gap-2 mb-2">
        <Button size="sm" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
      </div>
      <NotionEditor
        initialEditorState={initialState}
        onChange={(data) => { latest.current = data; }}
      />
    </div>
  );
};

export default TextEditor;