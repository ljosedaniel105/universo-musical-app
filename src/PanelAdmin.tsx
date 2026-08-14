import { supabase } from "./supabase";
import { Layout } from "./components/Layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Music, Users, Library, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [songs, setSongs] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalSongs: 0, totalPlaylists: 0 });
  const [loading, setLoading] = useState(true);

  // Cargar datos desde Supabase
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Obtener Usuarios (tabla perfiles)
      const { data: usersData } = await supabase.from("perfiles").select("*");
      // 2. Obtener Canciones
      const { data: songsData } = await supabase.from("canciones").select("*");
      // 3. Obtener Playlists
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

  // Función para eliminar canción en Supabase
  const handleDeleteSong = async (id) => {
    const { error } = await supabase.from("canciones").delete().eq("id", id);
    if (!error) {
      // Recargar lista si se eliminó con éxito
      fetchData();
    } else {
      alert("Error al eliminar la canción");
    }
  };

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8">
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
          <Card className="bg-[#171717] border-[#262626]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card className="bg-[#171717] border-[#262626]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Total Canciones</CardTitle>
              <Music className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalSongs}</div>
            </CardContent>
          </Card>
          <Card className="bg-[#171717] border-[#262626]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Total Playlists</CardTitle>
              <Library className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalPlaylists}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tablas de Gestión */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tabla de Usuarios */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-white">Directorio de Usuarios</h2>
            <div className="bg-[#171717] rounded-xl border border-[#262626] overflow-hidden">
              <Table>
                <TableHeader className="bg-[#0A0A0A]">
                  <TableRow className="border-[#262626] hover:bg-transparent">
                    <TableHead className="text-zinc-400">Nombre / Apodo</TableHead>
                    <TableHead className="text-zinc-400">Email / ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow className="border-[#262626]">
                      <TableCell colSpan={2} className="h-24 text-center">
                        <Skeleton className="w-full h-8 bg-[#262626]" />
                      </TableCell>
                    </TableRow>
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id} className="border-[#262626] hover:bg-[#262626]/50">
                        <TableCell className="font-medium text-white">{user.apodo || user.nombre || "Usuario"}</TableCell>
                        <TableCell className="text-zinc-400">{user.email || user.id}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="border-[#262626]">
                      <TableCell colSpan={2} className="h-24 text-center text-zinc-500">
                        No hay usuarios registrados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Tabla de Canciones */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-white">Galería de Canciones</h2>
            <div className="bg-[#171717] rounded-xl border border-[#262626] overflow-hidden">
              <Table>
                <TableHeader className="bg-[#0A0A0A]">
                  <TableRow className="border-[#262626] hover:bg-transparent">
                    <TableHead className="text-zinc-400">Canción</TableHead>
                    <TableHead className="text-zinc-400">Artista</TableHead>
                    <TableHead className="text-right text-zinc-400">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow className="border-[#262626]">
                      <TableCell colSpan={3} className="h-24 text-center">
                        <Skeleton className="w-full h-8 bg-[#262626]" />
                      </TableCell>
                    </TableRow>
                  ) : songs.length > 0 ? (
                    songs.map((song) => (
                      <TableRow key={song.id} className="border-[#262626] hover:bg-[#262626]/50">
                        <TableCell className="font-medium text-white">{song.titulo}</TableCell>
                        <TableCell className="text-zinc-400">{song.artista}</TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#171717] border-[#262626] text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar la canción del sistema?</AlertDialogTitle>
                                <AlertDialogDescription className="text-zinc-400">
                                  Esta acción no se puede deshacer. Se eliminará la pista "{song.titulo}" de la base de datos global.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent border-[#262626] text-white hover:bg-[#262626]">Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteSong(song.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Eliminar del sistema
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="border-[#262626]">
                      <TableCell colSpan={3} className="h-24 text-center text-zinc-500">
                        No hay canciones en el sistema.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
