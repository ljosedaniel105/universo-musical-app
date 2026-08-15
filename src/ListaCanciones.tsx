import React from 'react';

export interface Cancion {
  id?: string | number;
  titulo: string;
  artista: string;
  genero?: string;
  portada_url?: string;
  portadaUrl?: string;
  likes?: number;
}

interface ListaCancionesProps {
  canciones?: Cancion[];
}

export default function ListaCanciones({ canciones = [] }: ListaCancionesProps) {
  return (
    <div style={{ width: '100%', padding: '20px', boxSizing: 'border-box' }}>
      {/* GRILLA DE CANCIONES QUE BAJA VERTICALMENTE */}
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
          
          return (
            <div
              key={cancion.id || index}
              style={{
                backgroundColor: '#181818',
                borderRadius: '12px',
                padding: '15px',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box'
              }}
            >
              <img
                src={imagen}
                alt={cancion.titulo}
                style={{
                  width: '100%',
                  height: '180px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}
              />

              <h3 style={{ color: '#fff', fontSize: '18px', margin: '0 0 4px 0', textAlign: 'center' }}>
                {cancion.titulo}
              </h3>

              <p style={{ color: '#aaa', fontSize: '14px', margin: '0 0 10px 0', textAlign: 'center' }}>
                {cancion.artista}
              </p>

              {cancion.genero && (
                <span
                  style={{
                    alignSelf: 'center',
                    backgroundColor: '#2a2a2a',
                    color: '#ff6600',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
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
