import { useState } from 'react';
import LecheView from './LecheView';
import MautesView from './MautesView';

type Sub = 'leche' | 'mautes';

/** Aloja las sub-pestañas Leche / Mautes (segmented control local). */
export default function ProjectionsView() {
  const [sub, setSub] = useState<Sub>('leche');
  return (
    <div className="view">
      <div className="seg">
        <button className={sub === 'leche' ? 'on' : ''} onClick={() => setSub('leche')}>
          🐄 Leche
        </button>
        <button className={sub === 'mautes' ? 'on' : ''} onClick={() => setSub('mautes')}>
          🐂 Mautes
        </button>
      </div>
      {sub === 'leche' ? <LecheView /> : <MautesView />}
    </div>
  );
}
