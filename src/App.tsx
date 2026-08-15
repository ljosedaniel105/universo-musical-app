import { useState, useEffect, useRef } from "react";
  const [session, setSession] = useState<any>(null);
  const [seccion, setSeccion] = useState<string>("descubrir");
  const [cancionActual, setCancionActual] = useState<any>(null);
  const [listaCanciones, setListaCanciones] = useState<any[]>([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  
  // Estado para controlar la pantalla de carga inicial
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Si Supabase se queda colgado más de 1.5s en token?grant_type=refresh_token,
    // forzamos a que la app continúe y no se quede en negro.
    const timer = setTimeout(() => {
      setCargando(false);
    }, 1500);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCargando(false);
      clearTimeout(timer);
    }).catch((err) => {
      console.error("Error al obtener sesión:", err);
      setCargando(false);
      clearTimeout(timer);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setCargando(false);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

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

  // Si aún está verificando Supabase dentro del tiempo límite, muestra mensaje de carga
  if (cargando) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#09090b", color: "#F97316", fontFamily: "sans-serif" }}>
        <h2>Cargando Universo Musical...</h2>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#09090b", color: "#FFF", fontFamily: "system-ui, sans-serif" }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: "250px", backgroundColor: "#121215", padding: "2rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem", borderRight: "1px solid #222" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#F97316", margin: 0 }}>
          🌌 UNIVERSO MUSICAL
        </h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button
            onClick={() => setSeccion("descubrir")}
            style={{
              display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem",
              borderRadius: "8px", border: "none", backgroundColor: seccion === "descubrir" ? "#F97316" : "transparent",
              color: "#FFF", fontWeight: seccion === "descubrir" ? "bold" : "normal", cursor: "pointer", textAlign: "left"
            }}
          >
            🏠 Descubrir
          </button>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ flex: 1, paddingBottom: cancionActual ? "90px" : "0px", overflowY: "auto" }}>
        {seccion === "descubrir" && (
          <ListaCanciones
            userId={session?.user?.id}
            onPlaySong={(c: any, lista?: any[]) => handlePlaySong(c, lista)}
          />
        )}
      </main>

      {/* REPRODUCTOR */}
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
