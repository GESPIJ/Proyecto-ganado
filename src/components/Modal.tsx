import { useEffect, type ReactNode } from 'react';

interface Props {
  title?: string;
  onClose: () => void;
  children: ReactNode;
}

/** Modal centrado (overlay). Cierra con clic en el fondo, la × o Esc.
 *  La tarjeta scrollea internamente si el contenido es largo. */
export default function Modal({ title, onClose, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 className="sec" style={{ margin: 0 }}>{title}</h2>
          <button className="modal-x" aria-label="Cerrar" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
