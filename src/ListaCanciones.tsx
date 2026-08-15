import { useEffect, useState } from "react";
// @ts-ignore
import { supabase } from "./supabase";

export default function ListaCanciones({ 
  userId,
  onPlay 
}: { 
  userId?: string;
  onPlay?: (song: any, songList?: any[]) => void;
}) {
  const [songs, setSongs] = useState<any[]>([]);
  const [generos, setGeneros] = useState<any[]>([]);
  const [selectedGenero, setSelectedGenero] = useState<string>("Todos");
  const [busqueda, setBusqueda] = useState<string>("");
  const [dislikedIds, setDislikedIds] = useState<string[]>([]);
  const [likesMap, setLikesMap] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Cargar todas las canciones
      const { data: songsData } = await supabase.from("canciones").select("*");
      if (songsData) setSongs(songsData);

      // 2. Cargar géneros
      const { data: generosData } = await supabase
        .from("generos")
        .select("*")
        .order("nombre", { ascending: true });
      if (generosData) setGeneros(generosData);

      // 3. Cargar las canciones ocultadas por este usuario ("No Me Gusta")
      if (userId) {
        const { data: dislikeData } = await supabase
          .from("no_me_gusta")
          .select("cancion_id")
          .eq("usuario_id", userId);
        
        if (dislikeData) {
          setDislikedIds(dislikeData.map((item: any) => item.cancion_id));
        }
      }

      // 4. Contar total de "Me Gusta" por canción
      const { data: likesData } = await supabase.from("me_gusta").select("cancion_id");
      if (likesData) {
        const counts: { [key: string]: number } = {};
        likesData.forEach((item: any) => {
          counts[item.cancion_id] = (counts[item.cancion_id] || 0) + 1;
        });
        setLikesMap(counts);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de canciones (Excluye las que tienen "No Me Gusta")
  const filteredSongs = songs.filter((song) => {
    if (dislikedIds.includes(song.id)) return false;

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
          {filteredSongs.map((song) => {
            const PORTADA_DEFAULT = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500';
            const urlPortada = song.portada_url || song.url_portada || song.portada || PORTADA_DEFAULT;
            const totalLikes = likesMap[song.id] || 0;

            return (
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
                  border: "1px solid #262626"
                }}
              >
                <img
                  src={urlPortada}
                  alt={song.titulo || song.title}
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "0.75rem"
                  }}
                />
                <h3 style={{ fontSize: "1rem", fontWeight: "bold", margin: "0 0 0.25rem 0", color: "#FFF" }}>
                  {song.titulo || song.title || "Sin título"}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#AAA", margin: "0 0 0.5rem 0" }}>
                  {song.artista || song.artist || "Artista desconocido"}
                </p>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.75rem" }}>
                  {song.genero && (
                    <span style={{ fontSize: "0.75rem", backgroundColor: "#262626", color: "#F97316", padding: "0.2rem 0.5rem", borderRadius: "10px" }}>
                      {song.genero}
                    </span>
                  )}
                  <span style={{ fontSize: "0.75rem", color: "#AAA" }}>
                    👍 {totalLikes}
                  </span>
                </div>
                <button
                  onClick={() => onPlay && onPlay(song, filteredSongs)}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "20px",
                    border: "none",
                    backgroundColor: "#F97316",
                    color: "#FFF",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem"
                  }}
                >
                  ► Escuchar
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
