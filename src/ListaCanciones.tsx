import React, { useState } from 'react';

export interface Cancion {
  id?: string | number;
  titulo?: string;
  artista?: string;
  genero?: string;
  portada_url?: string;
  portadaUrl?: string;
  audio_url?: string;
  audioUrl?: string;
  likes?: number;
}

interface ListaCancionesProps {
  canciones?: Cancion[];
}

export default function ListaCanciones({ canciones = [] }: ListaCancionesProps) {
  const [likesCount, setLikesCount] = useState<{ [key: string | number]: number }>({});

  const handleLike = (id: string | number) => {
    setLikesCount((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  if (canciones.length === 0) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#14151e', borderRadius: '12px', color: '#aaa', textAlign: 'center' }}>
        No hay canciones registradas en la base de datos.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: '20px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {canciones.map((cancion, index) => {
          const id = cancion.id || index;
          const imagen = cancion.portada_url || cancion.portadaUrl;
          const titulo = cancion.titulo || 'Sin título';
          const artista = cancion.artista || 'Artista desconocido';
          const numLikes = likesCount[id] || cancion.likes || 0;

          return (
            <div
              key={id}
              style={{
                backgroundColor: '#14151f',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #1f212d',
                boxSizing: 'border-box'
              }}
            >
              {/* RECUADRO NEGRO LIMPIO PARA LA PORTADA */}
              <div
                style={{
                  width: '100%',
                  height: '200px',
                  borderRadius: '12px',
                  backgroundColor: '#0a0a0f',
                  overflow: 'hidden',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {imagen && imagen.trim() !== '' ? (
                  <img
                    src={imagen}
                    alt={titulo}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : null}
              </div>

              {/* TÍTULO Y ARTISTA */}
              <h3 style={{ color: '#fff', fontSize: '16px', margin: '0 0 4px 0', textAlign: 'center', fontWeight: 'bold' }}>
                {titulo}
              </h3>

              <p style={{ color: '#8b8e9b', fontSize: '13px', margin: '0 0 12px 0', textAlign: 'center' }}>
                {artista}
              </p>

              {/* GÉNERO */}
              {cancion.genero && (
                <span
                  style={{
                    alignSelf: 'center',
                    backgroundColor: '#1f212e',
                    color: '#ff5500',
                    padding: '4px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginBottom: '14px'
                  }}
                >
                  {cancion.genero}
                </span>
              )}

              {/* BOTÓN "ME GUSTA" CON BORDE NARANJA Y FONDO TRANSPARENTE */}
              <button
                onClick={() => handleLike(id)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  backgroundColor: 'transparent',
                  color: '#ff3333',
                  border: '1px solid #ff5500',
                  borderRadius: '24px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
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
