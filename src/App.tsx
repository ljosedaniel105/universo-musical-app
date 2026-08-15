import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import ListaCanciones from './ListaCanciones';
import SubirCancion from './SubirCancion';
import Auth from './Auth';
import Playlists from './Playlists';
import PanelAdmin from './PanelAdmin';
import './App.css';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [vistaActual, setVistaActual] = useState<'descubrir' | 'playlists' | 'subir' | 'admin'>('descubrir');
  const [canciones, setCanciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // Comprobar la sesión activa de Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cargar las canciones desde Supabase
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
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: '#0b0b0d', color: '#fff', overflowX: 'hidden' }}>
      
      {/* MENU LATERAL */}
      <aside style={{ width: '240px', backgroundColor: '#121215', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid #1f1f23', flexShrink: 0 }}>
        <div>
          <h2 style={{ color: '#ff6600', fontSize: '20px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🌌 Universo Musical
          </h2>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => setVistaActual('descubrir')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: vistaActual === 'descubrir' ? '#1f1f23' : 'transparent',
                color: vistaActual === 'descubrir' ? '#ff6600' : '#aaa',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: 'bold'
              }}
            >
              🏠 Descubrir
            </button>

            <button
              onClick={() => setVistaActual('playlists')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: vistaActual === 'playlists' ? '#1f1f23' : 'transparent',
                color: vistaActual === 'playlists' ? '#ff6600' : '#aaa',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: 'bold'
              }}
            >
              📜 Playlists
            </button>

            <button
              onClick={() => setVistaActual('subir')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: vistaActual === 'subir' ? '#1f1f23' : 'transparent',
                color: vistaActual === 'subir' ? '#ff6600' : '#aaa',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: 'bold'
              }}
            >
              📤 Subir Canción
            </button>

            <button
              onClick={() => setVistaActual('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: vistaActual === 'admin' ? '#1f1f23' : 'transparent',
                color: vistaActual === 'admin' ? '#ff6600' : '#aaa',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: 'bold'
              }}
            >
              🛡️ Panel Admin
            </button>
          </nav>
        </div>

        <div>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px', wordBreak: 'break-all' }}>
            👤 {session.user?.email}
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#222',
              color: '#ff4444',
              border: 'none',
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
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto', overflowX: 'hidden' }}>
        {vistaActual === 'descubrir' && (
          <div>
            <h1 style={{ marginBottom: '20px', color: '#fff' }}>Descubrir</h1>
            {cargando ? (
              <p style={{ color: '#aaa' }}>Cargando canciones...</p>
            ) : canciones.length === 0 ? (
              <p style={{ color: '#aaa' }}>No hay canciones registradas aún.</p>
            ) : (
              <ListaCanciones canciones={canciones} />
            )}
          </div>
        )}

        {vistaActual === 'playlists' && <Playlists />}

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
