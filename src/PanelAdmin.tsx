import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

export function PanelAdmin() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [canciones, setCanciones] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [pestanaAdmin, setPestanaAdmin] = useState<'usuarios' | 'canciones' | 'playlists'>('usuarios');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // Intentar cargar usuarios de la tabla perfiles
      const { data: dataUsuarios } = await supabase.from('perfiles').select('*');
      
      // Cargar canciones y playlists
      const { data: dataCanciones } = await supabase.from('canciones').select('*');
      const { data: dataPlaylists } = await supabase.from('playlists').select('*');

      setUsuarios(dataUsuarios && dataUsuarios.length > 0 ? dataUsuarios : [
        { id: 'admin-1', email: 'ljosedaniel105@gmail.com', nombre_usuario: 'Administrador' }
      ]);
      setCanciones(dataCanciones || []);
      setPlaylists(dataPlaylists || []);
    } catch (e) {
      console.error("Error al cargar datos:", e);
    } finally {
      setCargando(false);
    }
  };

  const eliminarElemento = async (tabla: string, id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro?')) return;
    
    try {
      await supabase.from(tabla).delete().eq('id', id);
      cargarDatos();
    } catch (e) {
      alert('Error al eliminar');
    }
  };

  if (cargando) return <div style={{ color: 'white', padding: '20px' }}>Cargando datos del panel...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', border: '1px solid #ff6b0033', borderRadius: '16px', padding: '24px', backgroundColor: '#121212' }}>
      <h2 style={{ textAlign: 'center', color: '#ff6b00', fontSize: '22px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        ⚙️ Panel de Control Administrador
      </h2>

      {/* PESTAÑAS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
        <button 
          onClick={() => setPestanaAdmin('usuarios')}
          style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: pestanaAdmin === 'usuarios' ? '#ff6b00' : '#222222', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
        >
          🧑‍🤝‍🧑 Usuarios ({usuarios.length})
        </button>
        <button 
          onClick={() => setPestanaAdmin('canciones')}
          style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: pestanaAdmin === 'canciones' ? '#ff6b00' : '#222222', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
        >
          🎵 Canciones ({canciones.length})
        </button>
        <button 
          onClick={() => setPestanaAdmin('playlists')}
          style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: pestanaAdmin === 'playlists' ? '#ff6b00' : '#222222', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
        >
          📜 Playlists ({playlists.length})
        </button>
      </div>

      {/* USUARIOS */}
      {pestanaAdmin === 'usuarios' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {usuarios.map((u) => (
            <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#18181b', padding: '14px 18px', borderRadius: '10px', border: '1px solid #222222' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold' }}>👤 {u.nombre_usuario || 'Usuario'} <span style={{ color: '#ff6b00', fontSize: '13px' }}>({u.email || u.id})</span></p>
              </div>
              {u.id !== 'admin-1' && (
                <button onClick={() => eliminarElemento('perfiles', u.id)} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Eliminar 🗑️
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CANCIONES */}
      {pestanaAdmin === 'canciones' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {canciones.map((c) => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#18181b', padding: '14px 18px', borderRadius: '10px', border: '1px solid #222222' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold' }}>🎵 {c.titulo} - <span style={{ color: '#a1a1aa' }}>{c.artista}</span></p>
              </div>
              <button onClick={() => eliminarElemento('canciones', c.id)} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Eliminar 🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {/* PLAYLISTS */}
      {pestanaAdmin === 'playlists' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {playlists.map((p) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#18181b', padding: '14px 18px', borderRadius: '10px', border: '1px solid #222222' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold' }}>📜 {p.nombre}</p>
              </div>
              <button onClick={() => eliminarElemento('playlists', p.id)} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Eliminar 🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PanelAdmin;
