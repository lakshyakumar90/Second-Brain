import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import type { ItemType } from "@/types/items";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ui/image-upload";
import TagInput from "@/components/tags/TagInput";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const schema = z.object({
  type: z.enum(["text", "image", "link", "document", "audio", "todo"] as const),
  title: z.string().min(1, "Title is required"),
  url: z.string().url().optional(),
  description: z.string().optional(),
  todos: z.array(z.object({ text: z.string().min(1), done: z.boolean().optional() })).optional(),
  tags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreateItemModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (values: FormValues) => void;
}

const typeOptions: { label: string; value: ItemType }[] = [
  { label: "Text", value: "text" },
  { label: "Image", value: "image" },
  { label: "Link", value: "link" },
  { label: "Document", value: "document" },
  { label: "Audio", value: "audio" },
  { label: "Todo", value: "todo" },
];

const CreateItemModal: React.FC<CreateItemModalProps> = ({ open, onClose, onCreate }) => {
  const [submitting, setSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { currentWorkspace } = useWorkspace();
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "text", title: "", tags: [] }
  });

  const selectedType = watch("type");

  const onSubmit = (data: FormValues) => {
    setSubmitting(true);
    onCreate({ 
      ...data, 
      tags: selectedTags,
      workspace: currentWorkspace?._id 
    });
    setSubmitting(false);
    onClose();
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
            className="w-[90%] max-w-lg rounded-xl border bg-background p-4 shadow-2xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Create Item</h3>
              <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">Close</button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {typeOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`px-3 py-2 rounded-md border text-sm transition ${selectedType === opt.value ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-secondary'}`}
                    onClick={() => (document.querySelector<HTMLInputElement>(`input[name=type][value=${opt.value}]`)?.click())}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <input type="radio" value="text" {...register("type")} className="hidden" />
              <input type="radio" value="image" {...register("type")} className="hidden" />
              <input type="radio" value="link" {...register("type")} className="hidden" />
              <input type="radio" value="document" {...register("type")} className="hidden" />
              <input type="radio" value="audio" {...register("type")} className="hidden" />
              <input type="radio" value="todo" {...register("type")} className="hidden" />

              <div>
                <label className="text-sm">Title</label>
                <Input placeholder="Enter title" {...register("title")} />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="text-sm">Tags</label>
                <TagInput
                  value={selectedTags}
                  onChange={setSelectedTags}
                  placeholder="Add tags..."
                  maxTags={10}
                />
              </div>

              {(selectedType === "link" || selectedType === "audio") && (
                <div>
                  <label className="text-sm">URL</label>
                  <Input placeholder="https://..." {...register("url")} />
                  {errors.url && <p className="text-xs text-red-500 mt-1">{errors.url.message}</p>}
                </div>
              )}

              {selectedType === "text" && (
                <div>
                  <label className="text-sm">Description</label>
                  <Textarea placeholder="A quick note..." {...register("description")} />
                </div>
              )}

              {selectedType === "todo" && (
                <div className="space-y-2">
                  <label className="text-sm">Todos (comma separated)</label>
                  <Input placeholder="task one, task two" onChange={(e) => {
                    const raw = e.target.value;
                    const todos = raw
                      .split(",")
                      .map(t => t.trim())
                      .filter(Boolean)
                      .map(t => ({ text: t, done: false }));
                    setValue("todos", todos as any, { shouldDirty: true, shouldValidate: true });
                  }} />
                </div>
              )}

              {selectedType === "image" && (
                <div className="space-y-2">
                  <label className="text-sm">Images</label>
                  <ImageUpload
                    multiple
                    onUploaded={(urls) => {
                      // no direct field for images in form; we will pass urls via onCreate
                      (window as any).__tmp_image_urls = urls;
                    }}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateItemModal;


