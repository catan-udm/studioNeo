import { useState } from "react";
import { ImageOff } from "lucide-react";

type ArtworkImageProps = {
  src: string;
  alt: string;
  className?: string;
  fetchPriority?: "high" | "low" | "auto";
  loading?: "lazy" | "eager";
  decoding?: "async" | "auto" | "sync";
};

export function ArtworkImage({ src, alt, className = "", fetchPriority, loading = "lazy", decoding = "async" }: ArtworkImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`img-fallback ${className}`} role="img" aria-label={alt || "作品未能加载"}>
        <ImageOff size={22} strokeWidth={1.5} />
        <span>作品正在整理中</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      onError={() => setFailed(true)}
    />
  );
}
