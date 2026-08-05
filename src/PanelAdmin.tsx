import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

export default function PanelAdmin() {
  const [canciones, setCanciones] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [tabActiva, setTabActiva] = useState<'canciones' | 'usuarios' | 'playlists'>('canciones');
  const [cargando, setCargando] = useState(true);

  const PORTADA_DEFAULT = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500';

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    
    // 1. Cargar Canciones
    const { data: dataCanciones } = await supabase.from('canciones').select('*');
    if (dataCanciones) setCanciones(dataCanciones);

    // 2. Cargar Usuarios
    const { data: dataUsuarios } = await supabase.from('perfiles').select('*');
    if (dataUsuarios) setUsuarios(dataUsuarios);

    // 3. Cargar Playlists
    const { data: dataPlaylists } = await supabase.from('playlists').select('*');
    if (dataPlaylists) setPlaylists(dataPlaylists);

    setCargando(false);
  };

  // Funciones de Eliminación
  const eliminarCancion = async (id: string, titulo: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la canción "${titulo}"?`)) {
      const { error } = await supabase.from('canciones').delete().eq('id', id);
      if (!error) {
        setCanciones(canciones.filter(c => c.id !== id));
      } else {
        alert('Error al eliminar canción: ' + error.message);
      }
    }
  };

  const eliminarUsuario = async (id: string, email: string) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario "${email}"?`)) {
      const { error } = await supabase.from('perfiles').delete().eq('id', id);
      if (!error) {
        setUsuarios(usuarios.filter(u => u.id !== id));
      } else {
        alert('Error al eliminar usuario: ' + error.message);
      }
    }
  };

  const eliminarPlaylist = async (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la playlist "${nombre}"?`)) {
      const { error } = await supabase.from('playlists').delete().eq('id', id);
      if (!error) {
        setPlaylists(playlists.filter(p => p.id !== id));
      } else {
        alert('Error al eliminar playlist: ' + error.message);
      }
    }
  };

  if (cargando) {
    return (
      <div style={{ color: 'white', textAlign: 'center', padding: '40px', fontSize: '18px' }}>
        🔄 Cargando panel de administración...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', color: 'white' }}>
      
      {/* ENCABEZADO */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ color: '#ff6b00', margin: 0, fontSize: '28px' }}>🔑 Panel de Control Admin</h2>
        <p style={{ color: '#aaa', margin: '5px 0 0 0', fontSize: '14px' }}>
          Gestión integral de la comunidad y contenido de Universo Musical.
        </p>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        
        <div style={{ backgroundColor: '#18181c', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a30' }}>
          <p style={{ color: '#aaa', margin: 0, fontSize: '13px' }}>🎵 CANCIONES</p>
          <h3 style={{ fontSize: '32px', margin: '10px 0 0 0', color: '#ff6b00' }}>{canciones.length}</h3>
        </div>

        <div style={{ backgroundColor: '#18181c', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a30' }}>
          <p style={{ color: '#aaa', margin: 0, fontSize: '13px' }}>👥 USUARIOS</p>
          <h3 style={{ fontSize: '32px', margin: '10px 0 0 0', color: '#00d26a' }}>{usuarios.length}</h3>
        </div>

        <div style={{ backgroundColor: '#18181c', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a30' }}>
          <p style={{ color: '#aaa', margin: 0, fontSize: '13px' }}>📜 PLAYLISTS</p>
          <h3 style={{ fontSize: '32px', margin: '10px 0 0 0', color: '#a855f7' }}>{playlists.length}</h3>
        </div>

      </div>

      {/* PESTAÑAS DE NAVEGACIÓN */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #2a2a30', paddingBottom: '10px' }}>
        <button
          onClick={() => setTabActiva('canciones')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: tabActiva === 'canciones' ? '#ff6b00' : 'transparent',
            color: tabActiva === 'canciones' ? 'white' : '#aaa',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          🎵 Canciones ({canciones.length})
        </button>

        <button
          onClick={() => setTabActiva('usuarios')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: tabActiva === 'usuarios' ? '#ff6b00' : 'transparent',
            color: tabActiva === 'usuarios' ? 'white' : '#aaa',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          👥 Usuarios ({usuarios.length})
        </button>

        <button
          onClick={() => setTabActiva('playlists')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: tabActiva === 'playlists' ? '#ff6b00' : 'transparent',
            color: tabActiva === 'playlists' ? 'white' : '#aaa',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          📜 Playlists ({playlists.length})
        </button>
      </div>

      {/* TAB 1: CANCIONES */}
      {tabActiva === 'canciones' && (
        <div style={{ backgroundColor: '#18181c', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a30' }}>
          {canciones.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>No hay canciones registradas.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {canciones.map((cancion) => {
                let portada = cancion.portada_url || cancion.url_portada || PORTADA_DEFAULT;
                return (
                  <div 
                    key={cancion.id} 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0d0d0f', padding: '12px 16px', borderRadius: '10px', border: '1px solid #2a2a30' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <img 
                        src={portada} 
                        alt={cancion.titulo} 
                        onError={(e: any) => { e.target.src = PORTADA_DEFAULT; }}
                        style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }} 
                      />
                      <div>
                        <h4 style={{ margin: 0, color: 'white', fontSize: '15px' }}>{cancion.titulo}</h4>
                        <p style={{ margin: '2px 0 0 0', color: '#aaa', fontSize: '13px' }}>{cancion.artista}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => eliminarCancion(cancion.id, cancion.titulo)}
                      style={{ backgroundColor: '#2a1515', color: '#ff4d4d', border: '1px solid #4a1e1e', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USUARIOS */}
      {tabActiva === 'usuarios' && (
        <div style={{ backgroundColor: '#18181c', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a30' }}>
          {usuarios.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>No hay usuarios registrados.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {usuarios.map((usr) => {
                const apodo = usr.apodo || usr.nombre || usr.username || 'Sin Apodo';
                return (
                  <div 
                    key={usr.id} 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0d0d0f', padding: '12px 16px', borderRadius: '10px', border: '1px solid #2a2a30' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#26262e', color: '#ff6b00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                        👤
                      </div>
                      <div>
                        <h4 style={{ margin: 0, color: 'white', fontSize: '15px' }}>{usr.email}</h4>
                        <p style={{ margin: '2px 0 0 0', color: '#ff6b00', fontSize: '13px', fontWeight: 'bold' }}>
                          🏷️ Apodo: {apodo}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => eliminarUsuario(usr.id, usr.email)}
                      style={{ backgroundColor: '#2a1515', color: '#ff4d4d', border: '1px solid #4a1e1e', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      🗑️ Eliminar Usuario
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PLAYLISTS */}
      {tabActiva === 'playlists' && (
        <div style={{ backgroundColor: '#18181c', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a30' }}>
          {playlists.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>No hay playlists creadas aún.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {playlists.map((pl) => (
                <div 
                  key={pl.id} 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0d0d0f', padding: '12px 16px', borderRadius: '10px', border: '1px solid #2a2a30' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#26262e', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>
                      📜
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: 'white', fontSize: '15px' }}>{pl.nombre || pl.titulo || 'Playlist Sin Nombre'}</h4>
                      <p style={{ margin: '2px 0 0 0', color: '#aaa', fontSize: '13px' }}>
                        {pl.descripcion ? pl.descripcion : 'Creada por usuario'}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => eliminarPlaylist(pl.id, pl.nombre || 'Playlist')}
                    style={{ backgroundColor: '#2a1515', color: '#ff4d4d', border: '1px solid #4a1e1e', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    🗑️ Eliminar Playlist
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
