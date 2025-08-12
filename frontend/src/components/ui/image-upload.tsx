import React, { useCallback, useRef, useState } from "react";
import { Button } from "./button";

interface ImageUploadProps {
  multiple?: boolean;
  onUploaded?: (urls: string[]) => void;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ multiple = true, onUploaded, className }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urls, setUrls] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

  const validateFile = (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const maxSize = 5 * 1024 * 1024;
    if (!allowed.includes(file.type)) return "Only JPEG, PNG, GIF, WebP allowed";
    if (file.size > maxSize) return "Max size 5MB";
    return null;
  };

  const handleSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (!cloudName || !uploadPreset) {
      setError("Cloudinary is not configured");
      return;
    }
    setError(null);
    setUploading(true);
    const nextUrls: string[] = [];
    try {
      for (const file of files) {
        const v = validateFile(file);
        if (v) throw new Error(v);
        const form = new FormData();
        form.append("file", file);
        form.append("upload_preset", uploadPreset);
        form.append("folder", "items");
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
          method: "POST",
          body: form,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        if (data.secure_url) nextUrls.push(data.secure_url as string);
      }
      const merged = [...urls, ...nextUrls];
      setUrls(merged);
      onUploaded?.(merged);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [cloudName, uploadPreset, urls, onUploaded]);

  const removeUrl = (u: string) => {
    const filtered = urls.filter((x) => x !== u);
    setUrls(filtered);
    onUploaded?.(filtered);
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? "Uploading..." : multiple ? "Upload images" : "Upload image"}
        </Button>
        <input ref={inputRef} type="file" accept="image/*" multiple={multiple} onChange={handleSelect} className="hidden" />
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
      {urls.length > 0 && (
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {urls.map((u) => (
            <div key={u} className="relative group border rounded-md overflow-hidden bg-card">
              <img src={u} className="w-full h-20 object-cover" />
              <button
                type="button"
                className="absolute top-1 right-1 text-xs bg-black/60 text-white rounded px-1 opacity-0 group-hover:opacity-100"
                onClick={() => removeUrl(u)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;


