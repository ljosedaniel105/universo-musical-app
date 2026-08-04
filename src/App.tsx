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

  // Estados del reproductor de audio customizado
  const [reproduciendo, setReproduciendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [duracion, setDuracion] = useState(0);
  const [tiempoActual, setTiempoActual] = useState(0);
  const [volumen, setVolumen] = useState(1);
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

  // Al cambiar de canción, reproducir automáticamente
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
      <div style={{ color: 'white', backgroundColor: '#000000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Cargando Universo Musical...
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const esAdmin = session?.user?.email === CORREO_ADMIN;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#0a0a0a', color: 'white' }}>
      
      {/* BARRA LATERAL ESTILO REPLIT */}
      <aside style={{ width: '250px', backgroundColor: '#121212', padding: '24px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid #222222', flexShrink: 0 }}>
        <div>
          {/* LOGO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '8px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff6b00', display: 'flex', alignItems: 'center', gap: '8px' }}>
              UNIVERSO <span style={{ color: '#8b5cf6' }}>🎵</span>
            </div>
          </div>

          {/* NAVEGACIÓN */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button 
              onClick={() => setPestana('descubrir')} 
              style={{ 
                padding: '12px 16px', 
                textAlign: 'left', 
                backgroundColor: pestana === 'descubrir' ? '#222222' : 'transparent', 
                color: pestana === 'descubrir' ? '#ff6b00' : '#a1a1aa', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: pestana === 'descubrir' ? 'bold' : 'normal',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              🏠 Descubrir
            </button>

            <button 
              onClick={() => setPestana('playlists')} 
              style={{ 
                padding: '12px 16px', 
                textAlign: 'left', 
                backgroundColor: pestana === 'playlists' ? '#222222' : 'transparent', 
                color: pestana === 'playlists' ? '#ff6b00' : '#a1a1aa', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: pestana === 'playlists' ? 'bold' : 'normal',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              🎧 Mis Playlists
            </button>

            <button 
              onClick={() => setPestana('subir')} 
              style={{ 
                padding: '12px 16px', 
                textAlign: 'left', 
                backgroundColor: pestana === 'subir' ? '#222222' : 'transparent', 
                color: pestana === 'subir' ? '#ff6b00' : '#a1a1aa', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: pestana === 'subir' ? 'bold' : 'normal',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
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
                  backgroundColor: pestana === 'admin' ? '#ff6b0022' : 'transparent', 
                  color: pestana === 'admin' ? '#ff6b00' : '#a1a1aa', 
                  border: pestana === 'admin' ? '1px solid #ff6b00' : '1px solid #222222', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  marginTop: '12px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                🔑 Panel Admin
              </button>
            )}
          </nav>
        </div>

        {/* PIE Y USUARIO */}
        <div style={{ borderTop: '1px solid #222222', paddingTop: '16px' }}>
          <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

      {/* ÁREA PRINCIPAL */}
      <main style={{ flex: 1, padding: '32px', backgroundColor: '#0a0a0a', overflowY: 'auto', paddingBottom: cancionActual ? '110px' : '32px' }}>
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

      {/* REPRODUCTOR PERSONALIZADO NEGRO CON BARRAS NARANJAS */}
      {cancionActual && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#000000',
          borderTop: '1px solid #ff6b0044',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          zIndex: 1000,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.9)'
        }}>
          {/* Elemento de audio oculto controlado por JS */}
          <audio 
            ref={audioRef}
            src={cancionActual.url_archivo}
            onTimeUpdate={manejarTiempoUpdate}
            onEnded={() => setReproduciendo(false)}
          />

          {/* INFORMACIÓN DE LA CANCIÓN */}
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

          {/* CONTROLES Y BARRA NARANJA */}
          <div style={{ flex: 1, maxWidth: '550px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            {/* BOTONES PLAY/PAUSA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button onClick={togglePlay} style={{ backgroundColor: '#ff6b00', color: 'white', border: 'none', width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' }}>
                {reproduciendo ? '⏸' : '▶'}
              </button>
            </div>

            {/* BARRA DE PROGRESO CON COLOR NARANJA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
              <span style={{ fontSize: '11px', color: '#888', minWidth: '35px', textAlign: 'right' }}>{formatearTiempo(tiempoActual)}</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={progreso} 
                onChange={cambiarProgreso} 
                style={{ 
                  flex: 1, 
                  accentColor: '#ff6b00', 
                  cursor: 'pointer',
                  height: '4px'
                }} 
              />
              <span style={{ fontSize: '11px', color: '#888', minWidth: '35px' }}>{formatearTiempo(duracion)}</span>
            </div>
          </div>

          {/* CONTROL DE VOLUMEN */}
          <div style={{ width: '250px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>🔊</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volumen} 
              onChange={cambiarVolumen} 
              style={{ accentColor: '#ff6b00', cursor: 'pointer', width: '80px', height: '4px' }} 
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
