import { useEffect } from 'react';

// Visor a pantalla completa de la foto de un animal. Cerrar con clic en el
// fondo, la × o la tecla Esc. Se renderiza solo cuando `src` tiene valor.
export default function ImageLightbox({ src, onClose }: { src: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div className="lightbox" role="dialog" aria-modal="true" onClick={onClose}>
      <button className="lightbox-close" aria-label="Cerrar" onClick={onClose}>×</button>
      <img src={src} alt="Foto del animal" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}
