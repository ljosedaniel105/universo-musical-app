import React, { useState, useEffect, useRef } from 'react';
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

  // Estados del reproductor de audio
  const [reproduciendo, setReproduciendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [duracion, setDuracion] = useState(0);
  const [tiempoActual, setTiempoActual] = useState(0);
  const [volumen, setVolumen] = useState(1);
  const [mostrarMenuOpciones, setMostrarMenuOpciones] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
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

  useEffect(() => {
    if (cancionActual && audioRef.current) {
      audioRef.current.play().then(() => {
        setReproduciendo(true);
      }).catch(e => console.error("Error al reproducir:", e));
    }
  }, [cancionActual]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (reproduciendo) {
      audioRef.current.pause();
      setReproduciendo(false);
    } else {
      audioRef.current.play();
      setReproduciendo(true);
    }
  };

  const manejarTiempoUpdate = () => {
    if (!audioRef.current) return;
    const actual = audioRef.current.currentTime;
    const total = audioRef.current.duration || 0;
    setTiempoActual(actual);
    setDuracion(total);
    setProgreso(total > 0 ? (actual / total) * 100 : 0);
  };

  const cambiarProgreso = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoPorcentaje = Number(e.target.value);
    if (audioRef.current && duracion) {
      const nuevoTiempo = (nuevoPorcentaje / 100) * duracion;
      audioRef.current.currentTime = nuevoTiempo;
      setProgreso(nuevoPorcentaje);
    }
  };

  const cambiarVolumen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolumen(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const descargarCancion = () => {
    if (!cancionActual?.url_archivo) return;
    const a = document.createElement('a');
    a.href = cancionActual.url_archivo;
    a.download = `${cancionActual.titulo || 'cancion'}.mp3`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setMostrarMenuOpciones(false);
  };

  const unirAPlaylist = () => {
    setPestana('playlists');
    setMostrarMenuOpciones(false);
  };

  const formatearTiempo = (segundos: number) => {
    if (isNaN(segundos)) return "0:00";
    const mins = Math.floor(segundos / 60);
    const segs = Math.floor(segundos % 60);
    return `${mins}:${segs < 10 ? '0' : ''}${segs}`;
  };

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
      <div style={{ color: 'white', backgroundColor: '#000000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        🎵 Cargando Universo Musical...
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const esAdmin = session?.user?.email === CORREO_ADMIN;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#0a0a0a', color: 'white' }}>
      
      {/* BARRA LATERAL */}
      <aside style={{ width: '260px', backgroundColor: '#111111', padding: '24px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid #222222', flexShrink: 0 }}>
        <div>
          {/* LOGO SUPERIOR IZQUIERDO Y NOMBRE COMPLETO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px', paddingLeft: '8px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#ff6b00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 0 15px rgba(255,107,0,0.5)', flexShrink: 0 }}>
              🎵
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: 'white', letterSpacing: '0.5px', lineHeight: '1.2' }}>
                UNIVERSO <span style={{ color: '#ff6b00' }}>MUSICAL</span>
              </h1>
            </div>
          </div>

          {/* BOTONES DE NAVEGACIÓN A LA IZQUIERDA */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => setPestana('descubrir')} 
              style={{ 
                padding: '12px 16px', 
                textAlign: 'left', 
                backgroundColor: pestana === 'descubrir' ? '#ff6b0022' : '#18181b', 
                color: pestana === 'descubrir' ? '#ff6b00' : '#e4e4e7', 
                border: pestana === 'descubrir' ? '1px solid #ff6b0088' : '1px solid #27272a',
                borderRadius: '10px', 
                cursor: 'pointer',
                fontWeight: pestana === 'descubrir' ? 'bold' : '600',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              🏠 Descubrir
            </button>

            <button 
              onClick={() => setPestana('playlists')} 
              style={{ 
                padding: '12px 16px', 
                textAlign: 'left', 
                backgroundColor: pestana === 'playlists' ? '#ff6b0022' : '#18181b', 
                color: pestana === 'playlists' ? '#ff6b00' : '#e4e4e7', 
                border: pestana === 'playlists' ? '1px solid #ff6b0088' : '1px solid #27272a',
                borderRadius: '10px', 
                cursor: 'pointer',
                fontWeight: pestana === 'playlists' ? 'bold' : '600',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              🎧 Mis Playlists
            </button>

            <button 
              onClick={() => setPestana('subir')} 
              style={{ 
                padding: '12px 16px', 
                textAlign: 'left', 
                backgroundColor: pestana === 'subir' ? '#ff6b0022' : '#18181b', 
                color: pestana === 'subir' ? '#ff6b00' : '#e4e4e7', 
                border: pestana === 'subir' ? '1px solid #ff6b0088' : '1px solid #27272a',
                borderRadius: '10px', 
                cursor: 'pointer',
                fontWeight: pestana === 'subir' ? 'bold' : '600',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease'
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
                  backgroundColor: pestana === 'admin' ? '#ff6b0033' : '#18181b', 
                  color: pestana === 'admin' ? '#ff6b00' : '#e4e4e7', 
                  border: pestana === 'admin' ? '1px solid #ff6b00' : '1px solid #27272a',
                  borderRadius: '10px', 
                  cursor: 'pointer', 
                  marginTop: '12px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: pestana === 'admin' ? '0 0 10px rgba(255,107,0,0.2)' : 'none'
                }}
              >
                🔑 Panel Admin
              </button>
            )}
          </nav>
        </div>

        {/* CERRAR SESIÓN */}
        <div style={{ borderTop: '1px solid #222222', paddingTop: '16px' }}>
          <p style={{ fontSize: '12px', color: '#888888', marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            👤 {session.user.email}
          </p>
          <button 
            onClick={cerrarSesion} 
            style={{ 
              width: '100%', 
              padding: '10px', 
              backgroundColor: '#1f1315', 
              color: '#ef4444', 
              border: '1px solid #ef444433', 
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

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ flex: 1, padding: '32px', backgroundColor: '#0a0a0a', overflowY: 'auto', paddingBottom: cancionActual ? '120px' : '32px' }}>
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

      {/* BARRA INFERIOR DE REPRODUCCIÓN (CONSERVADA EXACTAMENTE IGUAL) */}
      {cancionActual && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#000000',
          borderTop: '1px solid #ff6b0055',
          padding: '12px 28px',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          zIndex: 1000,
          boxShadow: '0 -6px 24px rgba(0,0,0,0.95)'
        }}>
          <audio 
            ref={audioRef}
            src={cancionActual.url_archivo}
            onTimeUpdate={manejarTiempoUpdate}
            onEnded={() => setReproduciendo(false)}
          />

          {/* DETALLES DE CANCIÓN */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '260px' }}>
            <img 
              src={cancionActual.url_imagen || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150'} 
              onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150'; }}
              alt={cancionActual.titulo} 
              style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} 
            />
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {cancionActual.titulo}
              </p>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#a1a1aa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {cancionActual.artista}
              </p>
            </div>
          </div>

          {/* CONTROLES Y LÍNEA NARANJA */}
          <div style={{ flex: 1, maxWidth: '520px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <button 
              onClick={togglePlay} 
              style={{ backgroundColor: '#ff6b00', color: 'white', border: 'none', width: '42px', height: '42px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', boxShadow: '0 0 10px rgba(255,107,0,0.4)' }}
            >
              {reproduciendo ? '⏸' : '▶'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
              <span style={{ fontSize: '11px', color: '#888', minWidth: '35px', textAlign: 'right' }}>{formatearTiempo(tiempoActual)}</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={progreso} 
                onChange={cambiarProgreso} 
                style={{ flex: 1, accentColor: '#ff6b00', cursor: 'pointer', height: '4px' }} 
              />
              <span style={{ fontSize: '11px', color: '#888', minWidth: '35px' }}>{formatearTiempo(duracion)}</span>
            </div>
          </div>

          {/* VOLUMEN Y MENÚ DE 3 PUNTOS */}
          <div style={{ width: '260px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '14px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px' }}>🔊</span>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volumen} 
                onChange={cambiarVolumen} 
                style={{ accentColor: '#ff6b00', cursor: 'pointer', width: '75px', height: '4px' }} 
              />
            </div>

            {/* BOTÓN 3 PUNTOS */}
            <button 
              onClick={() => setMostrarMenuOpciones(!mostrarMenuOpciones)}
              style={{ backgroundColor: '#222222', color: 'white', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ⋮
            </button>

            {/* DESPLEGABLE DE OPCIONES */}
            {mostrarMenuOpciones && (
              <div style={{
                position: 'absolute',
                bottom: '50px',
                right: '0',
                backgroundColor: '#18181b',
                border: '1px solid #ff6b0044',
                borderRadius: '10px',
                padding: '6px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
                width: '170px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                zIndex: 1001
              }}>
                <button 
                  onClick={unirAPlaylist}
                  style={{ backgroundColor: 'transparent', color: 'white', border: 'none', padding: '10px 12px', textAlign: 'left', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  ➕ Unir a Playlist
                </button>
                <button 
                  onClick={descargarCancion}
                  style={{ backgroundColor: 'transparent', color: 'white', border: 'none', padding: '10px 12px', textAlign: 'left', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  📥 Descargar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
