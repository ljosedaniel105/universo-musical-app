import { useEffect, useState, useRef } from "react";
import { supabase } from "./supabase";
import ListaCanciones from "./ListaCanciones";

// ==========================================
// COMPONENTE: REPRODUCTOR PERSONALIZADO
// ==========================================
const ReproductorPersonalizado = ({ 
  cancion, 
  onNext, 
  onPrev,
  isShuffle,
  setIsShuffle,
  isLoop,
  setIsLoop
}: { 
  cancion: any; 
  onNext: () => void; 
  onPrev: () => void;
  isShuffle: boolean;
  setIsShuffle: (val: boolean) => void;
  isLoop: boolean;
  setIsLoop: (val: boolean) => void;
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volumen, setVolumen] = useState(1);

  const audioUrl = cancion?.url_audio || cancion?.url_archivo || cancion?.url_cancion || cancion?.url;
  const PORTADA_DEFAULT = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500';

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((e) => console.log("Error al reproducir:", e));
      setIsPlaying(true);
      
      // Incrementar reproducciones
      if (cancion?.id) {
        supabase.from('canciones')
          .update({ reproducciones: (cancion.reproducciones || 0) + 1 })
          .eq('id', cancion.id)
          .then();
      }
    }
  }, [cancion]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolumen(newVol);
    if (audioRef.current) audioRef.current.volume = newVol;
  };

  const handleSongEnd = () => {
    if (isLoop) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      onNext();
    }
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
        onEnded={handleSongEnd}
      />

      {/* Detalle de Canción */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', minWidth: '200px' }}>
        <img src={cancion.portada_url || cancion.url_portada || cancion.portada || PORTADA_DEFAULT} alt={cancion.titulo} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
        <div>
          <h4 style={{ margin: 0, color: '#ffffff', fontSize: '14px' }}>{cancion.titulo || cancion.title || "Sin título"}</h4>
          <p style={{ margin: '3px 0 0 0', color: '#ff6b00', fontSize: '12px' }}>{cancion.artista || cancion.artist || "Artista desconocido"}</p>
        </div>
      </div>

      {/* Controles Principales */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1, maxWidth: '500px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          {/* 🔀 Shuffle */}
          <button 
            onClick={() => setIsShuffle(!isShuffle)} 
            style={{ background: 'none', border: 'none', color: isShuffle ? '#ff6b00' : '#8f929d', cursor: 'pointer', fontSize: '16px' }}
            title="Modo Aleatorio"
          >
            🔀
          </button>

          {/* ⏮️ Anterior */}
          <button onClick={onPrev} style={{ background: 'none', border: 'none', color: '#8f929d', cursor: 'pointer' }}>⏮️</button>

          {/* ▶️ / ⏸️ Play/Pausa */}
          <button onClick={togglePlay} style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#ff6b00', border: 'none', color: 'white', cursor: 'pointer' }}>
            {isPlaying ? '⏸' : '▶'}
          </button>

          {/* ⏭️ Siguiente */}
          <button onClick={onNext} style={{ background: 'none', border: 'none', color: '#8f929d', cursor: 'pointer' }}>⏭️</button>

          {/* 🔁 Loop */}
          <button 
            onClick={() => setIsLoop(!isLoop)} 
            style={{ background: 'none', border: 'none', color: isLoop ? '#ff6b00' : '#8f929d', cursor: 'pointer', fontSize: '16px' }}
            title="Repetir Canción"
          >
            🔁
          </button>
        </div>

        {/* Barra de Tiempo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
          <span style={{ fontSize: '11px', color: '#888' }}>{Math.floor(currentTime/60)}:{(currentTime%60 < 10 ? '0':'') + Math.floor(currentTime%60)}</span>
          <input type="range" min="0" max={duration || 0} value={currentTime} onChange={(e) => { if(audioRef.current) audioRef.current.currentTime = parseFloat(e.target.value); }} style={{ flex: 1, height: '4px', accentColor: '#ff6b00', cursor: 'pointer' }} />
          <span style={{ fontSize: '11px', color: '#888' }}>{Math.floor(duration/60)}:{(duration%60 < 10 ? '0':'') + Math.floor(duration%60)}</span>
        </div>
      </div>

      {/* 🔊 Control de Volumen */}
      <div style={{ minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
        <button onClick={() => handleVolumeChange(volumen === 0 ? 1 : 0)} style={{ background: 'none', border: 'none', color: '#8f929d', cursor: 'pointer' }}>
          {volumen === 0 ? '🔇' : volumen < 0.5 ? '🔉' : '🔊'}
        </button>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.05" 
          value={volumen} 
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          style={{ width: '80px', height: '4px', accentColor: '#ff6b00', cursor: 'pointer' }}
        />
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL APP
// ==========================================
export default function App() {
  const [session, setSession] = useState<any>(null);
  const [seccion, setSeccion] = useState<string>("descubrir");

  // Estados del reproductor
  const [cancionActual, setCancionActual] = useState<any>(null);
  const [listaCanciones, setListaCanciones] = useState<any[]>([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoop, setIsLoop] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Reproducir canción
  const handlePlaySong = (song: any, list?: any[]) => {
    setCancionActual(song);
    if (list && list.length > 0) {
      setListaCanciones(list);
    }
  };

  // Siguiente canción
  const handleNextSong = () => {
    if (!cancionActual || listaCanciones.length === 0) return;

    if (isShuffle) {
      const filtradas = listaCanciones.filter((c) => c.id !== cancionActual.id);
      const randomIndex = Math.floor(Math.random() * filtradas.length);
      setCancionActual(filtradas[randomIndex] || listaCanciones[0]);
    } else {
      const indexActual = listaCanciones.findIndex((c) => c.id === cancionActual.id);
      if (indexActual !== -1 && indexActual < listaCanciones.length - 1) {
        setCancionActual(listaCanciones[indexActual + 1]);
      } else {
        setCancionActual(listaCanciones[0]);
      }
    }
  };

  // Canción anterior
  const handlePrevSong = () => {
    if (!cancionActual || listaCanciones.length === 0) return;
    const indexActual = listaCanciones.findIndex((c) => c.id === cancionActual.id);
    if (indexActual > 0) {
      setCancionActual(listaCanciones[indexActual - 1]);
    } else {
      setCancionActual(listaCanciones[listaCanciones.length - 1]);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#09090b", color: "#FFF", fontFamily: "system-ui, sans-serif" }}>
      
      {/* 🧭 SIDEBAR / MENÚ LATERAL */}
      <aside style={{ width: "250px", backgroundColor: "#121215", padding: "2rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem", borderRight: "1px solid #222" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#F97316", margin: 0 }}>
          🌌 UNIVERSO MUSICAL
        </h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button
            onClick={() => setSeccion("descubrir")}
            style={{
              display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem",
              borderRadius: "8px", border: "none", backgroundColor: seccion === "descubrir" ? "#F97316" : "transparent",
              color: "#FFF", fontWeight: seccion === "descubrir" ? "bold" : "normal", cursor: "pointer", textAlign: "left"
            }}
          >
            🏠 Descubrir
          </button>
        </nav>
      </aside>

      {/* 📺 CONTENIDO PRINCIPAL */}
      <main style={{ flex: 1, paddingBottom: cancionActual ? "90px" : "0px", overflowY: "auto" }}>
        {seccion === "descubrir" && (
          <ListaCanciones
            userId={session?.user?.id}
            onPlaySong={(c: any, lista?: any[]) => handlePlaySong(c, lista)}
          />
        )}
      </main>

      {/* 🎵 REPRODUCTOR INFERIOR */}
      {cancionActual && (
        <ReproductorPersonalizado
          cancion={cancionActual}
          onNext={handleNextSong}
          onPrev={handlePrevSong}
          isShuffle={isShuffle}
          setIsShuffle={setIsShuffle}
          isLoop={isLoop}
          setIsLoop={setIsLoop}
        />
      )}
    </div>
  );
}
