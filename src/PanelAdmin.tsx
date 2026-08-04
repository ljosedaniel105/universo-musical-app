import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

export default function PanelAdmin() {
  const [tabActual, setTabActual] = useState<'usuarios' | 'canciones'>('usuarios');
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [canciones, setCanciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    // Cargar Perfiles/Usuarios
    const { data: dataUsuarios } = await supabase.from('perfiles').select('*');
    if (dataUsuarios) setUsuarios(dataUsuarios);

    // Cargar Canciones
    const { data: dataCanciones } = await supabase.from('canciones').select('*');
    if (dataCanciones) setCanciones(dataCanciones);

    setCargando(false);
  };

  const eliminarUsuario = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario de la lista?')) {
      const { error } = await supabase.from('perfiles').delete().eq('id', id);
      if (error) {
        alert('Error al eliminar: ' + error.message);
      } else {
        alert('Usuario eliminado con éxito');
        cargarDatos();
      }
    }
  };

  const eliminarCancion = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta canción?')) {
      const { error } = await supabase.from('canciones').delete().eq('id', id);
      if (error) {
        alert('Error al eliminar canción: ' + error.message);
      } else {
        alert('Canción eliminada');
        cargarDatos();
      }
    }
  };

  if (cargando) return <div style={{ color: 'white' }}>Cargando panel...</div>;

  return (
    <div style={{ backgroundColor: '#1a1a1e', padding: '25px', borderRadius: '16px', border: '1px solid #2a2a30' }}>
      <h2 style={{ color: '#ff6b00', marginTop: 0 }}>⚙️ Panel de Control Administrador</h2>

      {/* PESTAÑAS */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <button 
          onClick={() => setTabActual('usuarios')}
          style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: tabActual === 'usuarios' ? '#ff6b00' : '#2a2a30', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
        >
          👥 Usuarios ({usuarios.length})
        </button>
        <button 
          onClick={() => setTabActual('canciones')}
          style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: tabActual === 'canciones' ? '#ff6b00' : '#2a2a30', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
        >
          🎵 Canciones ({canciones.length})
        </button>
      </div>

      {/* VISTA USUARIOS */}
      {tabActual === 'usuarios' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {usuarios.length === 0 ? (
            <p style={{ color: '#aaa' }}>No hay usuarios registrados aún en la tabla de perfiles.</p>
          ) : (
            usuarios.map((u) => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#121214', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', color: 'white' }}>👤 {u.nombre_usuario || 'Usuario'}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{u.email}</p>
                </div>
                <button 
                  onClick={() => eliminarUsuario(u.id)}
                  style={{ backgroundColor: '#4a1e1e', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  🗑️ Eliminar
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* VISTA CANCIONES */}
      {tabActual === 'canciones' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {canciones.map((c) => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#121214', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={c.url_portada} alt={c.titulo} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', color: 'white' }}>{c.titulo}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{c.artista}</p>
                </div>
              </div>
              <button 
                onClick={() => eliminarCancion(c.id)}
                style={{ backgroundColor: '#4a1e1e', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                🗑️ Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
