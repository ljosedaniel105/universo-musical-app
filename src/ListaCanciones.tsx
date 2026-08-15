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
}

interface ListaCancionesProps {
  canciones?: Cancion[];
}

export default function ListaCanciones({ canciones = [] }: ListaCancionesProps) {
  const [cancionSonando, setCancionSonando] = useState<string | number | null>(null);

  if (canciones.length === 0) {
    return (
      <div style={{ padding: '24px', backgroundColor: '#161720', borderRadius: '12px', color: '#aaa', textAlign: 'center' }}>
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
          gap: '24px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {canciones.map((cancion, index) => {
          const id = cancion.id || index;
          const imagen = cancion.portada_url || cancion.portadaUrl;
          const audio = cancion.audio_url || cancion.audioUrl;
          const titulo = cancion.titulo || 'Sin título';
          const artista = cancion.artista || 'Artista desconocido';

          return (
            <div
              key={id}
              style={{
                backgroundColor: '#161720',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #222432',
                boxSizing: 'border-box'
              }}
            >
              {/* CONTENEDOR DE IMAGEN CON FALLBACK DE MÚSICA SI NO HAY PORTADA O ESTÁ ROTA */}
              <div style={{ width: '100%', height: '190px', borderRadius: '12px', overflow: 'hidden', marginBottom: '14px', backgroundColor: '#0d0e14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {imagen && imagen.trim() !== '' ? (
                  <img
                    src={imagen}
                    alt={titulo}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      const parent = img.parentElement;
                      if (parent) {
                        parent.innerHTML = '<span style="font-size: 44px; color: #3a3d52;">🎵</span>';
                      }
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '44px', color: '#3a3d52' }}>🎵</span>
                )}
              </div>

              {/* TÍTULO Y ARTISTA */}
              <h3 style={{ color: '#fff', fontSize: '17px', margin: '0 0 4px 0', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 'bold' }}>
                {titulo}
              </h3>

              <p style={{ color: '#8a8f9d', fontSize: '13px', margin: '0 0 12px 0', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {artista}
              </p>

              {/* ETIQUETA DE GÉNERO */}
              {cancion.genero && (
                <span
                  style={{
                    alignSelf: 'center',
                    backgroundColor: '#222432',
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

              {/* BOTÓN O REPRODUCTOR ORIGINAL */}
              {audio ? (
                <div style={{ marginTop: 'auto', width: '100%' }}>
                  <audio
                    controls
                    src={audio}
                    onPlay={() => setCancionSonando(id)}
                    style={{ width: '100%', height: '36px', borderRadius: '8px' }}
                  />
                </div>
              ) : (
                <button
                  onClick={() => alert(`Reproduciendo: ${titulo}`)}
                  style={{
                    width: '100%',
                    padding: '11px',
                    backgroundColor: '#ff5500',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '24px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    marginTop: 'auto'
                  }}
                >
                  ► Escuchar
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
