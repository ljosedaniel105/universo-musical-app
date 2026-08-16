import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import { supabase } from './supabase';
import ListaCanciones from './ListaCanciones';
import SubirCancion from './SubirCancion';
import PanelAdmin from './PanelAdmin';

const LOGO_URL = "https://gfpvkkroxjxpyfinhopi.supabase.co/storage/v1/object/public/portadas/logo.png";
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

const IconLike = ({ filled }: { filled: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

const IconDislike = ({ filled }: { filled: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
  </svg>
);

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
  const [noMeGusta, setNoMeGusta] = useState(false);
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

  useEffect(() => {
    const cargarReacciones = async () => {
      if (!cancion?.id) return;

      const { count } = await supabase
        .from('me_gusta')
        .select('*', { count: 'exact', head: true })
        .eq('cancion_id', cancion.id);
      
      setTotalLikes(count || 0);

      if (userId) {
        const { data: likeData } = await supabase
          .from('me_gusta')
          .select('id')
          .eq('usuario_id', userId)
          .eq('cancion_id', cancion.id)
          .maybeSingle();

        setMeGusta(!!likeData);

        const { data: dislikeData } = await supabase
          .from('no_me_gusta')
          .select('id')
          .eq('usuario_id', userId)
          .eq('cancion_id', cancion.id)
          .maybeSingle();

        setNoMeGusta(!!dislikeData);
      }
    };

    cargarReacciones();
  }, [cancion, userId]);

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
      setNoMeGusta(false);
      setTotalLikes((prev) => prev + 1);
      await supabase
        .from('me_gusta')
        .insert([{ usuario_id: userId, cancion_id: cancion.id }]);

      await supabase
        .from('no_me_gusta')
        .delete()
        .eq('usuario_id', userId)
        .eq('cancion_id', cancion.id);
    }
  };

  const handleDislike = async () => {
    if (!userId || !cancion?.id) return;

    if (noMeGusta) {
      setNoMeGusta(false);
      await supabase
        .from('no_me_gusta')
        .delete()
        .eq('usuario_id', userId)
        .eq('cancion_id', cancion.id);
    } else {
      if (meGusta) {
        setMeGusta(false);
        setTotalLikes((prev) => Math.max(0, prev - 1));
        await supabase
          .from('me_gusta')
          .delete()
          .eq('usuario_id', userId)
          .eq('cancion_id', cancion.id);
      }

      setNoMeGusta(true);
      await supabase
        .from('no_me_gusta')
        .insert([{ usuario_id: userId, cancion_id: cancion.id }]);

      onNext();
    }
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

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="reproductor-fijo" style={{
      position: 'fixed', 
      bottom: '16px',      
      left: '265px',        /* Deja espacio para la barra lateral en escritorio */
      right: '20px', 
      maxWidth: '920px',   
      margin: '0 auto',    
      backgroundColor: '#18181c', 
      border: '1px solid #2a2a30',
      borderRadius: '14px', 
      boxShadow: '0 10px 35px rgba(0,0,0,0.85)',
      display: 'flex', 
      flexDirection: 'column', 
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)} 
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)} 
        onEnded={onNext}
      />

      <input 
        type="range" min="0" max={duration || 0} value={currentTime} 
        onChange={(e) => { if (audioRef.current) audioRef.current.currentTime = parseFloat(e.target.value); }} 
        style={{ width: '100%', height: '4px', accentColor: '#ff6b00', cursor: 'pointer', margin: 0, padding: 0 }} 
      />

      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', gap: '16px', justifyContent: 'space-between', minHeight: '64px', boxSizing: 'border-box' }}>
        
        {/* Controles de reproducción y tiempo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <button onClick={onPrev} style={{ background: 'none', border: 'none', color: '#f1f1f1', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }} title="Anterior">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
          <button onClick={togglePlay} style={{ background: 'none', border: 'none', color: '#f1f1f1', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }} title={isPlaying ? "Pausa" : "Reproducir"}>
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          <button onClick={onNext} style={{ background: 'none', border: 'none', color: '#f1f1f1', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }} title="Siguiente">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </button>
          <span style={{ color: '#aaa', fontSize: '12px', whiteSpace: 'nowrap', minWidth: '70px' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Info de la canción */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'center', minWidth: '140px', maxWidth: '350px', overflow: 'hidden' }}>
          <img 
            src={cancion.portada_url || cancion.url_portada || cancion.portada || PORTADA_DEFAULT} 
            alt={cancion.titulo} 
            style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} 
          />
          <div style={{ overflow: 'hidden', width: '100%' }}>
            <h4 style={{ margin: 0, color: '#f1f1f1', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {cancion.titulo || cancion.title || "Sin título"}
            </h4>
            <p style={{ margin: '3px 0 0 0', color: '#aaa', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {cancion.artista || cancion.artist || "Artista desconocido"}
            </p>
          </div>
        </div>

        {/* Botones de like, dislike y opciones */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, position: 'relative' }}>
          <button onClick={handleToggleLike} style={{ background: 'transparent', border: 'none', color: meGusta ? '#3ea6ff' : '#aaa', cursor: 'pointer', padding: '6px 8px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '4px' }} title="Me gusta">
            <IconLike filled={meGusta} />
            <span style={{ fontSize: '12px', fontWeight: '500', color: meGusta ? '#3ea6ff' : '#aaa' }}>{totalLikes}</span>
          </button>

          <button onClick={handleDislike} style={{ background: 'transparent', border: 'none', color: noMeGusta ? '#3ea6ff' : '#aaa', cursor: 'pointer', padding: '6px 8px', borderRadius: '18px', display: 'flex', alignItems: 'center' }} title="No me gusta">
            <IconDislike filled={noMeGusta} />
          </button>

          <button onClick={() => setMenuAbierto(!menuAbierto)} style={{ backgroundColor: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center' }} title="Más opciones">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
          </button>

          {menuAbierto && (
            <div style={{ position: 'absolute', bottom: '50px', right: 0, backgroundColor: '#212121', border: '1px solid #383838', borderRadius: '12px', padding: '8px', minWidth: '160px', boxShadow: '0 8px 30px rgba(0,0,0,0.6)', zIndex: 1001 }}>
              <button onClick={descargarCancion} style={{ width: '100%', padding: '8px', backgroundColor: 'transparent', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>📥 Descargar</button>
              <button onClick={() => { alert("Añadir a lista"); setMenuAbierto(false); }} style={{ width: '100%', padding: '8px', backgroundColor: 'transparent', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>➕ Agregar a Lista</button>
              <button onClick={cambiarVelocidad} style={{ width: '100%', padding: '8px', backgroundColor: 'transparent', border: 'none', color: '#ff6b00', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px' }}>⚡ Velocidad: {velocidad}x</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [seccion, setSeccion] = useState<'descubrir' | 'playlists' | 'subir' | 'admin'>('descubrir');
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  
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
    const { data, error } = await supabase.from('playlists').select('*').eq('user_id', userId);
    if (error) console.log("Error playlists:", error.message);
    if (data) setPlaylists(data);
  };

  const crearNuevaPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreNuevaPlaylist.trim() || !session) return;

    const { data, error } = await supabase.from('playlists').insert([
      { nombre: nombreNuevaPlaylist, user_id: session.user.id }
    ]).select();

    if (error) {
      alert("Error al crear la lista: " + error.message);
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
            <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#0d0d0f', color: 'white' }} />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#0d0d0f', color: 'white' }} />
            <button type="submit" style={{ backgroundColor: '#ff6b00', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</button>
          </form>
          <p style={{ textAlign: 'center', color: '#aaa', cursor: 'pointer', marginTop: '15px' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#09090b', color: 'white', fontFamily: 'sans-serif', overflow: 'hidden', position: 'relative' }}>
      
      <style>{`
        .sidebar-menu {
          width: 250px;
          background-color: #121215;
          border-right: 1px solid #222228;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 1100;
          transition: transform 0.3s ease-in-out;
        }
        .main-content-area {
          margin-left: 250px;
          flex: 1;
          height: 100vh;
          overflow-y: auto;
          box-sizing: border-box;
          padding: 30px;
        }
        .mobile-header {
          display: none;
        }
        .sidebar-overlay {
          display: none;
        }

        @media (max-width: 768px) {
          .sidebar-menu {
            transform: translateX(-100%);
            width: 260px;
          }
          .sidebar-menu.open {
            transform: translateX(0);
          }
          .main-content-area {
            margin-left: 0 !important;
            padding: 15px !important;
            padding-top: 70px !important;
          }
          .mobile-header {
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 60px;
            background-color: #121215;
            border-bottom: 1px solid #222228;
            align-items: center;
            padding: 0 20px;
            gap: 15px;
            z-index: 1050;
          }
          .sidebar-overlay.open {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.6);
            z-index: 1099;
          }
          .reproductor-fijo {
            left: 12px !important;
            right: 12px !important;
          }
        }
      `}</style>

      <div className="mobile-header">
        <button onClick={() => setMenuMovilAbierto(!menuMovilAbierto)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '5px' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={LOGO_URL} alt="Logo" style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
          <h3 style={{ margin: 0, color: '#ff6b00', fontSize: '16px' }}>Universo Musical</h3>
        </div>
      </div>

      <div className={`sidebar-overlay ${menuMovilAbierto ? 'open' : ''}`} onClick={() => setMenuMovilAbierto(false)} />

      <div className={`sidebar-menu ${menuMovilAbierto ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={LOGO_URL} alt="Logo" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
            <h3 style={{ margin: 0, color: '#ff6b00' }}>Universo Musical</h3>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => { setSeccion('descubrir'); setMenuMovilAbierto(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', color: seccion === 'descubrir' ? '#ff6b00' : '#aaa', cursor: 'pointer', padding: '10px', borderRadius: '8px', textAlign: 'left' }}>
            <IconHome /> Descubrir
          </button>
          <button onClick={() => { setSeccion('playlists'); setMenuMovilAbierto(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', color: seccion === 'playlists' ? '#ff6b00' : '#aaa', cursor: 'pointer', padding: '10px', borderRadius: '8px', textAlign: 'left' }}>
            <IconPlaylists /> Playlists
          </button>
          <button onClick={() => { setSeccion('subir'); setMenuMovilAbierto(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', color: seccion === 'subir' ? '#ff6b00' : '#aaa', cursor: 'pointer', padding: '10px', borderRadius: '8px', textAlign: 'left' }}>
            <IconUpload /> Subir Canción
          </button>

          {esAdmin && (
            <button onClick={() => { setSeccion('admin'); setMenuMovilAbierto(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', color: seccion === 'admin' ? '#ff6b00' : '#aaa', cursor: 'pointer', padding: '10px', borderRadius: '8px', textAlign: 'left' }}>
              <IconAdmin /> Panel de Administración
            </button>
          )}
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ color: '#aaa', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            👤 {perfil?.apodo || session.user.email}
          </div>
          <button onClick={cerrarSesion} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#222228', border: 'none', color: '#ff4444', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
            <IconLogout /> Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="main-content-area" style={{ paddingBottom: cancionActual ? '140px' : '30px' }}>
        {seccion === 'descubrir' && <ListaCanciones onPlay={handlePlaySong} userId={session?.user?.id} />}
        {seccion === 'subir' && <SubirCancion />}
        {seccion === 'admin' && esAdmin && <PanelAdmin />}
        {seccion === 'playlists' && (
          <div>
            <h2>Mis Playlists</h2>
            <button onClick={() => setMostrarModalPlaylist(true)} style={{ backgroundColor: '#ff6b00', border: 'none', color: 'white', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px' }}>
              + Crear Playlist
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
              {playlists.map((p) => (
                <div key={p.id} style={{ backgroundColor: '#18181c', padding: '15px', borderRadius: '8px', border: '1px solid #2a2a30' }}>
                  <h4>{p.nombre}</h4>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {mostrarModalPlaylist && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <form onSubmit={crearNuevaPlaylist} style={{ backgroundColor: '#18181c', padding: '25px', borderRadius: '12px', width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3>Crear nueva playlist</h3>
            <input type="text" placeholder="Nombre de la playlist..." value={nombreNuevaPlaylist} onChange={(e) => setNombreNuevaPlaylist(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#0d0d0f', color: 'white' }} />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setMostrarModalPlaylist(false)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}>Cancelar</button>
              <button type="submit" style={{ backgroundColor: '#ff6b00', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>Crear</button>
            </div>
          </form>
        </div>
      )}

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
