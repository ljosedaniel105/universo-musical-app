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
  if (canciones.length === 0) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#18181f', borderRadius: '12px', color: '#aaa', textAlign: 'center' }}>
        No hay canciones registradas en la base de datos. ¡Haz clic en "Subir Canción" para agregar la primera!
      </div>
    );
  }

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      {/* GRILLA RESPONSIVA: LAS TARJETAS BAJAN VERTICALMENTE EN FILAS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: '20px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {canciones.map((cancion, index) => {
          const imagen = cancion.portada_url || cancion.portadaUrl || 'https://via.placeholder.com/200?text=Sin+Imagen';
          const titulo = cancion.titulo || 'Título no disponible';
          const artista = cancion.artista || 'Artista no disponible';

          return (
            <div
              key={cancion.id || index}
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
                style={{
                  width: '100%',
                  height: '180px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  backgroundColor: '#0d0d11'
                }}
              />

              <h3 style={{ color: '#fff', fontSize: '16px', margin: '0 0 6px 0', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {titulo}
              </h3>

              <p style={{ color: '#aaa', fontSize: '13px', margin: '0 0 12px 0', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                    marginBottom: '14px'
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
