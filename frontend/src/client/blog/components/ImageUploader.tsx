import { useEffect, useRef, useState, type DragEvent } from 'react';
import { uploadImage } from '../services/blogService';
import { isHttpsUrl, IMAGE_ACCEPT, validateImageFile } from '../utils';
import { TextField } from './ui';

interface Props {
  value: string;
  error?: string | undefined;
  onChange: (url: string) => void;
}

function safeObjectUrl(file: File): string | null {
  try {
    return URL.createObjectURL(file);
  } catch {
    return null;
  }
}

export function ImageUploader({ value, error, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  // Local preview of the file the user just uploaded (fast, works before the CDN is ready).
  const [local, setLocal] = useState<{ url: string; preview: string } | null>(null);
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);

  useEffect(() => {
    const preview = local?.preview;
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [local]);

  const url = value.trim();
  const hasImage = url !== '' && isHttpsUrl(url);
  const src = local && local.url === url ? local.preview : url;
  const previewBroken = brokenSrc === src;

  async function handleFile(file: File | undefined) {
    if (!file || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setMessage(null);
    try {
      const check = await validateImageFile(file);
      if (!check.ok) {
        setMessage(check.error);
        return;
      }
      const res = await uploadImage(file);
      if (!res.ok) {
        setMessage(res.error.message);
        return;
      }
      const preview = safeObjectUrl(file);
      setLocal(preview ? { url: res.data.url, preview } : null);
      setBrokenSrc(null);
      onChange(res.data.url);
    } catch {
      setMessage('Upload failed. Check your connection and try again.');
    } finally {
      busyRef.current = false;
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    void handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div className="bl-stack">
      <div
        className={dragging ? 'bl-drop bl-drop-active' : 'bl-drop'}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {hasImage && !previewBroken ? (
          <img className="bl-preview" src={src} alt="Selected page image" referrerPolicy="no-referrer" onError={() => setBrokenSrc(src)} />
        ) : hasImage ? (
          <p className="bl-hint">Image added. A preview is not available right now.</p>
        ) : (
          <p className="bl-hint">Drag an image here, or choose one from your device.</p>
        )}
        <div className="bl-row">
          <button type="button" className="bl-btn" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? 'Uploading…' : hasImage ? 'Replace image' : 'Upload image'}
          </button>
          {hasImage && (
            <button
              type="button"
              className="bl-btn bl-btn-danger"
              disabled={busy}
              onClick={() => {
                setLocal(null);
                setMessage(null);
                onChange('');
              }}
            >
              Remove
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept={IMAGE_ACCEPT} className="bl-sr" tabIndex={-1} aria-label="Choose image file" onChange={(e) => void handleFile(e.target.files?.[0])} />
      </div>
      <p className="bl-hint">JPG, PNG or WebP, up to 5 MB.</p>
      {message && <p className="bl-error" role="alert">{message}</p>}

      {linkOpen || error ? (
        <TextField label="Image link" type="url" inputMode="url" placeholder="https://" value={value} hint="Must start with https://" error={error} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <button type="button" className="bl-link bl-link-left" onClick={() => setLinkOpen(true)}>Use an image link instead</button>
      )}
    </div>
  );
}
