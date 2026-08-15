import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import ListaCanciones from './ListaCanciones';
import SubirCancion from './SubirCancion';
import Auth from './Auth';
import PanelAdmin from './PanelAdmin';

function VistaPlaylists() {
  return (
    <div style={{ color: '#fff', padding: '20px' }}>
      <h2 style={{ color: '#ff6600', marginBottom: '15px' }}>Tus Playlists</h2>
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
        console.error("Error al cargar canciones de Supabase:", error);
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
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: '#0d0d11', color: '#fff', margin: 0, padding: 0, overflowX: 'hidden', boxSizing: 'border-box' }}>
      
      {/* MENÚ LATERAL CON LOGO */}
      <aside style={{ width: '250px', backgroundColor: '#141419', padding: '25px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid #22222a', flexShrink: 0, boxSizing: 'border-box' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '35px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#ff6600', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              🌌
            </div>
            <h2 style={{ color: '#ff6600', fontSize: '20px', margin: 0, fontWeight: 'bold' }}>
              Universo Musical
            </h2>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => setVistaActual('descubrir')}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 15px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: vistaActual === 'descubrir' ? '#ff6600' : 'transparent',
                color: vistaActual === 'descubrir' ? '#fff' : '#aaa',
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
                display: 'block',
                width: '100%',
                padding: '12px 15px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: vistaActual === 'playlists' ? '#ff6600' : 'transparent',
                color: vistaActual === 'playlists' ? '#fff' : '#aaa',
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
                display: 'block',
                width: '100%',
                padding: '12px 15px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: vistaActual === 'subir' ? '#ff6600' : 'transparent',
                color: vistaActual === 'subir' ? '#fff' : '#aaa',
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
                display: 'block',
                width: '100%',
                padding: '12px 15px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: vistaActual === 'admin' ? '#ff6600' : 'transparent',
                color: vistaActual === 'admin' ? '#fff' : '#aaa',
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
          <p style={{ fontSize: '12px', color: '#888', margin: '0 0 10px 0', wordBreak: 'break-all' }}>
            👤 {session.user?.email}
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#251515',
              color: '#ff4444',
              border: '1px solid #441515',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto', boxSizing: 'border-box' }}>
        {vistaActual === 'descubrir' && (
          <div>
            <h1 style={{ margin: '0 0 25px 0', color: '#fff', fontSize: '28px' }}>Descubrir</h1>
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
