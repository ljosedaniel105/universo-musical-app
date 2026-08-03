import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

export function Playlists({ usuario }: { usuario: any }) {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [nombreNueva, setNombreNueva] = useState('');
  const [cargando, setCargando] = useState(false);

  const cargarMisPlaylists = async () => {
    if (!usuario) return;
    const { data } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', usuario.id);
    
    setPlaylists(data || []);
  };

  useEffect(() => {
    cargarMisPlaylists();
  }, [usuario]);

  const crearPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreNueva) return;
    setCargando(true);

    const { error } = await supabase.from('playlists').insert([
      {
        nombre: nombreNueva,
        user_id: usuario.id,
      },
    ]);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      setNombreNueva('');
      cargarMisPlaylists();
    }
    setCargando(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', background: '#181818', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
      <h3 style={{ color: '#ff6600', marginTop: 0 }}>🎧 Mis Playlists Privadas</h3>

      <form onSubmit={crearPlaylist} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Nombre de la nueva playlist..."
          value={nombreNueva}
          onChange={(e) => setNombreNueva(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #444', background: '#0d0d0d', color: '#fff' }}
        />
        <button
          type="submit"
          disabled={cargando}
          style={{ background: '#ff6600', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Crear Playlist
        </button>
      </form>

      {playlists.length === 0 ? (
        <p style={{ color: '#777', fontSize: '0.9rem' }}>No tienes playlists privadas creadas.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
          {playlists.map((p) => (
            <div key={p.id} style={{ background: '#222', padding: '15px', borderRadius: '10px', border: '1px solid #ff6600', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '5px' }}>🎶</div>
              <strong style={{ color: '#fff' }}>{p.nombre}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}