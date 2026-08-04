import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

interface ListaCancionesProps {
  alReproducir?: (cancion: any) => void;
  esAdmin?: boolean;
}

export function ListaCanciones({ alReproducir, esAdmin }: ListaCancionesProps) {
  const [canciones, setCanciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerCanciones();
  }, []);

  const obtenerCanciones = async () => {
    try {
      const { data, error } = await supabase
        .from('canciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCanciones(data || []);
    } catch (e) {
      console.error('Error al cargar canciones:', e);
    } finally {
      setCargando(false);
    }
  };

  const reproducir = (cancion: any) => {
    if (typeof alReproducir === 'function') {
      alReproducir(cancion);
    } else {
      console.log('Reproduciendo canción:', cancion);
    }
  };

  if (cargando) {
    return <div style={{ color: 'white' }}>Cargando música...</div>;
  }

  return (
    <div>
      <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>🌏 Todas las Canciones</h2>

      {canciones.length === 0 ? (
        <p style={{ color: '#888' }}>No hay canciones disponibles aún.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {canciones.map((cancion) => (
            <div 
              key={cancion.id} 
              style={{ 
                backgroundColor: '#181818', 
                borderRadius: '12px', 
                padding: '15px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                border: '1px solid #282828'
              }}
            >
              <img 
                src={cancion.url_imagen || 'https://via.placeholder.com/150'} 
                alt={cancion.titulo} 
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} 
              />
              <h3 style={{ margin: '0 0 5px 0', fontSize: '15px', textAlign: 'center', color: 'white' }}>{cancion.titulo}</h3>
              <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#aaa', textAlign: 'center' }}>{cancion.artista}</p>

              <button 
                onClick={() => reproducir(cancion)} 
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  backgroundColor: '#ff6b00', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '20px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer' 
                }}
              >
                ▶ Escuchar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ListaCanciones;