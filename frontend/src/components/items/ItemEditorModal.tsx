import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { UIItem, ItemType } from "@/types/items";
import { Button } from "@/components/ui/button";
import { Pin, ListTodo, Image, Link2, Mic2, FileText, Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { useItemUpload } from "@/hooks/useItemUpload";
import { Progress } from "@/components/ui/progress";
import TagInput from "@/components/tags/TagInput";

interface ItemEditorModalProps {
  open: boolean;
  item: UIItem | null;
  onClose: () => void;
  onSave: (payload: {
    type: ItemType;
    title: string;
    content?: string;
    todos?: Array<{ id: string; text: string; done: boolean }>;
    url?: string;
    fileName?: string;
    images?: { url: string }[];
    isPinned?: boolean;
    tags?: string[];
  }) => void;
}

const ItemEditorModal: React.FC<ItemEditorModalProps> = ({ open, item, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [todos, setTodos] = useState<Array<{ id: string; text: string; done: boolean }>>([]);
  const [url, setUrl] = useState("");
  const [images, setImages] = useState<{url: string}[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<string | null>(null);
  const { uploadStatus, uploadProgress, uploadedUrl, error, triggerUpload, openFileDialog, reset } = useItemUpload();

  useEffect(() => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    if (item) {
      setTitle(item.title || "");
      setIsPinned(!!item.isPinned);
      setContent((item as any).preview || "");
      setSelectedTags((item as any).tags || []);
      
      // Load todos if they exist
      if (item.type === "todo" || (item as any).todos) {
        setTodos((item as any).todos || []);
      }

      // Load URL/link if it exists
      if (item.type === 'link' && (item as any).url) {
        setUrl((item as any).url || "");
      }

      // Load audio if it exists
      if (item.type === 'audio' && (item as any).src) {
        setAudioFile((item as any).src || "");
      }

      // Load document if it exists
      if (item.type === 'document') {
        setDocumentFile((item as any).url || "");
        setFileName((item as any).fileName || null);
      }

      // Load images if they exist
      if (item.type === 'image' || (item as any).images) {
        const itemImages = (item as any).images || [];
        setImages(itemImages);
        if (itemImages.length > 0) {
          setPreviewUrl(itemImages[0].url);
        }
      }
    } else {
      setTitle("");
      setContent("");
      setTodos([]);
      setUrl("");
      setImages([]);
      setIsPinned(false);
      setSelectedTags([]);
      setAudioFile(null);
      setDocumentFile(null);
      setNewTodo("");
      setPreviewUrl(null);
      setFileName(null);
    }
    
    setNewTodo("");
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item]);

  const handleSave = async () => {
    // Determine the primary type based on what content exists
    let primaryType: ItemType = "text";
    if (todos.length > 0) primaryType = "todo";
    else if (images.length > 0) primaryType = "image";
    else if (url) primaryType = "link";
    else if (audioFile) primaryType = "audio";
    else if (documentFile) primaryType = "document";

    const finalImages = uploadedUrl ? [...images, { url: uploadedUrl }] : images;

    onSave({
      type: primaryType,
      title: title.trim(),
      content: content.trim(),
      todos: todos.length > 0 ? todos : undefined,
      url: uploadedUrl || url || audioFile || documentFile || "",
      fileName: fileName || undefined,
      images: finalImages.length > 0 ? finalImages : undefined,
      isPinned,
      tags: selectedTags,
    });
    onClose();
  };

  const handleAddImage = () => {
    openFileDialog("image/*", async (file) => {
      setFileName(file.name);
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(localPreviewUrl);
      await triggerUpload(file);
    });
  };

  const handleAddAudio = () => {
    openFileDialog("audio/*", async (file) => {
      setFileName(file.name);
      const uploadedFileUrl = await triggerUpload(file);
      if (uploadedFileUrl) {
        setAudioFile(uploadedFileUrl);
      }
    });
  };

  const handleAddDocument = () => {
    openFileDialog(".doc,.docx,.pdf,.txt", async (file) => {
      setFileName(file.name);
      const uploadedFileUrl = await triggerUpload(file);
      if (uploadedFileUrl) {
        setDocumentFile(uploadedFileUrl);
      }
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-[92%] max-w-2xl rounded-xl border bg-background p-4 shadow-2xl max-h-[90vh] overflow-y-auto relative"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <input
                  className="flex-1 bg-transparent text-lg font-semibold outline-none placeholder:text-muted-foreground/70 break-words"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                {uploadStatus === 'uploading' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                )}
                <button
                  className="shrink-0 p-2 rounded-full hover:bg-muted"
                  title={isPinned ? "Unpin" : "Pin"}
                  aria-label={isPinned ? "Unpin note" : "Pin note"}
                  onClick={() => setIsPinned((v) => !v)}
                >
                  <Pin className={cn("h-5 w-5", isPinned ? "text-primary fill-primary" : "text-muted-foreground")} />
                </button>
              </div>

              {/* Text Content */}
              <textarea
                className="w-full h-full min-h-[120px] resize-none bg-transparent outline-none placeholder:text-muted-foreground/70 border rounded-md p-3 break-words"
                placeholder="Take a note..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              {/* Tags Section */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Tags</div>
                <TagInput
                  value={selectedTags}
                  onChange={setSelectedTags}
                  placeholder="Add tags..."
                  maxTags={10}
                />
              </div>

              {/* Todos Section */}
              {todos.length > 0 && (
                <div className="rounded-md border divide-y bg-muted/30">
                  <div className="px-3 py-2 text-sm font-medium">Tasks</div>
                  {todos.map((t, index) => (
                    <div key={t.id || `todo-${index}`} className="flex items-center gap-2 px-3 py-2 text-sm group">
                      <Checkbox
                        checked={t.done}
                        onCheckedChange={() => setTodos((prev) => prev.map((x) => x.id === t.id ? { ...x, done: !x.done } : x))}
                      />
                      <input
                        className="flex-1 bg-transparent outline-none break-words"
                        value={t.text}
                        onChange={(e) => setTodos((prev) => prev.map((x) => x.id === t.id ? { ...x, text: e.target.value } : x))}
                      />
                      <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100" onClick={() => setTodos((prev) => prev.filter((x) => x.id !== t.id))}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new todo */}
              <div className="flex items-center gap-2 px-3 py-2 text-sm border rounded-md">
                <Plus size={18} className="text-muted-foreground" />
                <input
                  className="flex-1 bg-transparent outline-none break-words"
                  placeholder="Add a task..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newTodo.trim()) {
                      setTodos((prev) => [...prev, { id: `${Date.now()}`, text: newTodo.trim(), done: false }]);
                      setNewTodo("");
                    }
                  }}
                />
              </div>

              {/* Images Section */}
              {images.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Images</div>
                  <div className="w-full grid grid-cols-3 gap-2 border rounded-md p-3">
                    {images.map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img.url} alt="Image preview" className="w-full h-auto rounded-sm" />
                        <button 
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                          onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {previewUrl && previewUrl.startsWith("blob:") && (
                      <div className="relative">
                        <img src={previewUrl} alt="New image preview" className="w-full h-auto rounded-sm" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Link Section */}
              {url && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Link</div>
                  <input
                    className="w-full bg-transparent text-sm outline-none border rounded-md p-3 break-words"
                    placeholder="Enter a URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
              )}

              {/* Audio Section */}
              {audioFile && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Audio</div>
                  <div className="p-3 rounded-md border bg-muted/50 text-sm text-foreground">
                    <p>Audio: {fileName}</p>
                  </div>
                </div>
              )}

              {/* Document Section */}
              {documentFile && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Document</div>
                  <div className="p-3 rounded-md border bg-muted/50 text-sm text-foreground">
                    <p>File: {fileName}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setTodos(prev => [...prev, { id: `${Date.now()}`, text: "", done: false }])}
                    className="p-2 rounded-full hover:bg-muted hover:text-foreground"
                    title="Add Todo"
                  >
                    <ListTodo className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={handleAddImage}
                    className="p-2 rounded-full hover:bg-muted hover:text-foreground"
                    title="Add Image"
                  >
                    <Image className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setUrl(url || "https://")}
                    className="p-2 rounded-full hover:bg-muted hover:text-foreground"
                    title="Add Link"
                  >
                    <Link2 className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={handleAddAudio}
                    className="p-2 rounded-full hover:bg-muted hover:text-foreground"
                    title="Add Audio"
                  >
                    <Mic2 className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={handleAddDocument}
                    className="p-2 rounded-full hover:bg-muted hover:text-foreground"
                    title="Add Document"
                  >
                    <FileText className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
                  <Button size="sm" onClick={handleSave}>Save</Button>
                </div>
              </div>
            </div>
            {/* Bottom overlay for scroll indication */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none rounded-b-xl"></div>
          </motion.div>
        </motion.div>
      )}
      {uploadStatus === 'uploading' && (
        <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <p className="text-sm text-muted-foreground">Uploading...</p>
          <Progress value={uploadProgress} className="w-1/2" />
        </div>
      )}
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </AnimatePresence>
  );
};

export default ItemEditorModal;


