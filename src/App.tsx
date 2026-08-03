import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { SubirCancion } from './SubirCancion';
import { ListaCanciones } from './ListaCanciones';
import { PanelAdmin } from './PanelAdmin';

export default function App() {
  const [pestana, setPestana] = useState('descubrir');
  const [usuario, setUsuario] = useState<any>(null);
  const [esAdmin, setEsAdmin] = useState(false);

  useEffect(() => {
    // Obtener la sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setUsuario(user);
      
      // Validar si el usuario es Admin (puedes ajustar el correo si usas otro)
      if (user && user.email === 'ljosedaniel105@gmail.com') {
        setEsAdmin(true);
      } else {
        setEsAdmin(false);
      }
    });

    // Escuchar cambios de estado de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setUsuario(user);

      if (user && user.email === 'ljosedaniel105@gmail.com') {
        setEsAdmin(true);
      } else {
        setEsAdmin(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#09090b', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* BARRA LATERAL IZQUIERDA */}
      <aside style={{ width: '260px', background: '#121214', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column', padding: '20px', position: 'fixed', height: '100vh', boxSizing: 'border-box' }}>
        
        {/* LOGO UNIVERSO MUSICAL */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '35px' }}>
          <img 
            src="https://gfpvkkroxjxpyfinhopi.supabase.co/storage/v1/object/public/portadas/logo.png" 
            alt="Logo" 
            style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #ff6600' }} 
          />
          <div>
            <span style={{ fontWeight: '900', fontSize: '1.1rem', color: '#fff', display: 'block' }}>UNIVERSO</span>
            <span style={{ fontSize: '0.65rem', color: '#ff6600', fontWeight: 'bold', letterSpacing: '2px' }}>MUSICAL</span>
          </div>
        </div>

        {/* NAVEGACIÓN */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button onClick={() => setPestana('descubrir')} style={{ background: pestana === 'descubrir' ? 'rgba(255, 102, 0, 0.15)' : 'transparent', color: pestana === 'descubrir' ? '#ff6600' : '#aaa', border: 'none', textAlign: 'left', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            🏠 Descubrir
          </button>

          <button onClick={() => setPestana('playlists')} style={{ background: pestana === 'playlists' ? 'rgba(255, 102, 0, 0.15)' : 'transparent', color: pestana === 'playlists' ? '#ff6600' : '#aaa', border: 'none', textAlign: 'left', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            🎶 Mis Playlists
          </button>

          <button onClick={() => setPestana('subir')} style={{ background: pestana === 'subir' ? 'rgba(255, 102, 0, 0.15)' : 'transparent', color: pestana === 'subir' ? '#ff6600' : '#aaa', border: 'none', textAlign: 'left', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            📁 Subir Música
          </button>

          {/* BOTÓN ADMIN PANEL (Visible para ljosedaniel105@gmail.com) */}
          {esAdmin && (
            <button onClick={() => setPestana('admin')} style={{ background: pestana === 'admin' ? 'rgba(255, 102, 0, 0.15)' : 'transparent', color: pestana === 'admin' ? '#ff6600' : '#aaa', border: 'none', textAlign: 'left', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              🛡️ Admin Panel
            </button>
          )}
        </nav>

        {/* CERRAR SESIÓN */}
        <div style={{ borderTop: '1px solid #222', paddingTop: '15px', marginTop: 'auto' }}>
          {usuario && (
            <div style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '10px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              👤 {usuario.email}
            </div>
          )}
          <button 
            onClick={() => supabase.auth.signOut()} 
            style={{ width: '100%', background: 'rgba(255, 68, 68, 0.15)', color: '#ff4444', border: '1px solid rgba(255, 68, 68, 0.3)', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ marginLeft: '260px', padding: '40px', flex: 1, paddingBottom: '120px' }}>
        {pestana === 'descubrir' && <ListaCanciones />}
        {pestana === 'subir' && <SubirCancion />}
        {pestana === 'admin' && <PanelAdmin />}
        {pestana === 'playlists' && (
          <div>
            <h2 style={{ color: '#fff' }}>🎶 Mis Playlists</h2>
            <p style={{ color: '#aaa' }}>Sección en desarrollo.</p>
          </div>
        )}
      </main>

    </div>
  );
}