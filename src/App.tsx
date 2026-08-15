import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import ListaCanciones from './ListaCanciones';
import SubirCancion from './SubirCancion';
import Auth from './Auth';
import PanelAdmin from './PanelAdmin';

function VistaPlaylists() {
  return (
    <div style={{ color: '#fff', padding: '20px' }}>
      <h2 style={{ color: '#ff5500', marginBottom: '15px' }}>Playlists</h2>
      <p style={{ color: '#aaa' }}>Aún no tienes listas de reproducción creadas.</p>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [vistaActual, setVistaActual] = useState<'descubrir' | 'playlists' | 'subir' | 'admin'>('descubrir');
  const [canciones, setCanciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const cargarCanciones = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from('canciones')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error("Error al cargar canciones:", error);
      } else {
        setCanciones(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCanciones();
  }, [vistaActual]);

  if (!session) {
    return <Auth />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: '#090a0e', color: '#fff', margin: 0, padding: 0, overflowX: 'hidden', boxSizing: 'border-box' }}>
      
      {/* MENÚ LATERAL */}
      <aside style={{ width: '250px', backgroundColor: '#0f1016', padding: '25px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid #1a1b24', flexShrink: 0, boxSizing: 'border-box' }}>
        <div>
          {/* LOGO ESFERA AZUL ORIGINAL */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '35px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #00d2ff 0%, #0040ff 60%, #ff5500 100%)',
              boxShadow: '0 0 12px rgba(0, 150, 255, 0.8)',
              border: '2px solid #ff5500',
              flexShrink: 0
            }} />
            <h2 style={{ color: '#ff5500', fontSize: '20px', margin: 0, fontWeight: 'bold' }}>
              Universo Musical
            </h2>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => setVistaActual('descubrir')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: vistaActual === 'descubrir' ? '#ff5500' : 'transparent',
                color: vistaActual === 'descubrir' ? '#ffffff' : '#8f94a6',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: 'bold',
                fontSize: '15px'
              }}
            >
              🏠 Descubrir
            </button>

            <button
              onClick={() => setVistaActual('playlists')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: vistaActual === 'playlists' ? '#ff5500' : 'transparent',
                color: vistaActual === 'playlists' ? '#ffffff' : '#8f94a6',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: 'bold',
                fontSize: '15px'
              }}
            >
              📜 Playlists
            </button>

            <button
              onClick={() => setVistaActual('subir')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: vistaActual === 'subir' ? '#ff5500' : 'transparent',
                color: vistaActual === 'subir' ? '#ffffff' : '#8f94a6',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: 'bold',
                fontSize: '15px'
              }}
            >
              📤 Subir Canción
            </button>

            <button
              onClick={() => setVistaActual('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: vistaActual === 'admin' ? '#ff5500' : 'transparent',
                color: vistaActual === 'admin' ? '#ffffff' : '#8f94a6',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: 'bold',
                fontSize: '15px'
              }}
            >
              🛡️ Panel Admin
            </button>
          </nav>
        </div>

        <div>
          <p style={{ fontSize: '12px', color: '#666a7a', margin: '0 0 12px 0', wordBreak: 'break-all' }}>
            👤 {session.user?.email}
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#181922',
              color: '#ff4444',
              border: '1px solid #282936',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', boxSizing: 'border-box' }}>
        {vistaActual === 'descubrir' && (
          <div>
            <h1 style={{ margin: '0 0 28px 0', color: '#fff', fontSize: '32px', fontWeight: 'bold' }}>Descubrir</h1>
            {cargando ? (
              <p style={{ color: '#aaa' }}>Cargando canciones...</p>
            ) : (
              <ListaCanciones canciones={canciones} />
            )}
          </div>
        )}

        {vistaActual === 'playlists' && <VistaPlaylists />}

        {vistaActual === 'subir' && (
          <SubirCancion alSubirExitoso={() => {
            cargarCanciones();
            setVistaActual('descubrir');
          }} />
        )}

        {vistaActual === 'admin' && <PanelAdmin />}
      </main>

    </div>
  );
}
