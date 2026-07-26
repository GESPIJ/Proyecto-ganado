import { useRef, useState } from 'react';

interface Props {
  value?: string | null;
  onUpload: (file: File) => Promise<string | null>;
}

// Reduce la imagen a un máximo de 1280px (lado mayor) antes de subirla, para no
// inflar S3 ni localStorage. Devuelve un File JPEG.
async function downscale(file: File, max = 1280): Promise<File> {
  if (!/^image\//.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    if (scale >= 1) return file;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.85));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file; // si el navegador no soporta createImageBitmap, subir tal cual
  }
}

/** Selector de foto con vista previa. Sube vía onUpload; muestra aviso si devuelve null. */
export default function FotoInput({ value, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permitir re-seleccionar el mismo archivo
    if (!file) return;
    setSubiendo(true);
    setAviso(null);
    try {
      const small = await downscale(file);
      const url = await onUpload(small);
      if (!url) setAviso('Fotos no disponibles (el servidor no tiene almacenamiento configurado).');
    } catch {
      setAviso('No se pudo subir la foto.');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="field">
      <label>Foto</label>
      <div className="foto-row">
        {value ? (
          <img className="foto-preview" src={value} alt="Foto del animal" />
        ) : (
          <div className="foto-empty">🐄</div>
        )}
        <button className="btn" type="button" onClick={() => inputRef.current?.click()} disabled={subiendo}>
          {subiendo ? 'Subiendo…' : value ? 'Cambiar foto' : 'Subir foto'}
        </button>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={onPick} />
      </div>
      {aviso && <span className="help">{aviso}</span>}
    </div>
  );
}
