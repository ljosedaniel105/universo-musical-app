import React, { useEffect, useState } from 'react';
// @ts-ignore
import { supabase } from './supabase';

export default function PanelAdmin() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [canciones, setCanciones] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [pestana, setPestana] = useState<'usuarios' | 'canciones' | 'playlists'>('usuarios');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    // 1. Cargar Usuarios
    const { data: dataUsuarios } = await supabase.from('perfiles').select('*');
    if (dataUsuarios) setUsuarios(dataUsuarios);

    // 2. Cargar Canciones
    const { data: dataCanciones } = await supabase.from('canciones').select('*');
    if (dataCanciones) setCanciones(dataCanciones);

    // 3. Cargar Playlists
    const { data: dataPlaylists } = await supabase.from('playlists').select('*');
    if (dataPlaylists) setPlaylists(dataPlaylists);
  };

  // --- ELIMINAR USUARIO (Usando la Edge Function) ---
  const eliminarUsuario = async (userId: string) => {
    if (!confirm("¿Seguro que deseas eliminar definitivamente a este usuario?")) return;

    const { error } = await supabase.functions.invoke('delete-user', {
      body: { userId }
    });

    if (error) {
      alert("Error al eliminar usuario: " + error.message);
    } else {
      alert("Usuario eliminado por completo.");
      cargarDatos();
    }
  };

  // --- ELIMINAR CANCIÓN ---
  const eliminarCancion = async (cancionId: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta canción?")) return;

    const { error } = await supabase.from('canciones').delete().eq('id', cancionId);

    if (error) {
      alert("Error al eliminar canción: " + error.message);
    } else {
      alert("Canción eliminada exitosamente.");
      cargarDatos();
    }
  };

  // --- ELIMINAR PLAYLIST ---
  const eliminarPlaylist = async (playlistId: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta playlist?")) return;

    const { error } = await supabase.from('playlists').delete().eq('id', playlistId);

    if (error) {
      alert("Error al eliminar playlist: " + error.message);
    } else {
      alert("Playlist eliminada exitosamente.");
      cargarDatos();
    }
  };

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h2 style={{ color: '#ff6b00', marginBottom: '20px' }}>Panel de Administración</h2>

      {/* Pestañas de Navegación del Admin */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <button 
          onClick={() => setPestana('usuarios')}
          style={{
            padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
            backgroundColor: pestana === 'usuarios' ? '#ff6b00' : '#1c1c22', color: 'white'
          }}
        >
          👤 Usuarios ({usuarios.length})
        </button>
        <button 
          onClick={() => setPestana('canciones')}
          style={{
            padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
            backgroundColor: pestana === 'canciones' ? '#ff6b00' : '#1c1c22', color: 'white'
          }}
        >
          🎵 Canciones ({canciones.length})
        </button>
        <button 
          onClick={() => setPestana('playlists')}
          style={{
            padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
            backgroundColor: pestana === 'playlists' ? '#ff6b00' : '#1c1c22', color: 'white'
          }}
        >
          📜 Playlists ({playlists.length})
        </button>
      </div>

      {/* SECCIÓN USUARIOS */}
      {pestana === 'usuarios' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {usuarios.length === 0 ? <p style={{ color: '#888' }}>No hay usuarios registrados.</p> : (
            usuarios.map((u) => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#18181c', padding: '14px 20px', borderRadius: '10px', border: '1px solid #2a2a30' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{u.apodo || 'Sin apodo'}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{u.email}</p>
                </div>
                <button 
                  onClick={() => eliminarUsuario(u.id)}
                  style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Eliminar
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* SECCIÓN CANCIONES */}
      {pestana === 'canciones' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {canciones.length === 0 ? <p style={{ color: '#888' }}>No hay canciones subidas aún.</p> : (
            canciones.map((c) => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#18181c', padding: '14px 20px', borderRadius: '10px', border: '1px solid #2a2a30' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={c.portada_url || c.url_portada || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500'} alt={c.titulo} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{c.titulo}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#ff6b00' }}>{c.artista}</p>
                  </div>
                </div>
                <button 
                  onClick={() => eliminarCancion(c.id)}
                  style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Eliminar
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* SECCIÓN PLAYLISTS */}
      {pestana === 'playlists' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {playlists.length === 0 ? <p style={{ color: '#888' }}>No hay playlists creadas aún.</p> : (
            playlists.map((pl) => (
              <div key={pl.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#18181c', padding: '14px 20px', borderRadius: '10px', border: '1px solid #2a2a30' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>🎵 {pl.nombre}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>ID Creador: {pl.usuario_id}</p>
                </div>
                <button 
                  onClick={() => eliminarPlaylist(pl.id)}
                  style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Eliminar
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
