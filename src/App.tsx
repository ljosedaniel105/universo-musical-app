import { useState, useEffect, useRef } from "react";
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
  setIsLoop,
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

  const audioUrl =
    cancion?.url_audio ||
    cancion?.url_archivo ||
    cancion?.url_cancion ||
    cancion?.url;
  const PORTADA_DEFAULT =
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500";

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play().catch((e) => console.log("Error al reproducir:", e));
      setIsPlaying(true);

      if (cancion?.id) {
        supabase
          .from("canciones")
          .update({ reproducciones: (cancion.reproducciones || 0) + 1 })
          .eq("id", cancion.id)
          .then();
      }
    }
  }, [cancion, audioUrl]);

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
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: "250px",
        right: 0,
        backgroundColor: "#0c0c0e",
        borderTop: "1px solid #ff6b0033",
        padding: "12px 30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 1000,
        boxShadow: "0 -4px 20px rgba(0,0,0,0.8)",
      }}
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={handleSongEnd}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "15px", minWidth: "200px" }}>
        <img
          src={cancion?.portada_url || cancion?.url_portada || cancion?.portada || PORTADA_DEFAULT}
          alt={cancion?.titulo || "Portada"}
          style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }}
        />
        <div>
          <h4 style={{ margin: 0, color: "#ffffff", fontSize: "14px" }}>
            {cancion?.titulo || cancion?.title || "Sin título"}
          </h4>
          <p style={{ margin: "3px 0 0 0", color: "#ff6b00", fontSize: "12px" }}>
            {cancion?.artista || cancion?.artist || "Artista desconocido"}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          flex: 1,
          maxWidth: "500px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            style={{
              background: "none",
              border: "none",
              color: isShuffle ? "#ff6b00" : "#8f929d",
              cursor: "pointer",
              fontSize: "16px",
            }}
            title="Modo Aleatorio"
          >
            🔀
          </button>

          <button
            onClick={onPrev}
            style={{ background: "none", border: "none", color: "#8f929d", cursor: "pointer" }}
          >
            ⏮️
          </button>

          <button
            onClick={togglePlay}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              backgroundColor: "#ff6b00",
              border: "none",
              color: "white",
              cursor: "pointer",
            }}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button
            onClick={onNext}
            style={{ background: "none", border: "none", color: "#8f929d", cursor: "pointer" }}
          >
            ⏭️
          </button>

          <button
            onClick={() => setIsLoop(!isLoop)}
            style={{
              background: "none",
              border: "none",
              color: isLoop ? "#ff6b00" : "#8f929d",
              cursor: "pointer",
              fontSize: "16px",
            }}
            title="Repetir Canción"
          >
            🔁
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
          <span style={{ fontSize: "11px", color: "#888" }}>
            {Math.floor(currentTime / 60)}:
            {(currentTime % 60 < 10 ? "0" : "") + Math.floor(currentTime % 60)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => {
              if (audioRef.current) audioRef.current.currentTime = parseFloat(e.target.value);
            }}
            style={{ flex: 1, height: "4px", accentColor: "#ff6b00", cursor: "pointer" }}
          />
          <span style={{ fontSize: "11px", color: "#888" }}>
            {Math.floor(duration / 60)}:
            {(duration % 60 < 10 ? "0" : "") + Math.floor(duration % 60)}
          </span>
        </div>
      </div>

      <div
        style={{
          minWidth: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "8px",
        }}
      >
        <button
          onClick={() => handleVolumeChange(volumen === 0 ? 1 : 0)}
          style={{ background: "none", border: "none", color: "#8f929d", cursor: "pointer" }}
        >
          {volumen === 0 ? "🔇" : volumen < 0.5 ? "🔉" : "🔊"}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volumen}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          style={{ width: "80px", height: "4px", accentColor: "#ff6b00", cursor: "pointer" }}
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handlePlaySong = (song: any, list?: any[]) => {
    setCancionActual(song);
    if (list && list.length > 0) {
      setListaCanciones(list);
    }
  };

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

  const handlePrevSong = () => {
    if (!cancionActual || listaCanciones.length === 0) return;
    const indexActual = listaCanciones.findIndex((c) => c.id === cancionActual.id);
    if (indexActual > 0) {
      setCancionActual(listaCanciones[indexActual - 1]);
    } else {
      setCancionActual(listaCanciones[listaCanciones.length - 1]);
    }
  };

  // Función auxiliar para estilar botones de navegación
  const getBtnStyle = (sectionKey: string) => {
    const isActive = seccion === sectionKey;
    return {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      padding: "0.75rem 1rem",
      borderRadius: "12px",
      border: isActive ? "1px solid #F97316" : "1px solid transparent",
      backgroundColor: isActive ? "rgba(249, 115, 22, 0.12)" : "transparent",
      color: isActive ? "#F97316" : "#A1A1AA",
      fontWeight: isActive ? "600" : "400",
      cursor: "pointer",
      textAlign: "left" as const,
      fontSize: "0.95rem",
      transition: "all 0.2s ease",
    };
  };

  const userEmail = session?.user?.email || "ljosedaniel105@gmail.com";
  const userName = userEmail.split("@")[0];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#09090b",
        color: "#FFF",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* 🧭 SIDEBAR / MENÚ LATERAL */}
      <aside
        style={{
          width: "250px",
          backgroundColor: "#0d0d0f",
          padding: "1.75rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRight: "1px solid #1c1c21",
        }}
      >
        <div>
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "2.5rem",
              paddingLeft: "0.25rem",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "radial-gradient(circle, #3b82f6 0%, #1e40af 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
              }}
            >
              🌌
            </div>
            <h2
              style={{
                fontSize: "1.1rem",
                fontWeight: "800",
                color: "#FFFFFF",
                letterSpacing: "0.5px",
                margin: 0,
              }}
            >
              UNIVERSO MUSICAL
            </h2>
          </div>

          {/* Menú de Opciones */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <button onClick={() => setSeccion("descubrir")} style={getBtnStyle("descubrir")}>
              🏠 Descubrir
            </button>

            <button onClick={() => setSeccion("playlists")} style={getBtnStyle("playlists")}>
              📑 Mis Playlists
            </button>

            <button onClick={() => setSeccion("subir")} style={getBtnStyle("subir")}>
              📤 Subir Música
            </button>

            <button onClick={() => setSeccion("admin")} style={getBtnStyle("admin")}>
              🛡️ Admin Panel
            </button>
          </nav>
        </div>

        {/* Sección de Perfil y Logout */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 0.5rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#8b5cf6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFF",
                fontWeight: "bold",
              }}
            >
              👤
            </div>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  color: "#FFF",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {userName}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#71717a",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {userEmail}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              border: "1px solid #3f1d1d",
              backgroundColor: "rgba(127, 29, 29, 0.2)",
              color: "#ef4444",
              fontWeight: "600",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            ↪ Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* 📺 CONTENIDO PRINCIPAL */}
      <main style={{ flex: 1, paddingBottom: cancionActual ? "90px" : "0px", overflowY: "auto" }}>
        {seccion === "descubrir" && (
          <ListaCanciones
            userId={session?.user?.id}
            onPlaySong={(c: any, lista?: any[]) => handlePlaySong(c, lista)}
          />
        )}

        {seccion === "playlists" && (
          <div style={{ padding: "2rem", color: "#A1A1AA" }}>
            <h2>📑 Mis Playlists</h2>
            <p>Sección en desarrollo...</p>
          </div>
        )}

        {seccion === "subir" && (
          <div style={{ padding: "2rem", color: "#A1A1AA" }}>
            <h2>📂 Subir Nueva Canción</h2>
            <p>Formulario de carga de canciones...</p>
          </div>
        )}

        {seccion === "admin" && (
          <div style={{ padding: "2rem", color: "#A1A1AA" }}>
            <h2>🛡️ Admin Panel</h2>
            <p>Panel de administración...</p>
          </div>
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
