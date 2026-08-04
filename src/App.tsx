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
      <div style={{ color: 'white', backgroundColor: '#121214', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Cargando Universo Musical...
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const esAdmin = session?.user?.email === CORREO_ADMIN;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#121214', color: 'white' }}>
      
      {/* MENÚ LATERAL */}
      <aside style={{ width: '250px', backgroundColor: '#18181c', padding: '24px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid #28282e', flexShrink: 0 }}>
        <div>
          {/* LOGO UNIVERSO MUSICAL */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '8px' }}>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#ff6b00', display: 'flex', alignItems: 'center', gap: '8px' }}>
              UNIVERSO <span style={{ color: '#8b5cf6' }}>🎵</span>
            </div>
          </div>

          {/* BOTONES DE NAVEGACIÓN */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button 
              onClick={() => setPestana('descubrir')} 
              style={{ 
                padding: '12px 16px', 
                textAlign: 'left', 
                backgroundColor: pestana === 'descubrir' ? '#26262e' : 'transparent', 
                color: pestana === 'descubrir' ? '#ff6b00' : '#a1a1aa', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: pestana === 'descubrir' ? 'bold' : 'normal',
                fontSize: '14px'
              }}
            >
              🏠 Descubrir
            </button>

            <button 
              onClick={() => setPestana('playlists')} 
              style={{ 
                padding: '12px 16px', 
                textAlign: 'left', 
                backgroundColor: pestana === 'playlists' ? '#26262e' : 'transparent', 
                color: pestana === 'playlists' ? '#ff6b00' : '#a1a1aa', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: pestana === 'playlists' ? 'bold' : 'normal',
                fontSize: '14px'
              }}
            >
              🎧 Mis Playlists
            </button>

            <button 
              onClick={() => setPestana('subir')} 
              style={{ 
                padding: '12px 16px', 
                textAlign: 'left', 
                backgroundColor: pestana === 'subir' ? '#26262e' : 'transparent', 
                color: pestana === 'subir' ? '#ff6b00' : '#a1a1aa', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: pestana === 'subir' ? 'bold' : 'normal',
                fontSize: '14px'
              }}
            >
              📁 Subir Música
            </button>

            {esAdmin && (
              <button 
                onClick={() => setPestana('admin')} 
                style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  backgroundColor: pestana === 'admin' ? '#0066ff' : '#0055ff22', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '10px', 
                  cursor: 'pointer', 
                  marginTop: '12px',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                🔑 Panel Admin
              </button>
            )}
          </nav>
        </div>

        {/* CERRAR SESIÓN */}
        <div style={{ borderTop: '1px solid #28282e', paddingTop: '16px' }}>
          <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            👤 {session.user.email}
          </p>
          <button 
            onClick={cerrarSesion} 
            style={{ 
              width: '100%', 
              padding: '10px', 
              backgroundColor: '#2a1212', 
              color: '#ef4444', 
              border: '1px solid #ef444444', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              fontSize: '13px'
            }}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main style={{ flex: 1, padding: '30px', backgroundColor: '#121214', overflowY: 'auto', paddingBottom: cancionActual ? '110px' : '30px' }}>
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

      {/* REPRODUCTOR DE MÚSICA INFERIOR */}
      {cancionActual && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#18181c',
          borderTop: '1px solid #ff6b00',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          zIndex: 1000,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '250px' }}>
            <img 
              src={cancionActual.url_imagen || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150'} 
              onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150'; }}
              alt={cancionActual.titulo} 
              style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }} 
            />
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {cancionActual.titulo}
              </p>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#a1a1aa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {cancionActual.artista}
              </p>
            </div>
          </div>

          <div style={{ flex: 1, maxWidth: '500px', display: 'flex', justifyContent: 'center' }}>
            <audio 
              controls 
              autoPlay 
              src={cancionActual.url_archivo} 
              style={{ width: '100%', height: '40px', outline: 'none' }} 
            />
          </div>

          <div style={{ width: '250px' }}></div>
        </div>
      )}

    </div>
  );
}

export default App;
