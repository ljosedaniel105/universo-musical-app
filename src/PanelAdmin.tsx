import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

export default function PanelAdmin() {
  const [canciones, setCanciones] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [tabActiva, setTabActiva] = useState<'canciones' | 'usuarios'>('canciones');
  const [cargando, setCargando] = useState(true);

  const PORTADA_DEFAULT = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500';

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    
    // Cargar Canciones
    const { data: dataCanciones } = await supabase.from('canciones').select('*');
    if (dataCanciones) setCanciones(dataCanciones);

    // Cargar Usuarios
    const { data: dataUsuarios } = await supabase.from('perfiles').select('*');
    if (dataUsuarios) setUsuarios(dataUsuarios);

    setCargando(false);
  };

  const eliminarCancion = async (id: string, titulo: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${titulo}"?`)) {
      const { error } = await supabase.from('canciones').delete().eq('id', id);
      if (!error) {
        setCanciones(canciones.filter(c => c.id !== id));
      } else {
        alert('Error al eliminar: ' + error.message);
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
          Gestiona las canciones, usuarios y métricas generales de Universo Musical.
        </p>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        
        <div style={{ backgroundColor: '#18181c', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a30' }}>
          <p style={{ color: '#aaa', margin: 0, fontSize: '13px' }}>🎵 CANCIONES TOTALES</p>
          <h3 style={{ fontSize: '32px', margin: '10px 0 0 0', color: '#ff6b00' }}>{canciones.length}</h3>
        </div>

        <div style={{ backgroundColor: '#18181c', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a30' }}>
          <p style={{ color: '#aaa', margin: 0, fontSize: '13px' }}>👥 USUARIOS REGISTRADOS</p>
          <h3 style={{ fontSize: '32px', margin: '10px 0 0 0', color: '#00d26a' }}>{usuarios.length}</h3>
        </div>

        <div style={{ backgroundColor: '#18181c', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a30' }}>
          <p style={{ color: '#aaa', margin: 0, fontSize: '13px' }}>⚡ ESTADO DEL SISTEMA</p>
          <h3 style={{ fontSize: '20px', margin: '15px 0 0 0', color: '#4d94ff' }}>🟢 En Línea</h3>
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
          🎵 Gestión de Canciones ({canciones.length})
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
          👥 Lista de Usuarios ({usuarios.length})
        </button>
      </div>

      {/* CONTENIDO 1: CANCIONES */}
      {tabActiva === 'canciones' && (
        <div style={{ backgroundColor: '#18181c', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a30' }}>
          {canciones.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>No hay canciones registradas en la base de datos.</p>
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
                        <p style={{ margin: '2px 0 0 0', color: '#aaa', fontSize: '13px' }}>{cancion.artista} • <span style={{ color: '#ff6b00' }}>{cancion.genero || 'Varios'}</span></p>
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

      {/* CONTENIDO 2: USUARIOS */}
      {tabActiva === 'usuarios' && (
        <div style={{ backgroundColor: '#18181c', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a30' }}>
          {usuarios.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>No hay perfiles de usuario registrados aún.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {usuarios.map((usr) => (
                <div 
                  key={usr.id} 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0d0d0f', padding: '12px 16px', borderRadius: '8px', border: '1px solid #2a2a30' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#26262e', color: '#ff6b00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      👤
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: 'white', fontSize: '14px' }}>{usr.email}</h4>
                      <p style={{ margin: 0, color: '#888', fontSize: '12px' }}>ID: {usr.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <span style={{ backgroundColor: '#1e261e', color: '#00d26a', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                    Activo
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
