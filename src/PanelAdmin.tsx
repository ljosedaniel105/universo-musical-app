import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Admin() {
  const [users, setUsers] = useState<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalSongs: 0, totalPlaylists: 0 });
  const [loading, setLoading] = useState(true);

  // Listas de géneros y artistas para los selectores
  const [generos, setGeneros] = useState<any[]>([]);
  const [artistas, setArtistas] = useState<any[]>([]);

  // Estado para el modal de edición de canciones
  const [songToEdit, setSongToEdit] = useState<any | null>(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editArtista, setEditArtista] = useState("");
  const [editGenero, setEditGenero] = useState("");

  // Cargar datos principales y catálogos
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: usersData } = await supabase.from("perfiles").select("*");
      const { data: songsData } = await supabase.from("canciones").select("*");
      const { data: playlistsData } = await supabase.from("playlists").select("*");

      const { data: generosData } = await supabase.from("generos").select("*").order("nombre", { ascending: true });
      const { data: artistasData } = await supabase.from("artistas").select("*").order("nombre", { ascending: true });

      if (usersData) setUsers(usersData);
      if (songsData) setSongs(songsData);
      if (generosData) setGeneros(generosData);
      if (artistasData) setArtistas(artistasData);

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

  // Eliminar Canción
  const handleDeleteSong = async (id: number) => {
    const confirmDelete = window.confirm("¿Seguro que deseas eliminar esta canción?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("canciones").delete().eq("id", id);
    if (!error) {
      alert("Canción eliminada correctamente.");
      fetchData();
    } else {
      alert("Error al eliminar la canción: " + error.message);
    }
  };

  // Abrir Modal de Edición
  const handleOpenEdit = (song: any) => {
    setSongToEdit(song);
    setEditTitulo(song.titulo || song.title || "");
    setEditArtista(song.artista || song.artist || "");
    setEditGenero(song.genero || "");
  };

  // Guardar Cambios de la Canción Editada
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songToEdit) return;

    try {
      const artistaLimpio = editArtista.trim();
      const generoLimpio = editGenero.trim();

      // 1. Asegurar registro en la tabla 'artistas'
      if (artistaLimpio) {
        const { data: artExiste } = await supabase.from("artistas").select("nombre").ilike("nombre", artistaLimpio).maybeSingle();
        if (!artExiste) {
          await supabase.from("artistas").insert([{ nombre: artistaLimpio }]);
        }
      }

      // 2. Asegurar registro en la tabla 'generos'
      if (generoLimpio) {
        const { data: genExiste } = await supabase.from("generos").select("nombre").ilike("nombre", generoLimpio).maybeSingle();
        if (!genExiste) {
          await supabase.from("generos").insert([{ nombre: generoLimpio }]);
        }
      }

      // 3. Actualizar la canción en la tabla 'canciones'
      const { data, error } = await supabase
        .from("canciones")
        .update({
          titulo: editTitulo,
          artista: artistaLimpio,
          genero: generoLimpio,
        })
        .eq("id", songToEdit.id)
        .select();

      if (error) {
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        alert("No se pudo actualizar la canción. Revisa si la política RLS de UPDATE está activa en Supabase.");
        return;
      }

      alert("¡Canción actualizada correctamente! 🚀");
      setSongToEdit(null); // Cerrar ventana de edición
      fetchData(); // Recargar tablas
    } catch (err: any) {
      alert("Error al actualizar la canción: " + err.message);
      console.error(err);
    }
  };

  // Eliminar Usuario mediante función RPC
  const handleDeleteUser = async (userRecord: any) => {
    const userId = userRecord.id || userRecord.user_id || userRecord.uid;
    const nombreUsuario = userRecord.apodo || userRecord.nombre || userRecord.email || "este usuario";

    if (!window.confirm(`¿Seguro que deseas eliminar al usuario "${nombreUsuario}"?`)) return;

    try {
      const { error } = await supabase.rpc("borrar_usuario_admin", { usuario_id: userId });
      if (error) {
        alert("Error al eliminar usuario: " + error.message);
      } else {
        alert("Usuario eliminado correctamente.");
        fetchData();
      }
    } catch (err: any) {
      alert("Error inesperado: " + err.message);
    }
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", backgroundColor: "#0A0A0A", color: "#FFFFFF", padding: "2rem 1.5rem", boxSizing: "border-box", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* Encabezado */}
        <header style={{ display: "flex", alignItems: "center", gap: "1rem", textAlign: "left" }}>
          <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "0.75rem", borderRadius: "12px", fontSize: "1.75rem" }}>
            🛡️
          </div>
          <div>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", margin: 0 }}>Panel de Control</h1>
            <p style={{ color: "#A1A1AA", margin: "0.25rem 0 0 0", fontSize: "0.95rem" }}>Gestión de recursos y usuarios del sistema.</p>
          </div>
        </header>

        {/* Tarjetas de Estadísticas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
          <div style={{ backgroundColor: "#171717", border: "1px solid #262626", borderRadius: "12px", padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#A1A1AA", fontSize: "0.875rem" }}>
              <span>Total Usuarios</span>
              <span>👥</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", marginTop: "0.5rem", textAlign: "left" }}>{stats.totalUsers}</div>
          </div>

          <div style={{ backgroundColor: "#171717", border: "1px solid #262626", borderRadius: "12px", padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#A1A1AA", fontSize: "0.875rem" }}>
              <span>Total Canciones</span>
              <span>🎵</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", marginTop: "0.5rem", textAlign: "left" }}>{stats.totalSongs}</div>
          </div>

          <div style={{ backgroundColor: "#171717", border: "1px solid #262626", borderRadius: "12px", padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#A1A1AA", fontSize: "0.875rem" }}>
              <span>Total Playlists</span>
              <span>📚</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", marginTop: "0.5rem", textAlign: "left" }}>{stats.totalPlaylists}</div>
          </div>
        </div>

        {/* Tablas principales */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem" }}>
          
          {/* Tabla de Usuarios */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", textAlign: "left" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", margin: 0 }}>Directorio de Usuarios</h2>
            <div style={{ backgroundColor: "#171717", borderRadius: "12px", border: "1px solid #262626", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#0A0A0A", borderBottom: "1px solid #262626" }}>
                    <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", textTransform: "uppercase", color: "#A1A1AA" }}>Nombre</th>
                    <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", textTransform: "uppercase", color: "#A1A1AA" }}>Email / ID</th>
                    <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", textTransform: "uppercase", color: "#A1A1AA", textAlign: "right" }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={3} style={{ padding: "1rem", textAlign: "center", color: "#71717A" }}>Cargando...</td></tr>
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id || user.user_id} style={{ borderBottom: "1px solid #262626" }}>
                        <td style={{ padding: "0.85rem 1rem", fontWeight: 500 }}>{user.apodo || user.nombre || "Usuario"}</td>
                        <td style={{ padding: "0.85rem 1rem", color: "#A1A1AA", fontSize: "0.875rem" }}>{user.email || user.id}</td>
                        <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                          <button onClick={() => handleDeleteUser(user)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }} title="Eliminar usuario">🗑️</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={3} style={{ padding: "1rem", textAlign: "center", color: "#71717A" }}>Sin usuarios.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla de Canciones */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", textAlign: "left" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", margin: 0 }}>Galería de Canciones</h2>
            <div style={{ backgroundColor: "#171717", borderRadius: "12px", border: "1px solid #262626", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#0A0A0A", borderBottom: "1px solid #262626" }}>
                    <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", textTransform: "uppercase", color: "#A1A1AA" }}>Canción</th>
                    <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", textTransform: "uppercase", color: "#A1A1AA" }}>Artista / Género</th>
                    <th style={{ padding: "0.85rem 1rem", fontSize: "0.75rem", textTransform: "uppercase", color: "#A1A1AA", textAlign: "right" }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={3} style={{ padding: "1rem", textAlign: "center", color: "#71717A" }}>Cargando...</td></tr>
                  ) : songs.length > 0 ? (
                    songs.map((song) => (
                      <tr key={song.id} style={{ borderBottom: "1px solid #262626" }}>
                        <td style={{ padding: "0.85rem 1rem", fontWeight: 500 }}>{song.titulo || song.title || "Sin título"}</td>
                        <td style={{ padding: "0.85rem 1rem", color: "#A1A1AA", fontSize: "0.85rem" }}>
                          <div>{song.artista || song.artist || "Desconocido"}</div>
                          <span style={{ fontSize: "0.75rem", color: "#F97316" }}>{song.genero || "Sin género"}</span>
                        </td>
                        <td style={{ padding: "0.85rem 1rem", textAlign: "right", whiteSpace: "nowrap" }}>
                          <button onClick={() => handleOpenEdit(song)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", marginRight: "0.5rem" }} title="Editar canción">✏️</button>
                          <button onClick={() => handleDeleteSong(song.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }} title="Eliminar canción">🗑️</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={3} style={{ padding: "1rem", textAlign: "center", color: "#71717A" }}>Sin canciones.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* MODAL DE EDICIÓN DE CANCIÓN */}
      {songToEdit && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#171717", padding: "2rem", borderRadius: "12px", border: "1px solid #333", width: "90%", maxWidth: "450px", textAlign: "left" }}>
            <h3 style={{ marginTop: 0, color: "#F97316" }}>✏️ Editar Canción</h3>
            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              
              {/* Título */}
              <div>
                <label style={{ fontSize: "0.85rem", color: "#AAA" }}>Título:</label>
                <input
                  type="text"
                  required
                  value={editTitulo}
                  onChange={(e) => setEditTitulo(e.target.value)}
                  style={{ width: "100%", padding: "0.6rem", marginTop: "0.25rem", borderRadius: "6px", border: "1px solid #333", backgroundColor: "#0A0A0A", color: "#FFF", boxSizing: "border-box" }}
                />
              </div>

              {/* Artista */}
              <div>
                <label style={{ fontSize: "0.85rem", color: "#AAA" }}>Artista / Banda:</label>
                <input
                  type="text"
                  required
                  value={editArtista}
                  onChange={(e) => setEditArtista(e.target.value)}
                  placeholder="Ej. Bad Bunny"
                  style={{ width: "100%", padding: "0.6rem", marginTop: "0.25rem", borderRadius: "6px", border: "1px solid #333", backgroundColor: "#0A0A0A", color: "#FFF", boxSizing: "border-box" }}
                />
              </div>

              {/* Género */}
              <div>
                <label style={{ fontSize: "0.85rem", color: "#AAA" }}>Género Musical:</label>
                <input
                  type="text"
                  required
                  value={editGenero}
                  onChange={(e) => setEditGenero(e.target.value)}
                  placeholder="Ej. Bachata / Pop / Rock"
                  style={{ width: "100%", padding: "0.6rem", marginTop: "0.25rem", borderRadius: "6px", border: "1px solid #333", backgroundColor: "#0A0A0A", color: "#FFF", boxSizing: "border-box" }}
                />
              </div>

              {/* Botones */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setSongToEdit(null)}
                  style={{ padding: "0.6rem 1rem", borderRadius: "6px", border: "1px solid #444", backgroundColor: "transparent", color: "#CCC", cursor: "pointer" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: "0.6rem 1rem", borderRadius: "6px", border: "none", backgroundColor: "#F97316", color: "#FFF", fontWeight: "bold", cursor: "pointer" }}
                >
                  Guardar Cambios
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
