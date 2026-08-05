import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import ListaCanciones from './ListaCanciones';
import SubirCancion from './SubirCancion';
import PanelAdmin from './PanelAdmin';

// Componentes de Iconos en SVG (Sin color, trazo outline igual a la imagen)
const IconHome = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconPlaylists = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const IconUpload = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const IconAdmin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconDelete = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [seccion, setSeccion] = useState<'descubrir' | 'playlists' | 'subir' | 'admin'>('descubrir');
  const [cancionActual, setCancionActual] = useState<any>(null);

  // Auth States
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apodo, setApodo] = useState('');
  const [authError, setAuthError] = useState('');

  const PORTADA_DEFAULT = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) cargarPerfil(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) cargarPerfil(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const cargarPerfil = async (userId: string) => {
    const { data } = await supabase.from('perfiles').select('*').eq('id', userId).single();
    if (data) setPerfil(data);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setAuthError(error.message);
      } else if (data.user) {
        const apodoFinal = apodo.trim() || email.split('@')[0];
        await supabase.from('perfiles').insert([
          { id: data.user.id, email: email, apodo: apodoFinal }
        ]);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setPerfil(null);
  };

  const eliminarCuenta = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      if (session?.user?.id) {
        await supabase.from('perfiles').delete().eq('id', session.user.id);
        await supabase.auth.signOut();
        setSession(null);
        setPerfil(null);
      }
    }
  };

  if (!session) {
    return (
      <div style={{ backgroundColor: '#09090b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: '#18181c', padding: '40px', borderRadius: '16px', border: '1px solid #2a2a30', width: '100%', maxWidth: '400px', color: 'white' }}>
          <h2 style={{ textAlign: 'center', color: '#ff6b00', marginTop: 0 }}>UNIVERSO MUSICAL</h2>
          <h3 style={{ textAlign: 'center', fontSize: '16px', color: '#aaa', marginBottom: '20px' }}>
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h3>

          {authError && <p style={{ color: '#ff4d4d', fontSize: '13px', textAlign: 'center' }}>{authError}</p>}

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {!isLogin && (
              <div>
                <label style={{ fontSize: '12px', color: '#aaa' }}>Apodo (Nombre de usuario):</label>
                <input 
                  type="text" required value={apodo} onChange={(e) => setApodo(e.target.value)} 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#0d0d0f', color: 'white', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '12px', color: '#aaa' }}>Correo electrónico:</label>
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)} 
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#0d0d0f', color: 'white', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#aaa' }}>Contraseña:</label>
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)} 
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#0d0d0f', color: 'white', boxSizing: 'border-box' }}
              />
            </div>

            <button type="submit" style={{ backgroundColor: '#ff6b00', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              {isLogin ? 'Entrar' : 'Registrarse'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#aaa', fontSize: '13px', marginTop: '20px', cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
          </p>
        </div>
      </div>
    );
  }

  const apodoUsuario = perfil?.apodo || session.user.email.split('@')[0];

  return (
    <div style={{ backgroundColor: '#09090b', minHeight: '100vh', display: 'flex', color: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* SIDEBAR LATERAL NAVEGACIÓN */}
      <div style={{ width: '250px', backgroundColor: '#08080a', borderRight: '1px solid #141418', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 18px', boxSizing: 'border-box', height: '100vh', position: 'fixed', left: 0, top: 0 }}>
        
        {/* PARTE SUPERIOR */}
        <div>
          {/* LOGO UNIVERSO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingLeft: '6px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #4f46e5, #000000)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #312e81' }}>
              <span style={{ fontSize: '18px' }}>🌌</span>
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '1px', color: '#ffffff' }}>UNIVERSO</h1>
          </div>

          {/* MENÚ DE OPCIONES */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* DESCUBRIR */}
            <button 
              onClick={() => setSeccion('descubrir')}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '12px 16px', borderRadius: '12px',
                border: seccion === 'descubrir' ? '1px solid #d95300' : '1px solid transparent',
                backgroundColor: seccion === 'descubrir' ? '#1c0c03' : 'transparent',
                color: seccion === 'descubrir' ? '#ff5500' : '#8f929d',
                fontWeight: seccion === 'descubrir' ? '600' : '500',
                cursor: 'pointer', textAlign: 'left', fontSize: '14px', transition: '0.2s'
              }}
            >
              <IconHome /> Descubrir
            </button>

            {/* MIS PLAYLISTS */}
            <button 
              onClick={() => setSeccion('playlists')}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '12px 16px', borderRadius: '12px',
                border: seccion === 'playlists' ? '1px solid #d95300' : '1px solid transparent',
                backgroundColor: seccion === 'playlists' ? '#1c0c03' : 'transparent',
                color: seccion === 'playlists' ? '#ff5500' : '#8f929d',
                fontWeight: seccion === 'playlists' ? '600' : '500',
                cursor: 'pointer', textAlign: 'left', fontSize: '14px', transition: '0.2s'
              }}
            >
              <IconPlaylists /> Mis Playlists
            </button>

            {/* SUBIR MÚSICA */}
            <button 
              onClick={() => setSeccion('subir')}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '12px 16px', borderRadius: '12px',
                border: seccion === 'subir' ? '1px solid #d95300' : '1px solid transparent',
                backgroundColor: seccion === 'subir' ? '#1c0c03' : 'transparent',
                color: seccion === 'subir' ? '#ff5500' : '#8f929d',
                fontWeight: seccion === 'subir' ? '600' : '500',
                cursor: 'pointer', textAlign: 'left', fontSize: '14px', transition: '0.2s'
              }}
            >
              <IconUpload /> Subir Música
            </button>

            {/* ADMIN PANEL */}
            <button 
              onClick={() => setSeccion('admin')}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '12px 16px', borderRadius: '12px',
                border: seccion === 'admin' ? '1px solid #d95300' : '1px solid transparent',
                backgroundColor: seccion === 'admin' ? '#1c0c03' : 'transparent',
                color: seccion === 'admin' ? '#ff5500' : '#8f929d',
                fontWeight: seccion === 'admin' ? '600' : '500',
                cursor: 'pointer', textAlign: 'left', fontSize: '14px', transition: '0.2s'
              }}
            >
              <IconAdmin /> Admin Panel
            </button>

          </nav>
        </div>

        {/* PARTE INFERIOR: ELIMINAR CUENTA Y TARJETA DE PERFIL */}
        <div>
          
          <button 
            onClick={eliminarCuenta}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'transparent', color: '#555861', border: 'none',
              fontSize: '13px', cursor: 'pointer', marginBottom: '18px', paddingLeft: '8px', fontWeight: '500'
            }}
          >
            <IconDelete /> Eliminar mi cuenta
          </button>

          <div style={{ borderTop: '1px solid #141418', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: 'white', fontWeight: 'bold' }}>
              👤
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: '13px', color: '#ffffff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: '600' }}>
                {apodoUsuario}
              </h4>
              <p style={{ margin: 0, fontSize: '11px', color: '#555861', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {session.user.email}
              </p>
            </div>
            <button 
              onClick={handleLogout} 
              title="Cerrar Sesión" 
              style={{ backgroundColor: 'transparent', border: 'none', color: '#555861', cursor: 'pointer', fontSize: '16px', padding: 0 }}
            >
              🚪
            </button>
          </div>

        </div>

      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ marginLeft: '250px', flex: 1, padding: '30px', paddingBottom: cancionActual ? '100px' : '30px' }}>
        {seccion === 'descubrir' && <ListaCanciones alSeleccionarCancion={(c) => setCancionActual(c)} />}
        {seccion === 'playlists' && <div style={{ color: '#aaa', padding: '20px' }}>📜 Tus playlists aparecerán aquí.</div>}
        {seccion === 'subir' && <SubirCancion />}
        {seccion === 'admin' && <PanelAdmin />}
      </div>

      {/* REPRODUCTOR DE AUDIO */}
      {cancionActual && (
        <div style={{ position: 'fixed', bottom: 0, left: '250px', right: 0, backgroundColor: '#141417', borderTop: '1px solid #2a2a30', padding: '12px 25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1000 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img 
              src={cancionActual.portada_url || cancionActual.url_portada || PORTADA_DEFAULT} 
              alt={cancionActual.titulo} 
              onError={(e: any) => { e.target.src = PORTADA_DEFAULT; }}
              style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover' }} 
            />
            <div>
              <h4 style={{ margin: 0, color: 'white', fontSize: '14px' }}>{cancionActual.titulo}</h4>
              <p style={{ margin: '2px 0 0 0', color: '#aaa', fontSize: '12px' }}>{cancionActual.artista}</p>
            </div>
          </div>

          <audio 
            controls 
            autoPlay 
            src={cancionActual.url_audio || cancionActual.url_archivo} 
            style={{ width: '500px' }} 
          />
        </div>
      )}

    </div>
  );
}
