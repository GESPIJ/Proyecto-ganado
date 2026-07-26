import { useState } from 'react';
import AppShell from './components/AppShell';
import { usingLocal } from './api';
import { getApiKey, setApiKey } from './api/client';

export default function App() {
  // En modo local (sin VITE_API_URL) no hace falta clave: arranca directo.
  const [hasKey, setHasKey] = useState(usingLocal || !!getApiKey());
  const [value, setValue] = useState('');

  if (!hasKey) {
    const conectar = () => {
      const k = value.trim();
      if (!k) return;
      setApiKey(k);
      setHasKey(true);
    };
    return (
      <div className="gate">
        <h1>🐄 Ganado</h1>
        <p>Ingresa la clave de acceso para conectarte al servidor de la finca.</p>
        <input
          type="password"
          placeholder="Clave de acceso"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && conectar()}
          autoFocus
        />
        <button className="btn pri" onClick={conectar} disabled={!value.trim()}>
          Conectar
        </button>
      </div>
    );
  }

  return <AppShell />;
}
