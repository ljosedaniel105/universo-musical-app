import React from 'react';

export interface Cancion {
  id?: string | number;
  titulo?: string;
  artista?: string;
  genero?: string;
  portada_url?: string;
  portadaUrl?: string;
}

interface ListaCancionesProps {
  canciones?: Cancion[];
}

export default function ListaCanciones({ canciones = [] }: ListaCancionesProps) {
  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      {/* Muestra las canciones en cuadrícula hacia abajo */}
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
          const imagen = cancion.portada_url || cancion.portadaUrl || 'https://via.placeholder.com/200';
          const titulo = cancion.titulo || 'Sin título';
          const artista = cancion.artista || 'Artista desconocido';

          return (
            <div
              key={cancion.id || index}
              style={{
                backgroundColor: '#18181c',
                borderRadius: '12px',
                padding: '15px',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #23232a',
                boxSizing: 'border-box'
              }}
            >
              <img
                src={imagen}
                alt={titulo}
                style={{
                  width: '100%',
                  height: '180px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}
              />

              <h3 style={{ color: '#fff', fontSize: '16px', margin: '0 0 6px 0', textAlign: 'center' }}>
                {titulo}
              </h3>

              <p style={{ color: '#aaa', fontSize: '13px', margin: '0 0 10px 0', textAlign: 'center' }}>
                {artista}
              </p>

              {cancion.genero && (
                <span
                  style={{
                    alignSelf: 'center',
                    backgroundColor: '#25252e',
                    color: '#ff6600',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    marginBottom: '12px'
                  }}
                >
                  {cancion.genero}
                </span>
              )}

              <button
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#ff6600',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: 'auto'
                }}
              >
                ► Escuchar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
