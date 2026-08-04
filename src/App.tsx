import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { ListaCanciones } from './ListaCanciones';
import { SubirCancion } from './SubirCancion';
import { PanelAdmin } from './PanelAdmin';
import { Playlists } from './Playlists';
import { Auth } from './Auth';

export function App() {
  const [session, setSession] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [pestana, setPestana] = useState('descubrir');
  const [cancionActual, setCancionActual] = useState<any>(null);

  // Correo del Administrador
  const CORREO_ADMIN = 'ljosedaniel105@gmail.com'; 

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCargando(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setCargando(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const cerrarSesion = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error cerrando sesión:', e);
    }
    localStorage.clear();
    sessionStorage.clear();
    setSession(null);
    window.location.href = window.location.origin;
  };

  if (cargando) {
    return (
      <div style={{ color: 'white', padding: '20px', backgroundColor: '#121212', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Cargando Universo Musical...
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const esAdmin = session?.user?.email === CORREO_ADMIN;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#121212', color: 'white' }}>
      
      {/* MENÚ LATERAL */}
      <aside style={{ width: '240px', backgroundColor: '#181818', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid #282828' }}>
        <div>
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '20px', margin: 0, color: '#ff6b00', fontWeight: 'bold' }}>UNIVERSO 🎵</h2>
            <p style={{ fontSize: '11px', margin: 0, color: '#ff6b00', letterSpacing: '2px' }}>MUSICAL</p>
          </div>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={() => setPestana('descubrir')} 
              style={{ 
                padding: '12px', 
                textAlign: 'left', 
                backgroundColor: pestana === 'descubrir' ? '#ff6b0022' : 'transparent', 
                color: pestana === 'descubrir' ? '#ff6b00' : 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: pestana === 'descubrir' ? 'bold' : 'normal'
              }}
            >
              🏠 Descubrir
            </button>

            <button 
              onClick={() => setPestana('playlists')} 
              style={{ 
                padding: '12px', 
                textAlign: 'left', 
                backgroundColor: pestana === 'playlists' ? '#ff6b0022' : 'transparent', 
                color: pestana === 'playlists' ? '#ff6b00' : 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: pestana === 'playlists' ? 'bold' : 'normal'
              }}
            >
              🎧 Mis Playlists
            </button>

            <button 
              onClick={() => setPestana('subir')} 
              style={{ 
                padding: '12px', 
                textAlign: 'left', 
                backgroundColor: pestana === 'subir' ? '#ff6b0022' : 'transparent', 
                color: pestana === 'subir' ? '#ff6b00' : 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: pestana === 'subir' ? 'bold' : 'normal'
              }}
            >
              📁 Subir Música
            </button>

            {esAdmin && (
              <button 
                onClick={() => setPestana('admin')} 
                style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  backgroundColor: pestana === 'admin' ? '#0055ff' : '#0055ff33', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  marginTop: '15px',
                  fontWeight: 'bold'
                }}
              >
                🔑 Panel Admin
              </button>
            )}
          </nav>
        </div>

        {/* PIE DEL MENÚ */}
        <div style={{ borderTop: '1px solid #333', paddingTop: '15px' }}>
          <p style={{ fontSize: '11px', color: '#888', marginBottom: '10px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            👤 {session.user.email}
          </p>
          <button 
            onClick={cerrarSesion} 
            style={{ 
              width: '100%', 
              padding: '10px', 
              backgroundColor: '#3a1a1a', 
              color: '#ff4d4d', 
              border: '1px solid #ff4d4d', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: 'bold' 
            }}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* VISTAS PRINCIPALES */}
      <main style={{ flex: 1, padding: '30px', backgroundColor: '#121212', overflowY: 'auto', paddingBottom: cancionActual ? '100px' : '30px' }}>
        {pestana === 'descubrir' && (
          <ListaCanciones 
            alReproducir={(cancion: any) => setCancionActual(cancion)} 
            esAdmin={esAdmin} 
          />
        )}
        {pestana === 'playlists' && <Playlists />}
        {pestana === 'subir' && <SubirCancion />}
        {pestana === 'admin' && esAdmin && <PanelAdmin />}
      </main>

      {/* REPRODUCTOR DE AUDIO INFERIOR */}
      {cancionActual && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#181818',
          borderTop: '1px solid #ff6b00',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          zIndex: 1000
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {cancionActual.url_imagen && (
              <img src={cancionActual.url_imagen} alt={cancionActual.titulo} style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover' }} />
            )}
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: 'white' }}>{cancionActual.titulo}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>{cancionActual.artista}</p>
            </div>
          </div>

          <audio 
            controls 
            autoPlay 
            src={cancionActual.url_archivo} 
            style={{ minWidth: '300px', outline: 'none' }} 
          />
        </div>
      )}

    </div>
  );
}

export default App;