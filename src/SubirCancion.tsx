import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function SubirCancion() {
  const [titulo, setTitulo] = useState("");
  
  // Géneros
  const [generos, setGeneros] = useState<any[]>([]);
  const [generoSeleccionado, setGeneroSeleccionado] = useState("");
  const [nuevoGenero, setNuevoGenero] = useState("");
  const [modoCrearGenero, setModoCrearGenero] = useState(false);

  // Artistas
  const [artistas, setArtistas] = useState<any[]>([]);
  const [artistaSeleccionado, setArtistaSeleccionado] = useState("");
  const [nuevoArtista, setNuevoArtista] = useState("");
  const [modoCrearArtista, setModoCrearArtista] = useState(false);

  // Archivos
  const [archivoAudio, setArchivoAudio] = useState<File | null>(null);
  const [archivoPortada, setArchivoPortada] = useState<File | null>(null);
  const [cargando, setCargando] = useState(false);

  // Cargar lista de Géneros y Artistas existentes
  const cargarCatalogos = async () => {
    const { data: dataGeneros } = await supabase.from("generos").select("*").order("nombre", { ascending: true });
    const { data: dataArtistas } = await supabase.from("artistas").select("*").order("nombre", { ascending: true });

    if (dataGeneros) setGeneros(dataGeneros);
    if (dataArtistas) setArtistas(dataArtistas);
  };

  useEffect(() => {
    cargarCatalogos();
  }, []);

  // Función para obtener o crear Género (evita duplicados)
  const resolverGenero = async (): Promise<string> => {
    if (!modoCrearGenero) return generoSeleccionado;

    const generoLimpio = nuevoGenero.trim();
    if (!generoLimpio) return "";

    // Buscar si ya existe (sin importar mayúsculas/minúsculas)
    const { data: existe } = await supabase
      .from("generos")
      .select("nombre")
      .ilike("nombre", generoLimpio)
      .maybeSingle();

    if (existe) {
      return existe.nombre; // Usa el que ya existía
    }

    // Si no existe, lo inserta
    const { data: creado } = await supabase
      .from("generos")
      .insert([{ nombre: generoLimpio }])
      .select()
      .single();

    return creado ? creado.nombre : generoLimpio;
  };

  // Función para obtener o crear Artista (evita duplicados)
  const resolverArtista = async (): Promise<string> => {
    if (!modoCrearArtista) return artistaSeleccionado;

    const artistaLimpio = nuevoArtista.trim();
    if (!artistaLimpio) return "";

    // Buscar si ya existe
    const { data: existe } = await supabase
      .from("artistas")
      .select("nombre")
      .ilike("nombre", artistaLimpio)
      .maybeSingle();

    if (existe) {
      return existe.nombre;
    }

    // Si no existe, lo inserta
    const { data: creado } = await supabase
      .from("artistas")
      .insert([{ nombre: artistaLimpio }])
      .select()
      .single();

    return creado ? creado.nombre : artistaLimpio;
  };

  // Guardar Canción
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivoAudio) return alert("Por favor selecciona un archivo MP3.");

    setCargando(true);
    try {
      // 1. Resolver Género y Artista finales
      const generoFinal = await resolverGenero();
      const artistaFinal = await resolverArtista();

      if (!generoFinal) {
        setCargando(false);
        return alert("Por favor selecciona o escribe un género.");
      }
      if (!artistaFinal) {
        setCargando(false);
        return alert("Por favor selecciona o escribe un artista.");
      }

      // 2. Subir Audio a Storage
      const nombreAudio = `${Date.now()}_${archivoAudio.name}`;
      const { error: errAudio } = await supabase.storage.from("canciones").upload(nombreAudio, archivoAudio);
      if (errAudio) throw errAudio;

      const { data: urlAudioData } = supabase.storage.from("canciones").getPublicUrl(nombreAudio);

      // 3. Subir Portada a Storage (Opcional)
      let urlPortada = "";
      if (archivoPortada) {
        const nombrePortada = `${Date.now()}_${archivoPortada.name}`;
        const { error: errPortada } = await supabase.storage.from("portadas").upload(nombrePortada, archivoPortada);
        if (!errPortada) {
          const { data: urlPortadaData } = supabase.storage.from("portadas").getPublicUrl(nombrePortada);
          urlPortada = urlPortadaData.publicUrl;
        }
      }

      // 4. Guardar Canción en la base de datos
      const { error: errCancion } = await supabase.from("canciones").insert([
        {
          titulo,
          artista: artistaFinal,
          genero: generoFinal,
          url_cancion: urlAudioData.publicUrl,
          url_portada: urlPortada,
        },
      ]);

      if (errCancion) throw errCancion;

      alert("¡Canción guardada con éxito! 🚀");
      
      // Limpiar Formulario
      setTitulo("");
      setGeneroSeleccionado("");
      setNuevoGenero("");
      setModoCrearGenero(false);
      setArtistaSeleccionado("");
      setNuevoArtista("");
      setModoCrearArtista(false);
      setArchivoAudio(null);
      setArchivoPortada(null);
      cargarCatalogos();

    } catch (error: any) {
      alert("Error al guardar canción: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ maxWidth: "550px", margin: "2rem auto", padding: "2rem", backgroundColor: "#121212", borderRadius: "16px", border: "1px solid #262626", color: "#FFFFFF", fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem", color: "#F97316", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
        📁 Subir Nueva Canción
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        
        {/* Título */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "left" }}>
          <label style={{ fontSize: "0.9rem", color: "#A1A1AA" }}>Título de la Canción:</label>
          <input
            type="text"
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej. Ojitos Lindos"
            style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #333", backgroundColor: "#0A0A0A", color: "#FFF", fontSize: "0.95rem" }}
          />
        </div>

        {/* Sección Género */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontSize: "0.9rem", color: "#A1A1AA" }}>Género Musical:</label>
            <button
              type="button"
              onClick={() => { setModoCrearGenero(!modoCrearGenero); setGeneroSeleccionado(""); setNuevoGenero(""); }}
              style={{ background: "none", border: "none", color: "#F97316", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline" }}
            >
              {modoCrearGenero ? "← Seleccionar existente" : "+ Agregar nuevo género"}
            </button>
          </div>

          {!modoCrearGenero ? (
            <select
              value={generoSeleccionado}
              onChange={(e) => setGeneroSeleccionado(e.target.value)}
              required
              style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #333", backgroundColor: "#0A0A0A", color: "#FFF", fontSize: "0.95rem" }}
            >
              <option value="">-- Selecciona un género --</option>
              {generos.map((g) => (
                <option key={g.id} value={g.nombre}>{g.nombre}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              required
              value={nuevoGenero}
              onChange={(e) => setNuevoGenero(e.target.value)}
              placeholder="Escribe el nuevo género (Ej. Reggaeton)"
              style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #333", backgroundColor: "#0A0A0A", color: "#FFF", fontSize: "0.95rem" }}
            />
          )}
        </div>

        {/* Sección Artista */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontSize: "0.9rem", color: "#A1A1AA" }}>Artista / Banda:</label>
            <button
              type="button"
              onClick={() => { setModoCrearArtista(!modoCrearArtista); setArtistaSeleccionado(""); setNuevoArtista(""); }}
              style={{ background: "none", border: "none", color: "#F97316", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline" }}
            >
              {modoCrearArtista ? "← Seleccionar existente" : "+ Agregar nuevo artista"}
            </button>
          </div>

          {!modoCrearArtista ? (
            <select
              value={artistaSeleccionado}
              onChange={(e) => setArtistaSeleccionado(e.target.value)}
              required
              style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #333", backgroundColor: "#0A0A0A", color: "#FFF", fontSize: "0.95rem" }}
            >
              <option value="">-- Selecciona un artista --</option>
              {artistas.map((a) => (
                <option key={a.id} value={a.nombre}>{a.nombre}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              required
              value={nuevoArtista}
              onChange={(e) => setNuevoArtista(e.target.value)}
              placeholder="Escribe el nombre del artista"
              style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #333", backgroundColor: "#0A0A0A", color: "#FFF", fontSize: "0.95rem" }}
            />
          )}
        </div>

        {/* Archivos */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "left" }}>
          <label style={{ fontSize: "0.9rem", color: "#A1A1AA" }}>🎵 Seleccionar MP3:</label>
          <input
            type="file"
            accept="audio/*"
            required
            onChange={(e) => setArchivoAudio(e.target.files ? e.target.files[0] : null)}
            style={{ padding: "0.5rem", backgroundColor: "#0A0A0A", borderRadius: "8px", border: "1px solid #333", color: "#AAA" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "left" }}>
          <label style={{ fontSize: "0.9rem", color: "#A1A1AA" }}>🖼️ Imagen de Portada (Opcional):</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setArchivoPortada(e.target.files ? e.target.files[0] : null)}
            style={{ padding: "0.5rem", backgroundColor: "#0A0A0A", borderRadius: "8px", border: "1px solid #333", color: "#AAA" }}
          />
        </div>

        {/* Botón Guardar */}
        <button
          type="submit"
          disabled={cargando}
          style={{
            marginTop: "1rem",
            padding: "0.85rem",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#F97316",
            color: "#FFF",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: cargando ? "not-allowed" : "pointer",
            opacity: cargando ? 0.7 : 1,
          }}
        >
          {cargando ? "Guardando canción..." : "Guardar Canción 🚀"}
        </button>

      </form>
    </div>
  );
}
