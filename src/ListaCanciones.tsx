import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

interface Cancion {
  id: string;
  titulo: string;
  artista: string;
  url_archivo: string;
  url_portada: string;
}

interface Props {
  alSeleccionarCancion: (cancion: Cancion) => void;
}

export default function ListaCanciones({ alSeleccionarCancion }: Props) {
  const [canciones, setCanciones] = useState<Cancion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarCanciones();
  }, []);

  const cargarCanciones = async () => {
    setCargando(true);
    const { data, error } = await supabase.from('canciones').select('*');
    if (!error && data) {
      setCanciones(data);
    }
    setCargando(false);
  };

  if (cargando) {
    return <div style={{ color: 'white' }}>Cargando canciones...</div>;
  }

  return (
    <div>
      <h2 style={{ color: '#ff6b00', marginTop: 0, marginBottom: '20px' }}>🔥 Descubrir Canciones</h2>
      
      {canciones.length === 0 ? (
        <p style={{ color: '#aaa' }}>No hay canciones disponibles. ¡Sube una en la sección "Subir Música"!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
          {canciones.map((cancion) => {
            // Si por alguna razón la imagen falla o viene vacía, usa una portada musical limpia en lugar del micrófono
            const portadaFinal = cancion.url_portada && cancion.url_portada.trim() !== '' 
              ? cancion.url_portada 
              : 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500';

            return (
              <div 
                key={cancion.id}
                onClick={() => alSeleccionarCancion(cancion)}
                style={{ 
                  backgroundColor: '#18181c', borderRadius: '12px', padding: '15px', cursor: 'pointer', 
                  border: '1px solid #2a2a30', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', gap: '10px'
                }}
              >
                <img 
                  src={portadaFinal} 
                  alt={cancion.titulo} 
                  style={{ width: '100%', height: '160px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <div>
                  <h3 style={{ color: 'white', fontSize: '15px', margin: '5px 0 2px 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {cancion.titulo}
                  </h3>
                  <p style={{ color: '#aaa', fontSize: '13px', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {cancion.artista}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
