import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

export function PanelAdmin() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [canciones, setCanciones] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [pestana, setPestana] = useState<'usuarios' | 'canciones' | 'playlists'>('usuarios');
  const [cargando, setCargando] = useState(true);

  const cargarDatosAdmin = async () => {
    setCargando(true);
    try {
      const { data: dataUsuarios, error: errUsers } = await supabase
        .from('usuarios_registrados')
        .select('*')
        .order('created_at', { ascending: false });

      if (errUsers) console.error('Error usuarios:', errUsers.message);
      setUsuarios(dataUsuarios || []);

      const { data: dataCanciones } = await supabase.from('canciones').select('*');
      setCanciones(dataCanciones || []);

      const { data: dataPlaylists } = await supabase.from('playlists').select('*');
      setPlaylists(dataPlaylists || []);
    } catch (err: any) {
      console.error('Error al cargar datos:', err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosAdmin();
  }, []);

  const eliminarUsuario = async (userId: string, email: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente al usuario "${email}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.rpc('eliminar_usuario_admin', { user_id: userId });

      if (error) {
        alert('Error al eliminar usuario: ' + error.message);
      } else {
        alert(`Usuario ${email} eliminado correctamente.`);
        cargarDatosAdmin();
      }
    } catch (err: any) {
      alert('Error inesperado: ' + err.message);
    }
  };

  const eliminarCancion = async (id: number) => {
    if (!window.confirm('¿Eliminar esta canción?')) return;
    await supabase.from('canciones').delete().eq('id', id);
    cargarDatosAdmin();
  };

  const eliminarPlaylist = async (id: number) => {
    if (!window.confirm('¿Eliminar esta playlist?')) return;
    await supabase.from('playlists').delete().eq('id', id);
    cargarDatosAdmin();
  };

  return (
    <div style={{
      background: '#141414',
      border: '1px solid #ff6600',
      borderRadius: '16px',
      padding: '20px',
      margin: '20px auto',
      maxWidth: '900px',
      boxShadow: '0 0 20px rgba(255,102,0,0.2)'
    }}>
      <h2 style={{ color: '#ff6600', textAlign: 'center', marginTop: 0 }}>
        ⚙️ Panel de Control Administrador
      </h2>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setPestana('usuarios')}
          style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: pestana === 'usuarios' ? '#ff6600' : '#222', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
        >
          👥 Usuarios ({usuarios.length})
        </button>
        <button
          onClick={() => setPestana('canciones')}
          style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: pestana === 'canciones' ? '#ff6600' : '#222', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🎵 Canciones ({canciones.length})
        </button>
        <button
          onClick={() => setPestana('playlists')}
          style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: pestana === 'playlists' ? '#ff6600' : '#222', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
        >
          📜 Playlists ({playlists.length})
        </button>
      </div>

      {cargando ? (
        <p style={{ textAlign: 'center', color: '#aaa' }}>Cargando registros del sistema...</p>
      ) : (
        <div>
          {pestana === 'usuarios' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#ccc', textAlign: 'center' }}>
                📋 Lista de Usuarios Registrados
              </h3>
              {usuarios.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#777' }}>No se encontraron usuarios.</p>
              ) : (
                usuarios.map((u) => (
                  <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#222', padding: '12px 15px', borderRadius: '8px', borderLeft: '4px solid #ff6600' }}>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.05rem' }}>
                        👤 {u.apodo || 'Sin apodo'} <span style={{ color: '#ff6600', fontWeight: 'normal', fontSize: '0.9rem' }}>({u.email})</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '3px' }}>
                        Registrado el: {new Date(u.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <button
                      onClick={() => eliminarUsuario(u.id, u.email)}
                      style={{
                        background: '#cc0000',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.85rem'
                      }}
                    >
                      Eliminar 🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {pestana === 'canciones' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {canciones.map((c) => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#222', padding: '10px 15px', borderRadius: '8px' }}>
                  <span>🎵 {c.titulo} - <strong style={{ color: '#ff6600' }}>{c.artista}</strong></span>
                  <button onClick={() => eliminarCancion(c.id)} style={{ background: '#cc0000', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                    Eliminar 🗑️
                  </button>
                </div>
              ))}
            </div>
          )}

          {pestana === 'playlists' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {playlists.map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#222', padding: '10px 15px', borderRadius: '8px' }}>
                  <span>📜 Playlist: <strong>{p.nombre}</strong></span>
                  <button onClick={() => eliminarPlaylist(p.id)} style={{ background: '#cc0000', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                    Eliminar 🗑️
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