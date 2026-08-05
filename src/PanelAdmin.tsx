import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

export default function PanelAdmin() {
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

  const eliminarCancion = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta canción?')) {
      const { error } = await supabase.from('canciones').delete().eq('id', id);
      if (!error) {
        setCanciones(canciones.filter(c => c.id !== id));
      } else {
        alert('Error al eliminar: ' + error.message);
      }
    }
  };

  if (cargando) {
    return <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>Cargando panel...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#ff6b00', marginTop: 0, marginBottom: '20px' }}>🔑 Panel de Administración</h2>
      
      <div style={{ backgroundColor: '#18181c', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a30' }}>
        <h3 style={{ color: 'white', marginTop: 0 }}>Gestión de Canciones ({canciones.length})</h3>
        
        {canciones.length === 0 ? (
          <p style={{ color: '#aaa' }}>No hay canciones en el sistema.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {canciones.map((cancion) => (
              <div 
                key={cancion.id} 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0d0d0f', padding: '12px 16px', borderRadius: '8px', border: '1px solid #2a2a30' }}
              >
                <div>
                  <h4 style={{ margin: 0, color: 'white', fontSize: '15px' }}>{cancion.titulo}</h4>
                  <p style={{ margin: 0, color: '#aaa', fontSize: '13px' }}>{cancion.artista}</p>
                </div>
                <button 
                  onClick={() => eliminarCancion(cancion.id)}
                  style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  🗑️ Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
