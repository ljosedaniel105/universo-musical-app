import React, { useState } from 'react';

export interface Cancion {
  id?: string | number;
  titulo?: string;
  artista?: string;
  genero?: string;
  portada_url?: string;
  audio_url?: string;
  likes?: number;
}

interface ListaCancionesProps {
  canciones?: Cancion[];
}

export default function ListaCanciones({ canciones = [] }: ListaCancionesProps) {
  const [likes, setLikes] = useState<{ [key: string | number]: number }>({});

  const toggleLike = (id: string | number) => {
    setLikes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  if (canciones.length === 0) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#18181f', borderRadius: '12px', color: '#aaa', textAlign: 'center' }}>
        No hay canciones disponibles. ¡Agrega una desde la sección "Subir Canción"!
      </div>
    );
  }

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {canciones.map((cancion, index) => {
          const id = cancion.id || index;
          const imagen = cancion.portada_url && cancion.portada_url.trim() !== '' 
            ? cancion.portada_url 
            : 'https://via.placeholder.com/200?text=Sin+Portada';
          const titulo = cancion.titulo || 'Título no disponible';
          const artista = cancion.artista || 'Artista no disponible';
          const numLikes = likes[id] || cancion.likes || 0;

          return (
            <div
              key={id}
              style={{
                backgroundColor: '#18181f',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #282832',
                boxSizing: 'border-box'
              }}
            >
              <img
                src={imagen}
                alt={titulo}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Portada';
                }}
                style={{
                  width: '100%',
                  height: '180px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  backgroundColor: '#0d0d11'
                }}
              />

              <h3 style={{ color: '#fff', fontSize: '16px', margin: '0 0 4px 0', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {titulo}
              </h3>

              <p style={{ color: '#aaa', fontSize: '13px', margin: '0 0 10px 0', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {artista}
              </p>

              {cancion.genero && (
                <span
                  style={{
                    alignSelf: 'center',
                    backgroundColor: '#282835',
                    color: '#ff6600',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    marginBottom: '12px'
                  }}
                >
                  {cancion.genero}
                </span>
              )}

              {cancion.audio_url && (
                <audio
                  controls
                  src={cancion.audio_url}
                  style={{ width: '100%', height: '32px', marginBottom: '10px' }}
                />
              )}

              <button
                onClick={() => toggleLike(id)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#22222d',
                  color: '#ff6600',
                  border: '1px solid #ff6600',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  marginTop: 'auto'
                }}
              >
                ❤️ Me gusta ({numLikes})
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
