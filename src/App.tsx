import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import ListaCanciones from './ListaCanciones';
import SubirCancion from './SubirCancion';
import PanelAdmin from './PanelAdmin';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [seccion, setSeccion] = useState<'descubrir' | 'playlists' | 'subir' | 'admin'>('descubrir');
  const [cancionActual, setCancionActual] = useState<any>(null);

  // Form Auth
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
    <div style={{ backgroundColor: '#09090b', minHeight: '100vh', display: 'flex', color: 'white', fontFamily: 'sans-serif' }}>
      
      {/* SIDEBAR LATERAL NAVEGACIÓN */}
      <div style={{ width: '240px', backgroundColor: '#0d0d0f', borderRight: '1px solid #1a1a1e', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px', boxSizing: 'border-box', height: '100vh', position: 'fixed', left: 0, top: 0 }}>
        
        {/* PARTE SUPERIOR: LOGO Y MENÚ */}
        <div>
          {/* LOGO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '35px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e3c72, #2a5298)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 0 10px rgba(42,82,152,0.5)' }}>
              🌌
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, letterSpacing: '1px', color: '#ffffff' }}>UNIVERSO</h1>
          </div>

          {/* OPCIONES DEL MENÚ */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            
            <button 
              onClick={() => setSeccion('descubrir')}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '12px 16px', borderRadius: '10px', border: 'none',
                backgroundColor: seccion === 'descubrir' ? '#2a1508' : 'transparent',
                color: seccion === 'descubrir' ? '#ff6b00' : '#8a8a93',
                fontWeight: seccion === 'descubrir' ? 'bold' : 'normal',
                cursor: 'pointer', textAlign: 'left', fontSize: '15px'
              }}
            >
              <span>🏠</span> Descubrir
            </button>

            <button 
              onClick={() => setSeccion('playlists')}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '12px 16px', borderRadius: '10px', border: 'none',
                backgroundColor: seccion === 'playlists' ? '#2a1508' : 'transparent',
                color: seccion === 'playlists' ? '#ff6b00' : '#8a8a93',
                fontWeight: seccion === 'playlists' ? 'bold' : 'normal',
                cursor: 'pointer', textAlign: 'left', fontSize: '15px'
              }}
            >
              <span>📊</span> Mis Playlists
            </button>

            <button 
              onClick={() => setSeccion('subir')}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '12px 16px', borderRadius: '10px', border: 'none',
                backgroundColor: seccion === 'subir' ? '#2a1508' : 'transparent',
                color: seccion === 'subir' ? '#ff6b00' : '#8a8a93',
                fontWeight: seccion === 'subir' ? 'bold' : 'normal',
                cursor: 'pointer', textAlign: 'left', fontSize: '15px'
              }}
            >
              <span>📤</span> Subir Música
            </button>

            <button 
              onClick={() => setSeccion('admin')}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '12px 16px', borderRadius: '10px', border: 'none',
                backgroundColor: seccion === 'admin' ? '#2a1508' : 'transparent',
                color: seccion === 'admin' ? '#ff6b00' : '#8a8a93',
                fontWeight: seccion === 'admin' ? 'bold' : 'normal',
                cursor: 'pointer', textAlign: 'left', fontSize: '15px'
              }}
            >
              <span>🛡️</span> Admin Panel
            </button>

          </nav>
        </div>

        {/* PARTE INFERIOR: BOTÓN ELIMINAR CUENTA + PERFIL */}
        <div>
          
          <button 
            onClick={eliminarCuenta}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'transparent', color: '#666', border: 'none',
              fontSize: '13px', cursor: 'pointer', marginBottom: '20px', paddingLeft: '5px'
            }}
          >
            <span style={{ color: '#ff4d4d' }}>❌</span> Eliminar mi cuenta
          </button>

          <div style={{ borderTop: '1px solid #1a1a1e', paddingTop: '15px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: 'white', fontWeight: 'bold' }}>
              👤
            </div>
            <div style={{ overflow: 'hidden' }}>
              <h4 style={{ margin: 0, fontSize: '14px', color: 'white', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {apodoUsuario}
              </h4>
              <p style={{ margin: 0, fontSize: '11px', color: '#666', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {session.user.email}
              </p>
            </div>
            <button 
              onClick={handleLogout} 
              title="Cerrar Sesión" 
              style={{ backgroundColor: 'transparent', border: 'none', color: '#888', cursor: 'pointer', marginLeft: 'auto', fontSize: '16px' }}
            >
              🚪
            </button>
          </div>

        </div>

      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ marginLeft: '240px', flex: 1, padding: '30px', paddingBottom: cancionActual ? '100px' : '30px' }}>
        {seccion === 'descubrir' && <ListaCanciones alSeleccionarCancion={(c) => setCancionActual(c)} />}
        {seccion === 'playlists' && <div style={{ color: '#aaa', padding: '20px' }}>📜 Tus playlists aparecerán aquí.</div>}
        {seccion === 'subir' && <SubirCancion />}
        {seccion === 'admin' && <PanelAdmin />}
      </div>

      {/* REPRODUCTOR DE AUDIO EN LA PARTE INFERIOR */}
      {cancionActual && (
        <div style={{ position: 'fixed', bottom: 0, left: '240px', right: 0, backgroundColor: '#141417', borderTop: '1px solid #2a2a30', padding: '12px 25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1000 }}>
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
