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
        left: "260px",
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
  // Pestaña inicial para que abra directo en la vista de la captura
  const [seccion, setSeccion] = useState<string>("subir");

  const [cancionActual, setCancionActual] = useState<any>(null);
  const [listaCanciones, setListaCanciones] = useState<any[]>([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoop, setIsLoop] = useState(false);

  // Estados del Formulario
  const [titulo, setTitulo] = useState("");
  const [genero, setGenero] = useState("");
  const [artista, setArtista] = useState("");
  const [archivoMp3, setArchivoMp3] = useState<File | null>(null);
  const [archivoPortada, setArchivoPortada] = useState<File | null>(null);

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

  const getBtnStyle = (sectionKey: string) => {
    const isActive = seccion === sectionKey;
    return {
      display: "flex",
      alignItems: "center",
      gap: "0.85rem",
      padding: "0.75rem 1.25rem",
      borderRadius: "14px",
      border: isActive ? "1.5px solid #ea580c" : "1px solid transparent",
      backgroundColor: isActive ? "rgba(234, 88, 12, 0.12)" : "transparent",
      color: isActive ? "#ea580c" : "#9ca3af",
      fontWeight: isActive ? "600" : "400",
      cursor: "pointer",
      textAlign: "left" as const,
      fontSize: "0.95rem",
      width: "100%",
      boxSizing: "border-box" as const,
    };
  };

  const userEmail = session?.user?.email || "ljosedaniel105@gmail.com";
  const userName = userEmail.split("@")[0];

  const LOGO_URL =
    "https://gfpvkkroxjxpyfinhopi.supabase.co/storage/v1/object/public/portadas/logo.png";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#050505",
        color: "#FFF",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* 🧭 BARRA LATERAL */}
      <aside
        style={{
          width: "260px",
          backgroundColor: "#000000",
          padding: "2rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRight: "1px solid #141414",
        }}
      >
        <div>
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "3rem",
              paddingLeft: "0.5rem",
            }}
          >
            <img
              src={LOGO_URL}
              alt="Logo Universo Musical"
              style={{ width: "32px", height: "32px", objectFit: "contain" }}
            />
            <h2
              style={{
                fontSize: "1.05rem",
                fontWeight: "900",
                color: "#FFFFFF",
                letterSpacing: "1px",
                margin: 0,
              }}
            >
              UNIVERSO MUSICAL
            </h2>
          </div>

          {/* Opciones de Navegación */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <button onClick={() => setSeccion("descubrir")} style={getBtnStyle("descubrir")}>
              <span style={{ fontSize: "1.1rem" }}>🏠</span> Descubrir
            </button>

            <button onClick={() => setSeccion("playlists")} style={getBtnStyle("playlists")}>
              <span style={{ fontSize: "1.1rem" }}>📑</span> Mis Playlists
            </button>

            <button onClick={() => setSeccion("subir")} style={getBtnStyle("subir")}>
              <span style={{ fontSize: "1.1rem" }}>📤</span> Subir Música
            </button>

            <button onClick={() => setSeccion("admin")} style={getBtnStyle("admin")}>
              <span style={{ fontSize: "1.1rem" }}>🛡️</span> Admin Panel
            </button>
          </nav>
        </div>

        {/* Información del Usuario y Logout */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 0.5rem" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                backgroundColor: "#a855f7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFF",
                fontSize: "0.9rem",
              }}
            >
              👤
            </div>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "700",
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
                  color: "#6b7280",
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
              gap: "0.6rem",
              padding: "0.75rem 1.25rem",
              borderRadius: "14px",
              border: "1px solid #3f1d1d",
              backgroundColor: "#160a0a",
              color: "#ef4444",
              fontWeight: "600",
              fontSize: "0.85rem",
              cursor: "pointer",
              width: "100%",
            }}
          >
            <span>↳</span> Cerrar Sesión
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
          <div style={{ maxWidth: "620px", margin: "2.5rem auto", padding: "0 1.5rem" }}>
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                color: "#ea580c",
                fontSize: "1.35rem",
                fontWeight: "700",
                marginBottom: "2rem",
              }}
            >
              📁 Subir Nueva Canción
            </h2>

            <form
              onSubmit={(e) => e.preventDefault()}
              style={{
                backgroundColor: "#0d0d0d",
                padding: "2.25rem",
                borderRadius: "16px",
                border: "1px solid #1a1a1a",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.6rem",
                    fontSize: "0.9rem",
                    color: "#d1d5db",
                  }}
                >
                  Título de la Canción:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Ojitos Lindos"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid #262626",
                    backgroundColor: "#050505",
                    color: "#fff",
                    boxSizing: "border-box",
                    outline: "none",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.6rem",
                  }}
                >
                  <label style={{ fontSize: "0.9rem", color: "#d1d5db" }}>Género Musical:</label>
                  <span
                    style={{
                      color: "#ea580c",
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    + Agregar nuevo género
                  </span>
                </div>
                <select
                  value={genero}
                  onChange={(e) => setGenero(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid #262626",
                    backgroundColor: "#050505",
                    color: "#fff",
                    boxSizing: "border-box",
                    outline: "none",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="">-- Selecciona un género --</option>
                  <option value="urbano">Urbano</option>
                  <option value="pop">Pop</option>
                  <option value="rock">Rock</option>
                </select>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.6rem",
                  }}
                >
                  <label style={{ fontSize: "0.9rem", color: "#d1d5db" }}>Artista / Banda:</label>
                  <span
                    style={{
                      color: "#ea580c",
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    + Agregar nuevo artista
                  </span>
                </div>
                <select
                  value={artista}
                  onChange={(e) => setArtista(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid #262626",
                    backgroundColor: "#050505",
                    color: "#fff",
                    boxSizing: "border-box",
                    outline: "none",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="">-- Selecciona un artista --</option>
                  <option value="prince_royce">Prince Royce</option>
                  <option value="temerarios">Los Temerarios</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.6rem",
                    fontSize: "0.9rem",
                    color: "#d1d5db",
                  }}
                >
                  🎵 Seleccionar MP3:
                </label>
                <div
                  style={{
                    backgroundColor: "#050505",
                    border: "1px solid #262626",
                    borderRadius: "10px",
                    padding: "0.5rem 0.75rem",
                  }}
                >
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setArchivoMp3(e.target.files?.[0] || null)}
                    style={{
                      width: "100%",
                      color: "#9ca3af",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.6rem",
                    fontSize: "0.9rem",
                    color: "#d1d5db",
                  }}
                >
                  🖼️ Imagen de Portada (Opcional):
                </label>
                <div
                  style={{
                    backgroundColor: "#050505",
                    border: "1px solid #262626",
                    borderRadius: "10px",
                    padding: "0.5rem 0.75rem",
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setArchivoPortada(e.target.files?.[0] || null)}
                    style={{
                      width: "100%",
                      color: "#9ca3af",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  padding: "0.9rem",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "#ea580c",
                  color: "#FFF",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  cursor: "pointer",
                  marginTop: "0.75rem",
                  transition: "background-color 0.2s",
                }}
              >
                Guardar Canción 🚀
              </button>
            </form>
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
