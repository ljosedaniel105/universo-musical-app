import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

export default function ListaCanciones({ alSeleccionarCancion }: { alSeleccionarCancion: (cancion: any) => void }) {
  const [canciones, setCanciones] = useState<any[]>([]);
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
    return <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>Cargando canciones...</div>;
  }

  return (
    <div>
      <h2 style={{ color: '#ffffff', marginTop: 0, marginBottom: '20px' }}>🌍 Todas las Canciones</h2>
      
      {canciones.length === 0 ? (
        <p style={{ color: '#aaa' }}>No hay canciones disponibles. ¡Publica una en la sección "Subir Música"!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {canciones.map((cancion) => {
            // DETECTA SI LA PORTADA ESTÁ EN portada_url O EN url_portada
            const portadaReal = 
              cancion.portada_url || 
              cancion.url_portada || 
              'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500';

            return (
              <div 
                key={cancion.id}
                style={{ backgroundColor: '#18181c', borderRadius: '12px', padding: '15px', border: '1px solid #2a2a30', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center' }}
              >
                <img 
                  src={portadaReal} 
                  alt={cancion.titulo} 
                  style={{ width: '100%', height: '180px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <div>
                  <h3 style={{ color: 'white', fontSize: '16px', margin: '0 0 4px 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {cancion.titulo}
                  </h3>
                  <p style={{ color: '#aaa', fontSize: '13px', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {cancion.artista}
                  </p>
                </div>
                <button 
                  onClick={() => alSeleccionarCancion(cancion)}
                  style={{ backgroundColor: '#ff6b00', color: 'white', border: 'none', padding: '10px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}
                >
                  ► Escuchar
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
