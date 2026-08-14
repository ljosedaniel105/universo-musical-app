import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { Shield, Music, Users, Library, Trash2 } from "lucide-react";

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

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] text-white w-full">
      <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8 w-full">
        {/* Encabezado */}
        <header className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Panel de Control</h1>
            <p className="text-zinc-400">Gestión de recursos y usuarios del sistema.</p>
          </div>
        </header>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#171717] border border-[#262626] rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-zinc-400 text-sm font-medium">
              <span>Total Usuarios</span>
              <Users className="h-4 w-4 text-zinc-500" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
          </div>

          <div className="bg-[#171717] border border-[#262626] rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-zinc-400 text-sm font-medium">
              <span>Total Canciones</span>
              <Music className="h-4 w-4 text-zinc-500" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalSongs}</div>
          </div>

          <div className="bg-[#171717] border border-[#262626] rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-zinc-400 text-sm font-medium">
              <span>Total Playlists</span>
              <Library className="h-4 w-4 text-zinc-500" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalPlaylists}</div>
          </div>
        </div>

        {/* Tablas de Gestión */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tabla de Usuarios */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-white">Directorio de Usuarios</h2>
            <div className="bg-[#171717] rounded-xl border border-[#262626] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#0A0A0A] border-b border-[#262626]">
                  <tr>
                    <th className="p-4 text-xs uppercase text-zinc-400 font-medium">Nombre / Apodo</th>
                    <th className="p-4 text-xs uppercase text-zinc-400 font-medium">Email / ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {loading ? (
                    <tr>
                      <td colSpan={2} className="p-4 text-center text-zinc-500">Cargando usuarios...</td>
                    </tr>
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-[#262626]/50 transition-colors">
                        <td className="p-4 font-medium text-white">{user.apodo || user.nombre || "Usuario"}</td>
                        <td className="p-4 text-zinc-400 text-sm">{user.email || user.id}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="p-4 text-center text-zinc-500">No hay usuarios registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla de Canciones */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-white">Galería de Canciones</h2>
            <div className="bg-[#171717] rounded-xl border border-[#262626] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#0A0A0A] border-b border-[#262626]">
                  <tr>
                    <th className="p-4 text-xs uppercase text-zinc-400 font-medium">Canción</th>
                    <th className="p-4 text-xs uppercase text-zinc-400 font-medium">Artista</th>
                    <th className="p-4 text-xs uppercase text-zinc-400 font-medium text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-zinc-500">Cargando canciones...</td>
                    </tr>
                  ) : songs.length > 0 ? (
                    songs.map((song) => (
                      <tr key={song.id} className="hover:bg-[#262626]/50 transition-colors">
                        <td className="p-4 font-medium text-white">{song.titulo || song.title || "Sin título"}</td>
                        <td className="p-4 text-zinc-400 text-sm">{song.artista || song.artist || "Desconocido"}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteSong(song.id)}
                            className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Eliminar canción"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-zinc-500">No hay canciones en el sistema.</td>
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
