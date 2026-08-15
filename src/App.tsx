import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import { supabase } from './supabase';
import ListaCanciones from './ListaCanciones';
import SubirCancion from './SubirCancion';
import PanelAdmin from './PanelAdmin';

const LOGO_URL = "https://gfpvkkroxjxpyfinhopi.supabase.co/storage/v1/object/public/portadas/logo.png";

// Correo fijado para el Administrador
const ADMIN_EMAIL = "ljosedaniel105@gmail.com"; 

// Iconos
const IconHome = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
);
const IconPlaylists = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
);
const IconUpload = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
);
const IconAdmin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);

// Reproductor Personalizado con Me Gusta 👍 / No Me Gusta 👎
const ReproductorPersonalizado = ({ 
  cancion, 
  userId,
  onNext, 
  onPrev 
}: { 
  cancion: any; 
  userId?: string;
  onNext: () => void; 
  onPrev: () => void; 
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [velocidad, setVelocidad] = useState(1);
  const [meGusta, setMeGusta] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);

  const audioUrl = cancion?.url_audio || cancion?.url_archivo || cancion?.url_cancion || cancion?.url;
  const PORTADA_DEFAULT = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500';

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((e) => console.log("Error al reproducir:", e));
      setIsPlaying(true);
      audioRef.current.playbackRate = velocidad;
    }
  }, [cancion, velocidad]);

  // Consultar la reacción del usuario y el total de "Me Gusta"
  useEffect(() => {
    const cargarReacciones = async () => {
      if (!cancion?.id) return;

      // 1. Obtener conteo total de "Me Gusta" de esta canción
      const { count } = await supabase
        .from('me_gusta')
        .select('*', { count: 'exact', head: true })
        .eq('cancion_id', cancion.id);
      
      setTotalLikes(count || 0);

      // 2. Comprobar si el usuario actual le dio "Me Gusta"
      if (userId) {
        const { data } = await supabase
          .from('me_gusta')
          .select('id')
          .eq('usuario_id', userId)
          .eq('cancion_id', cancion.id)
          .maybeSingle();

        setMeGusta(!!data);
      }
    };

    cargarReacciones();
  }, [cancion, userId]);

  // Manejar el botón Me Gusta 👍
  const handleToggleLike = async () => {
    if (!userId || !cancion?.id) return;

    if (meGusta) {
      setMeGusta(false);
      setTotalLikes((prev) => Math.max(0, prev - 1));
      await supabase
        .from('me_gusta')
        .delete()
        .eq('usuario_id', userId)
        .eq('cancion_id', cancion.id);
    } else {
      setMeGusta(true);
      setTotalLikes((prev) => prev + 1);
      await supabase
        .from('me_gusta')
        .insert([{ usuario_id: userId, cancion_id: cancion.id }]);

      // Eliminar de No Me Gusta si existía allí
      await supabase
        .from('no_me_gusta')
        .delete()
        .eq('usuario_id', userId)
        .eq('cancion_id', cancion.id);
    }
  };

  // Manejar el botón No Me Gusta 👎 (Oculta la canción e pasa a la siguiente)
  const handleDislike = async () => {
    if (!userId || !cancion?.id) return;

    // Quitar "Me gusta" si lo tenía
    if (meGusta) {
      setMeGusta(false);
      setTotalLikes((prev) => Math.max(0, prev - 1));
      await supabase
        .from('me_gusta')
        .delete()
        .eq('usuario_id', userId)
        .eq('cancion_id', cancion.id);
    }

    // Registrar en No Me Gusta
    await supabase
      .from('no_me_gusta')
      .insert([{ usuario_id: userId, cancion_id: cancion.id }]);

    // Cambiar a la siguiente canción automáticamente
    onNext();
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const descargarCancion = () => {
    if (!audioUrl) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${cancion.titulo || 'cancion'}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMenuAbierto(false);
  };

  const cambiarVelocidad = () => {
    const velocidades = [1, 1.25, 1.5, 2, 0.5, 0.75];
    const indexActual = velocidades.indexOf(velocidad);
    const siguiente = velocidades[(indexActual + 1) % velocidades.length];
    setVelocidad(siguiente);
  };

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '250px', right: 0, backgroundColor: '#0c0c0e',
      borderTop: '1px solid #ff6b0033', padding: '12px 30px', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between', zIndex: 1000, boxShadow: '0 -4px 20px rgba(0,0,0,0.8)'
    }}>
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)} 
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)} 
        onEnded={onNext}
      />

      {/* Info Canción + Botones 👍 / 👎 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '260px' }}>
        <img src={cancion.portada_url || cancion.url_portada || cancion.portada || PORTADA_DEFAULT} alt={cancion.titulo} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
        <div style={{ overflow: 'hidden', maxWidth: '120px' }}>
          <h4 style={{ margin: 0, color: '#ffffff', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {cancion.titulo || cancion.title || "Sin título"}
          </h4>
          <p style={{ margin: '3px 0 0 0', color: '#ff6b00', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {cancion.artista || cancion.artist || "Artista desconocido"}
          </p>
        </div>

        {/* Botones Me Gusta y No Me Gusta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={handleToggleLike}
            style={{
              background: meGusta ? 'rgba(74, 222, 128, 0.2)' : 'transparent',
              border: 'none',
              borderRadius: '20px',
              padding: '4px 8px',
              color: meGusta ? '#4ade80' : '#8f929d',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 'bold'
            }}
            title="Me gusta"
          >
            👍 <span>{totalLikes}</span>
          </button>

          <button
            onClick={handleDislike}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8f929d',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '4px'
            }}
            title="No me gusta (Ocultar canción)"
          >
            👎
          </button>
        </div>
      </div>

      {/* Controles Centrales (Anterior, Play/Pausa, Siguiente + Barra de Progreso) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1, maxWidth: '500px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          <button 
            onClick={onPrev} 
            style={{ background: 'none', border: 'none', color: '#8f929d', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Anterior"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>

          <button onClick={togglePlay} style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#ff6b00', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
            )}
          </button>

          <button 
            onClick={onNext} 
            style={{ background: 'none', border: 'none', color: '#8f929d', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Siguiente"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>

        </div>

        {/* Barra de tiempo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
          <span style={{ fontSize: '11px', color: '#888' }}>{Math.floor(currentTime/60)}:{(currentTime%60 < 10 ? '0':'') + Math.floor(currentTime%60)}</span>
          <input type="range" min="0" max={duration || 0} value={currentTime} onChange={(e) => { if(audioRef.current) audioRef.current.currentTime = parseFloat(e.target.value); }} style={{ flex: 1, height: '4px', accentColor: '#ff6b00', cursor: 'pointer' }} />
          <span style={{ fontSize: '11px', color: '#888' }}>{Math.floor(duration/60)}:{(duration%60 < 10 ? '0':'') + Math.floor(duration%60)}</span>
        </div>
      </div>

      {/* Menú derecho de opciones */}
      <div style={{ minWidth: '220px', display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
        <button 
          onClick={() => setMenuAbierto(!menuAbierto)}
          style={{ backgroundColor: 'transparent', border: 'none', color: '#8f929d', cursor: 'pointer', padding: '10px' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>

        {menuAbierto && (
          <div style={{
            position: 'absolute', bottom: '60px', right: 0, backgroundColor: '#18181c', border: '1px solid #2a2a30',
            borderRadius: '12px', padding: '8px', minWidth: '180px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', zIndex: 1001
          }}>
            <button onClick={descargarCancion} style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              📥 Descargar
            </button>
            <button onClick={() => { alert("Añadir a playlist"); setMenuAbierto(false); }} style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              ➕ Agregar a Playlist
            </button>
            <button onClick={cambiarVelocidad} style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', border: 'none', color: '#ff6b00', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
              ⚡ Velocidad: {velocidad}x
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [seccion, setSeccion] = useState<'descubrir' | 'playlists' | 'subir' | 'admin'>('descubrir');
  
  const [cancionActual, setCancionActual] = useState<any>(null);
  const [listaCanciones, setListaCanciones] = useState<any[]>([]);

  const [playlists, setPlaylists] = useState<any[]>([]);
  const [mostrarModalPlaylist, setMostrarModalPlaylist] = useState(false);
  const [nombreNuevaPlaylist, setNombreNuevaPlaylist] = useState('');

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apodo, setApodo] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      if (session) {
        cargarPerfil(session.user.id);
        cargarPlaylists(session.user.id);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      if (session) {
        cargarPerfil(session.user.id);
        cargarPlaylists(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const cargarPerfil = async (userId: string) => {
    const { data } = await supabase.from('perfiles').select('*').eq('id', userId).single();
    if (data) setPerfil(data);
  };

  const cargarPlaylists = async (userId: string) => {
    const { data } = await supabase.from('playlists').select('*').eq('usuario_id', userId);
    if (data) setPlaylists(data);
  };

  const crearNuevaPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreNuevaPlaylist.trim() || !session) return;

    const { data, error } = await supabase.from('playlists').insert([
      { nombre: nombreNuevaPlaylist, usuario_id: session.user.id }
    ]).select();

    if (error) {
      alert("Error al crear la playlist: " + error.message);
    } else if (data) {
      setPlaylists([...playlists, ...data]);
      setNombreNuevaPlaylist('');
      setMostrarModalPlaylist(false);
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setPerfil(null);
    setCancionActual(null);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setAuthError(error.message);
      else if (data.user) {
        const apodoFinal = apodo.trim() || email.split('@')[0];
        await supabase.from('perfiles').insert([{ id: data.user.id, email: email, apodo: apodoFinal }]);
      }
    }
  };

  const handlePlaySong = (cancion: any, listaCompleta?: any[]) => {
    setCancionActual(cancion);
    if (listaCompleta && listaCompleta.length > 0) {
      setListaCanciones(listaCompleta);
    }
  };

  const handleNextSong = () => {
    if (!cancionActual || listaCanciones.length === 0) return;
    const indexActual = listaCanciones.findIndex((c) => c.id === cancionActual.id);
    if (indexActual !== -1 && indexActual < listaCanciones.length - 1) {
      setCancionActual(listaCanciones[indexActual + 1]);
    } else {
      setCancionActual(listaCanciones[0]);
    }
  };

  const handlePrevSong = () => {
    if (!cancionActual || listaCanciones.length === 0) return;
    const indexActual = listaCanciones.findIndex((c) => c.id === cancionActual.id);
    if (indexActual > 0) {
      setCancionActual(listaCanciones[indexActual - 1]);
    } else {
      setCancionActual(listaCanciones[listaCanciones.length - 1]);
    }
  };

  const esAdmin = session?.user?.email === ADMIN_EMAIL;

  if (!session) {
    return (
      <div style={{ backgroundColor: '#09090b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: '#18181c', padding: '40px', borderRadius: '16px', border: '1px solid #2a2a30', width: '100%', maxWidth: '400px', color: 'white' }}>
          <h2 style={{ textAlign: 'center', color: '#ff6b00' }}>UNIVERSO MUSICAL</h2>
          {authError && <p style={{ color: '#ff4444', textAlign: 'center', fontSize: '14px' }}>{authError}</p>}
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {!isLogin && <input type="text" placeholder="Apodo" value={apodo} onChange={(e) => setApodo(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#0d0d0f', color: 'white' }} />}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#0d0d0f', color: 'white' }} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#0d0d0f', color: 'white' }} />
            <button type="submit" style={{ backgroundColor: '#ff6b00', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{isLogin ? 'Entrar' : 'Registrarse'}</button>
          </form>
          <p style={{ textAlign: 'center', color: '#aaa', cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>{isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#09090b', minHeight: '100vh', display: 'flex', color: 'white', fontFamily: 'sans-serif', overflowX: 'hidden' }}>
      {/* Sidebar Navigation */}
      <div style={{ width: '250px', backgroundColor: '#08080a', borderRight: '1px solid #141418', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 18px', boxSizing: 'border-box', height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
            <img src={LOGO_URL} alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0 }} />
            <h1 style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.5px', margin: 0, whiteSpace: 'nowrap' }}>UNIVERSO MUSICAL</h1>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => setSeccion('descubrir')} style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '12px 16px', borderRadius: '12px', border: seccion === 'descubrir' ? '1px solid #d95300' : '1px solid transparent', backgroundColor: seccion === 'descubrir' ? '#1c0c03' : 'transparent', color: seccion === 'descubrir' ? '#ff5500' : '#8f929d', cursor: 'pointer' }}><IconHome /> Descubrir</button>
            <button onClick={() => setSeccion('playlists')} style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '12px 16px', borderRadius: '12px', border: seccion === 'playlists' ? '1px solid #d95300' : '1px solid transparent', backgroundColor: seccion === 'playlists' ? '#1c0c03' : 'transparent', color: seccion === 'playlists' ? '#ff5500' : '#8f929d', cursor: 'pointer' }}><IconPlaylists /> Mis Playlists</button>
            <button onClick={() => setSeccion('subir')} style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '12px 16px', borderRadius: '12px', border: seccion === 'subir' ? '1px solid #d95300' : '1px solid transparent', backgroundColor: seccion === 'subir' ? '#1c0c03' : 'transparent', color: seccion === 'subir' ? '#ff5500' : '#8f929d', cursor: 'pointer' }}><IconUpload /> Subir Música</button>
            
            {esAdmin && (
              <button onClick={() => setSeccion('admin')} style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '12px 16px', borderRadius: '12px', border: seccion === 'admin' ? '1px solid #d95300' : '1px solid transparent', backgroundColor: seccion === 'admin' ? '#1c0c03' : 'transparent', color: seccion === 'admin' ? '#ff5500' : '#8f929d', cursor: 'pointer' }}><IconAdmin /> Admin Panel</button>
            )}
          </nav>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ borderTop: '1px solid #141418', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>👤</div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: '13px' }}>{perfil?.apodo || session.user.email.split('@')[0]}</h4>
              <p style={{ margin: 0, fontSize: '11px', color: '#555861' }}>{session.user.email}</p>
            </div>
          </div>

          <button 
            onClick={cerrarSesion}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
              width: '100%', 
              padding: '10px', 
              borderRadius: '10px', 
              border: '1px solid #ff444433', 
              backgroundColor: '#1f0d0d', 
              color: '#ff4444', 
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px'
            }}
          >
            <IconLogout /> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ marginLeft: '250px', width: 'calc(100vw - 250px)', maxWidth: 'calc(100vw - 250px)', padding: '30px', paddingBottom: cancionActual ? '120px' : '30px', boxSizing: 'border-box', overflowX: 'hidden' }}>
        {seccion === 'descubrir' && (
          <ListaCanciones 
            userId={session?.user?.id}
            onPlaySong={(c: any, lista?: any[]) => handlePlaySong(c, lista)} 
          />
        )}

        {seccion === 'playlists' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Mis Playlists</h2>
              <button 
                onClick={() => setMostrarModalPlaylist(true)} 
                style={{ backgroundColor: '#ff6b00', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                ➕ Crear Playlist
              </button>
            </div>

            {playlists.length === 0 ? (
              <p style={{ color: '#888' }}>No tienes playlists creadas aún. ¡Haz clic arriba para crear tu primera lista!</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
                {playlists.map((pl) => (
                  <div key={pl.id} style={{ backgroundColor: '#18181c', borderRadius: '12px', padding: '16px', border: '1px solid #2a2a30' }}>
                    <div style={{ width: '100%', height: '140px', backgroundColor: '#26262c', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '12px' }}>
                      🎵
                    </div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>{pl.nombre}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Playlist personal</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {seccion === 'subir' && <SubirCancion />}
        {seccion === 'admin' && esAdmin && <PanelAdmin />}
      </div>

      {/* Modal para Crear Playlist */}
      {mostrarModalPlaylist && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ backgroundColor: '#18181c', padding: '30px', borderRadius: '16px', border: '1px solid #2a2a30', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ marginTop: 0, color: '#ff6b00' }}>Nueva Playlist</h3>
            <form onSubmit={crearNuevaPlaylist} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                type="text" 
                placeholder="Nombre de la playlist..." 
                value={nombreNuevaPlaylist} 
                onChange={(e) => setNombreNuevaPlaylist(e.target.value)} 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#0d0d0f', color: 'white', boxSizing: 'border-box' }}
                autoFocus
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setMostrarModalPlaylist(false)} style={{ backgroundColor: 'transparent', border: 'none', color: '#aaa', padding: '10px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ backgroundColor: '#ff6b00', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Player Personalizado */}
      {cancionActual && (
        <ReproductorPersonalizado 
          cancion={cancionActual} 
          userId={session?.user?.id}
          onNext={handleNextSong} 
          onPrev={handlePrevSong} 
        />
      )}
    </div>
  );
}
