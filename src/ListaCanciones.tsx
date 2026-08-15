import { useState, useEffect } from "react";
import { supabase } from "./supabase";

interface ListaCancionesProps {
  userId?: string;
  onPlaySong: (cancion: any, lista: any[]) => void;
}

export default function ListaCanciones({ userId, onPlaySong }: ListaCancionesProps) {
  const [canciones, setCanciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchCanciones = async () => {
      try {
        const { data, error } = await supabase
          .from("canciones")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error al obtener canciones:", error);
        } else {
          setCanciones(data || []);
        }
      } catch (err) {
        console.error("Error inesperado:", err);
      } finally {
        setCargando(false);
      }
    };

    fetchCanciones();
  }, [userId]);

  if (cargando) {
    return (
      <div style={{ padding: "2rem", color: "#888" }}>
        Cargando lista de canciones...
      </div>
    );
  }

  if (canciones.length === 0) {
    return (
      <div style={{ padding: "2rem", color: "#888" }}>
        No hay canciones disponibles aún.
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ marginBottom: "1.5rem", color: "#FFF" }}>Canciones Disponibles</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {canciones.map((song) => (
          <div
            key={song.id}
            onClick={() => onPlaySong(song, canciones)}
            style={{
              backgroundColor: "#18181b",
              borderRadius: "12px",
              padding: "1rem",
              cursor: "pointer",
              transition: "transform 0.2s, background-color 0.2s",
              border: "1px solid #27272a",
            }}
          >
            <img
              src={
                song.portada_url ||
                song.url_portada ||
                song.portada ||
                "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500"
              }
              alt={song.titulo}
              style={{
                width: "100%",
                height: "160px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "0.75rem",
              }}
            />
            <h3
              style={{
                fontSize: "0.95rem",
                fontWeight: "bold",
                color: "#FFF",
                margin: "0 0 0.25rem 0",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {song.titulo || song.title || "Sin título"}
            </h3>
            <p
              style={{
                fontSize: "0.8rem",
                color: "#F97316",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {song.artista || song.artist || "Artista desconocido"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
