import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function ListaCanciones({ 
  onPlaySong 
}: { 
  onPlaySong?: (song: any, songList?: any[]) => void;
}) {
  const [songs, setSongs] = useState<any[]>([]);
  const [generos, setGeneros] = useState<any[]>([]);
  const [selectedGenero, setSelectedGenero] = useState<string>("Todos");
  const [busqueda, setBusqueda] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: songsData } = await supabase.from("canciones").select("*");
      if (songsData) setSongs(songsData);

      const { data: generosData } = await supabase
        .from("generos")
        .select("*")
        .order("nombre", { ascending: true });
      if (generosData) setGeneros(generosData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSongs = songs.filter((song) => {
    const cumpleGenero =
      selectedGenero === "Todos" ||
      song.genero?.toLowerCase() === selectedGenero.toLowerCase();

    const termino = busqueda.toLowerCase();
    const titulo = (song.titulo || song.title || "").toLowerCase();
    const artista = (song.artista || song.artist || "").toLowerCase();
    const cumpleBusqueda = titulo.includes(termino) || artista.includes(termino);

    return cumpleGenero && cumpleBusqueda;
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "100%",
        minWidth: "0",
        padding: "1.5rem",
        boxSizing: "border-box",
        color: "#FFF",
        overflowX: "hidden"
      }}
    >
      {/* 🔍 BUSCADOR DE CANCIONES */}
      <div style={{ marginBottom: "1.5rem", maxWidth: "400px", width: "100%" }}>
        <input
          type="text"
          placeholder="🔍 Buscar por canción o artista..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            borderRadius: "20px",
            border: "1px solid #262626",
            backgroundColor: "#171717",
            color: "#FFF",
            outline: "none",
            fontSize: "0.9rem",
            boxSizing: "border-box"
          }}
        />
      </div>

      {/* Encabezado */}
      <h1 style={{ fontSize: "1.75rem", fontWeight: "bold", textAlign: "left", marginBottom: "1.5rem" }}>
        🌍 Todas las Canciones
      </h1>

      {/* 🏷️ PESTAÑAS DE GÉNEROS */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          overflowX: "auto",
          paddingBottom: "0.75rem",
          marginBottom: "1.5rem",
          width: "100%",
          maxWidth: "100%",
          minWidth: "0",
          boxSizing: "border-box"
        }}
      >
        <button
          onClick={() => setSelectedGenero("Todos")}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "20px",
            border: selectedGenero === "Todos" ? "none" : "1px solid #333",
            backgroundColor: selectedGenero === "Todos" ? "#F97316" : "#171717",
            color: "#FFF",
            fontWeight: selectedGenero === "Todos" ? "bold" : "normal",
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0
          }}
        >
          🔥 Todos
        </button>

        {generos.map((g) => {
          const isActive = selectedGenero.toLowerCase() === g.nombre.toLowerCase();
          return (
            <button
              key={g.id || g.nombre}
              onClick={() => setSelectedGenero(g.nombre)}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "20px",
                border: isActive ? "none" : "1px solid #333",
                backgroundColor: isActive ? "#F97316" : "#171717",
                color: "#FFF",
                fontWeight: isActive ? "bold" : "normal",
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0
              }}
            >
              {g.nombre}
            </button>
          );
        })}
      </div>

      {/* 🎵 GRILLA DE TARJETAS */}
      {loading ? (
        <p style={{ color: "#AAA", textAlign: "center" }}>Cargando canciones...</p>
      ) : filteredSongs.length === 0 ? (
        <p style={{ color: "#AAA", textAlign: "center" }}>
          No se encontraron canciones.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "1.5rem",
            width: "100%",
            boxSizing: "border-box"
          }}
        >
          {filteredSongs.map((song) => (
            <div
              key={song.id}
              style={{
                backgroundColor: "#171717",
                borderRadius: "12px",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                border: "1px solid #262626",
                boxSizing: "border-box"
              }}
            >
              {/* Carátula */}
              <img
                src={song.portada || song.url_portada || "https://via.placeholder.com/180"}
                alt={song.titulo}
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "0.75rem"
                }}
              />

              {/* Título */}
              <h3
                style={{
                  fontSize: "1.05rem",
                  fontWeight: "bold",
                  margin: "0 0 0.25rem 0",
                  width: "100%",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {song.titulo || song.title || "Sin Título"}
              </h3>

              {/* Artista */}
              <p
                style={{
                  color: "#A1A1AA",
                  fontSize: "0.875rem",
                  margin: 0,
                  width: "100%",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {song.artista || song.artist || "Artista desconocido"}
              </p>

              {/* 🏷️ Etiqueta de Género y Contador */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.4rem" }}>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "0.75rem",
                    backgroundColor: "rgba(249, 115, 22, 0.15)",
                    color: "#F97316",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "12px",
                    fontWeight: "500"
                  }}
                >
                  {song.genero || "Sin Género"}
                </span>
                <span style={{ fontSize: "0.75rem", color: "#666" }}>
                  ▶ {song.reproducciones || 0}
                </span>
              </div>

              {/* Botón Escuchar */}
              <button
                onClick={() => onPlaySong && onPlaySong(song, filteredSongs)}
                style={{
                  width: "100%",
                  marginTop: "1rem",
                  padding: "0.6rem",
                  backgroundColor: "#F97316",
                  color: "#FFF",
                  border: "none",
                  borderRadius: "20px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem"
                }}
              >
                ▶ Escuchar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
