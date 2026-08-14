import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Admin() {
  const [users, setUsers] = useState<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalSongs: 0, totalPlaylists: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: usersData } = await supabase.from("perfiles").select("*");
      const { data: songsData } = await supabase.from("canciones").select("*");
      const { data: playlistsData } = await supabase.from("playlists").select("*");

      if (usersData) setUsers(usersData);
      if (songsData) setSongs(songsData);

      setStats({
        totalUsers: usersData ? usersData.length : 0,
        totalSongs: songsData ? songsData.length : 0,
        totalPlaylists: playlistsData ? playlistsData.length : 0,
      });
    } catch (error) {
      console.error("Error cargando datos del panel admin:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteSong = async (id: number) => {
    const confirmDelete = window.confirm("¿Seguro que deseas eliminar esta canción del sistema?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("canciones").delete().eq("id", id);
    if (!error) {
      fetchData();
    } else {
      alert("Error al eliminar la canción");
    }
  };

  const handleDeleteUser = async (id: string) => {
    const confirmDelete = window.confirm("¿Seguro que deseas eliminar este usuario? Su perfil se eliminará del registro.");
    if (!confirmDelete) return;

    const { error } = await supabase.from("perfiles").delete().eq("id", id);
    if (!error) {
      fetchData();
    } else {
      alert("Error al eliminar el usuario: " + error.message);
    }
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", backgroundColor: "#0A0A0A", color: "#FFFFFF", padding: "2rem 1.5rem", boxSizing: "border-box" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* Encabezado */}
        <header style={{ display: "flex", alignItems: "center", gap: "1rem", textAlign: "left" }}>
          <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "0.75rem", borderRadius: "12px", fontSize: "1.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            🛡️
          </div>
          <div>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", margin: 0, color: "#FFFFFF" }}>Panel de Control</h1>
            <p style={{ color: "#A1A1AA", margin: "0.25rem 0 0 0", fontSize: "0.95rem" }}>Gestión de recursos y usuarios del sistema.</p>
          </div>
        </header>

        {/* Tarjetas de Estadísticas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
          <div style={{ backgroundColor: "#171717", border: "1px solid #262626", borderRadius: "12px", padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#A1A1AA", fontSize: "0.875rem", fontWeight: 500 }}>
              <span>Total Usuarios</span>
              <span>👥</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#FFFFFF", marginTop: "0.5rem", textAlign: "left" }}>{stats.totalUsers}</div>
          </div>

          <div style={{ backgroundColor: "#171717", border: "1px solid #262626", borderRadius: "12px", padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#A1A1AA", fontSize: "0.875rem", fontWeight: 500 }}>
              <span>Total Canciones</span>
              <span>🎵</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#FFFFFF", marginTop: "0.5rem", textAlign: "left" }}>{stats.totalSongs}</div>
          </div>

          <div style={{ backgroundColor: "#171717", border: "1px solid #262626", borderRadius: "12px", padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#A1A1AA", fontSize: "0.875rem", fontWeight: 500 }}>
              <span>Total Playlists</span>
              <span>📚</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#FFFFFF", marginTop: "0.5rem", textAlign: "left" }}>{stats.totalPlaylists}</div>
          </div>
        </div>

        {/* Tablas de Gestión */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem" }}>
          
          {/* Tabla de Usuarios */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", textAlign: "left" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", margin: 0, color: "#FFFFFF" }}>Directorio de Usuarios</h2>
            <div style={{ backgroundColor: "#171717", borderRadius: "12px", border: "1px solid #262626", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#0A0A0A", borderBottom: "1px solid #262626" }}>
                    <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", textTransform: "uppercase", color: "#A1A1AA" }}>Nombre / Apodo</th>
                    <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", textTransform: "uppercase", color: "#A1A1AA" }}>Email / ID</th>
                    <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", textTransform: "uppercase", color: "#A1A1AA", textAlign: "right" }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} style={{ padding: "1rem", textAlign: "center", color: "#71717A" }}>Cargando usuarios...</td>
                    </tr>
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id} style={{ borderBottom: "1px solid #262626" }}>
                        <td style={{ padding: "0.85rem 1rem", fontWeight: 500, color: "#FFFFFF" }}>{user.apodo || user.nombre || "Usuario"}</td>
                        <td style={{ padding: "0.85rem 1rem", color: "#A1A1AA", fontSize: "0.875rem" }}>{user.email || user.id}</td>
                        <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.1rem", padding: "0.25rem 0.5rem", borderRadius: "6px" }}
                            title="Eliminar usuario"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} style={{ padding: "1rem", textAlign: "center", color: "#71717A" }}>No hay usuarios registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla de Canciones */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", textAlign: "left" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", margin: 0, color: "#FFFFFF" }}>Galería de Canciones</h2>
            <div style={{ backgroundColor: "#171717", borderRadius: "12px", border: "1px solid #262626", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#0A0A0A", borderBottom: "1px solid #262626" }}>
                    <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", textTransform: "uppercase", color: "#A1A1AA" }}>Canción</th>
                    <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", textTransform: "uppercase", color: "#A1A1AA" }}>Artista</th>
                    <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", textTransform: "uppercase", color: "#A1A1AA", textAlign: "right" }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} style={{ padding: "1rem", textAlign: "center", color: "#71717A" }}>Cargando canciones...</td>
                    </tr>
                  ) : songs.length > 0 ? (
                    songs.map((song) => (
                      <tr key={song.id} style={{ borderBottom: "1px solid #262626" }}>
                        <td style={{ padding: "0.85rem 1rem", fontWeight: 500, color: "#FFFFFF" }}>{song.titulo || song.title || "Sin título"}</td>
                        <td style={{ padding: "0.85rem 1rem", color: "#A1A1AA", fontSize: "0.875rem" }}>{song.artista || song.artist || "Desconocido"}</td>
                        <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                          <button
                            onClick={() => handleDeleteSong(song.id)}
                            style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.1rem", padding: "0.25rem 0.5rem", borderRadius: "6px" }}
                            title="Eliminar canción"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} style={{ padding: "1rem", textAlign: "center", color: "#71717A" }}>No hay canciones en el sistema.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
