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

  // Tu correo de administrador
  const CORREO_ADMIN = 'ljosedaniel105@gmail.com'; 

  useEffect(() => {
    // Verificar si hay sesión activa al entrar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCargando(false);
    });

    // Escuchar cuando el usuario entra o sale de sesión
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setCargando(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Función definitiva para Cerrar Sesión y limpiar la memoria
  const cerrarSesion = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error cerrando sesión:', e);
    }
    // Borra la memoria local y reinicia la app
    localStorage.clear();
    sessionStorage.clear();
    setSession(null);
    window.location.href = window.location.origin;
  };

  if (cargando) {
    return <div style={{ color: 'white', padding: '20px', backgroundColor: '#121212', minHeight: '100vh' }}>Cargando Universo Musical...</div>;
  }

  // SI NO HAY SESIÓN: Muestra la pantalla de Iniciar Sesión / Registrarse
  if (!session) {
    return <Auth />;
  }

  // Verificamos si el usuario actual es el administrador
  const esAdmin = session?.user?.email === CORREO_ADMIN;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#121212', color: 'white' }}>
      
      {/* MENÚ LATERAL IZQUIERDO */}
      <aside style={{ width: '240px', backgroundColor: '#1e1e1e', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid #2a2a2a' }}>
        <div>
          {/* TÍTULO Y LOGO */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', margin: 0, color: '#ff6b00', fontWeight: 'bold' }}>UNIVERSO 🎵</h2>
            <p style={{ fontSize: '12px', margin: 0, color: '#ff6b00', letterSpacing: '2px' }}>MUSICAL</p>
          </div>
          
          {/* NAVEGACIÓN */}
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

            {/* BOTÓN PANEL ADMIN: Solo aparece si entras con ljosedaniel105@gmail.com */}
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

        {/* PIE DEL MENÚ: CORREO Y BOTÓN CERRAR SESIÓN */}
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

      {/* ÁREA PRINCIPAL */}
      <main style={{ flex: 1, padding: '30px', backgroundColor: '#121212', overflowY: 'auto' }}>
        {pestana === 'descubrir' && <ListaCanciones alReproducir={() => {}} esAdmin={esAdmin} />}
        {pestana === 'playlists' && <Playlists />}
        {pestana === 'subir' && <SubirCancion />}
        {pestana === 'admin' && esAdmin && <PanelAdmin />}
      </main>

    </div>
  );
}

export default App;