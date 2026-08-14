import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function ListaCanciones({ 
  onPlaySong,
  userId 
}: { 
  onPlaySong?: (song: any, songList?: any[]) => void;
  userId?: string;
}) {
  const [songs, setSongs] = useState<any[]>([]);
  const [generos, setGeneros] = useState<any[]>([]);
  const [selectedGenero, setSelectedGenero] = useState<string>("Todos");
  const [busqueda, setBusqueda] = useState<string>("");
  const [favoritosIds, setFavoritosIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Cargar canciones
      const { data: songsData } = await supabase.from("canciones").select("*");
      if (songsData) setSongs(songsData);

      // Cargar géneros
      const { data: generosData } = await supabase
        .from("generos")
        .select("*")
        .order("nombre", { ascending: true });
      if (generosData) setGeneros(generosData);

      // Cargar Favoritos del usuario
      if (userId) {
        const { data: favs } = await supabase
          .from("favoritos")
          .select("cancion_id")
          .eq("usuario_id", userId);
        
        if (favs) {
          setFavoritosIds(favs.map((f: any) => f.cancion_id));
        }
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lógica de Favoritos (Me Gusta)
  const toggleFavorito = async (cancionId: number) => {
    if (!userId) {
      alert("Inicia sesión para guardar canciones en tus favoritos.");
      return;
    }

    const esFavorito = favoritosIds.includes(cancionId);

    if (esFavorito) {
      setFavoritosIds(favoritosIds.filter((id) => id !== cancionId));
      await supabase
        .from("favoritos")
        .delete()
        .eq("usuario_id", userId)
        .eq("cancion_id", cancionId);
    } else {
      setFavoritosIds([...favoritosIds, cancionId]);
      await supabase
        .from("favoritos")
        .insert([{ usuario_id: userId, cancion_id: cancionId }]);
    }
  };

  // Filtrado por género y por término de búsqueda
  const filteredSongs = songs.filter((song) => {
    const coincideGenero =
      selectedGenero === "Todos" ||
      song.genero?.toLowerCase() === selectedGenero.toLowerCase();
    
    const termino = busqueda.toLowerCase();
    const coincideBusqueda =
      (song.titulo || song.title || "").toLowerCase().includes(termino) ||
      (song.artista || song.artist || "").toLowerCase().includes(termino);

    return coincideGenero && coincideBusqueda;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", padding: "1.5rem", boxSizing: "border-box", color: "#FFF" }}>
      
      {/* Encabezado y Buscador */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", gap: "1rem", flexWrap: "wrap" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "bold", margin: 0 }}>
          🌍 Todas las Canciones
        </h1>

        {/* 🔍 BUSCADOR EN TIEMPO REAL */}
        <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
          <input
            type="text"
            placeholder="🔍 Buscar por canción o artista..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 1rem",
              borderRadius: "20px",
              border: "1px solid #333",
              backgroundColor: "#171717",
              color: "#FFF",
              fontSize: "0.9rem",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
        </div>
      </div>

      {/* 🏷️ PESTAÑAS DE GÉNEROS */}
      <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "0.75rem", marginBottom: "1.5rem", width: "100%" }}>
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
            whiteSpace: "nowrap"
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
                whiteSpace: "nowrap"
              }}
            >
              {g.nombre}
            </button>
          );
        })}
      </div>

      {/* 🎵 GRILLA DE CANCIONES */}
      {loading ? (
        <p style={{ color: "#AAA", textAlign: "center" }}>Cargando canciones...</p>
      ) : filteredSongs.length === 0 ? (
        <p style={{ color: "#AAA", textAlign: "center" }}>
          No se encontraron canciones.
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem", width: "100%" }}>
          {filteredSongs.map((song) => {
            const esFav = favoritosIds.includes(song.id);
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
                  border: "1px solid #262626",
                  position: "relative"
                }}
              >
                {/* ❤️ Botón Favorito */}
                <button
                  onClick={() => toggleFavorito(song.id)}
                  style={{
                    position: "absolute",
                    top: "1.2rem",
                    right: "1.2rem",
                    background: "rgba(0,0,0,0.6)",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    transition: "transform 0.2s"
                  }}
                  title={esFav ? "Quitar de Favoritos" : "Añadir a Favoritos"}
                >
                  {esFav ? "❤️" : "🤍"}
                </button>

                {/* Carátula */}
                <img
                  src={song.portada || song.url_portada || "https://via.placeholder.com/180"}
                  alt={song.titulo}
                  style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px", marginBottom: "0.75rem" }}
                />

                {/* Título */}
                <h3 style={{ fontSize: "1.05rem", fontWeight: "bold", margin: "0 0 0.25rem 0", width: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {song.titulo || song.title || "Sin Título"}
                </h3>

                {/* Artista */}
                <p style={{ color: "#A1A1AA", fontSize: "0.875rem", margin: 0, width: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {song.artista || song.artist || "Artista desconocido"}
                </p>

                {/* Info extra: Género y Reproducciones */}
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", backgroundColor: "rgba(249, 115, 22, 0.15)", color: "#F97316", padding: "0.2rem 0.6rem", borderRadius: "12px", fontWeight: "500" }}>
                    {song.genero || "Sin Género"}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#888" }}>
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
                    cursor: "pointer"
                  }}
                >
                  ▶ Escuchar
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
