const ReproductorPersonalizado = ({ 
  cancion, 
  userId,
  onNext, 
  onPrev 
}: { 
  cancion: any; 
  userId?: string;
  onNext: () => void; 
  onPrev: () => void; 
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [velocidad, setVelocidad] = useState(1);
  const [meGusta, setMeGusta] = useState(false);
  const [noMeGusta, setNoMeGusta] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);

  const audioUrl = cancion?.url_audio || cancion?.url_archivo || cancion?.url_cancion || cancion?.url;
  const PORTADA_DEFAULT = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500';

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((e) => console.log("Error al reproducir:", e));
      setIsPlaying(true);
      audioRef.current.playbackRate = velocidad;
    }
  }, [cancion, velocidad]);

  useEffect(() => {
    const cargarReacciones = async () => {
      if (!cancion?.id) return;

      const { count } = await supabase
        .from('me_gusta')
        .select('*', { count: 'exact', head: true })
        .eq('cancion_id', cancion.id);
      
      setTotalLikes(count || 0);

      if (userId) {
        const { data: likeData } = await supabase
          .from('me_gusta')
          .select('id')
          .eq('usuario_id', userId)
          .eq('cancion_id', cancion.id)
          .maybeSingle();

        setMeGusta(!!likeData);

        const { data: dislikeData } = await supabase
          .from('no_me_gusta')
          .select('id')
          .eq('usuario_id', userId)
          .eq('cancion_id', cancion.id)
          .maybeSingle();

        setNoMeGusta(!!dislikeData);
      }
    };

    cargarReacciones();
  }, [cancion, userId]);

  const handleToggleLike = async () => {
    if (!userId || !cancion?.id) return;

    if (meGusta) {
      setMeGusta(false);
      setTotalLikes((prev) => Math.max(0, prev - 1));
      await supabase
        .from('me_gusta')
        .delete()
        .eq('usuario_id', userId)
        .eq('cancion_id', cancion.id);
    } else {
      setMeGusta(true);
      setNoMeGusta(false);
      setTotalLikes((prev) => prev + 1);
      await supabase
        .from('me_gusta')
        .insert([{ usuario_id: userId, cancion_id: cancion.id }]);

      await supabase
        .from('no_me_gusta')
        .delete()
        .eq('usuario_id', userId)
        .eq('cancion_id', cancion.id);
    }
  };

  const handleDislike = async () => {
    if (!userId || !cancion?.id) return;

    if (noMeGusta) {
      setNoMeGusta(false);
      await supabase
        .from('no_me_gusta')
        .delete()
        .eq('usuario_id', userId)
        .eq('cancion_id', cancion.id);
    } else {
      if (meGusta) {
        setMeGusta(false);
        setTotalLikes((prev) => Math.max(0, prev - 1));
        await supabase
          .from('me_gusta')
          .delete()
          .eq('usuario_id', userId)
          .eq('cancion_id', cancion.id);
      }

      setNoMeGusta(true);
      await supabase
        .from('no_me_gusta')
        .insert([{ usuario_id: userId, cancion_id: cancion.id }]);

      onNext();
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const descargarCancion = () => {
    if (!audioUrl) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${cancion.titulo || 'cancion'}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMenuAbierto(false);
  };

  const cambiarVelocidad = () => {
    const velocidades = [1, 1.25, 1.5, 2, 0.5, 0.75];
    const indexActual = velocidades.indexOf(velocidad);
    const siguiente = velocidades[(indexActual + 1) % velocidades.length];
    setVelocidad(siguiente);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="reproductor-fijo" style={{
      position: 'fixed', 
      bottom: '10px',      /* Separado del borde inferior */
      left: '10px', 
      right: '10px', 
      maxWidth: '750px',   /* Ancho máximo para que no se estire de más en PC */
      margin: '0 auto',    /* Centrado automático */
      backgroundColor: '#18181c', 
      border: '1px solid #2a2a30',
      borderRadius: '12px', /* Bordes redondeados elegantes */
      boxShadow: '0 8px 30px rgba(0,0,0,0.8)',
      display: 'flex', 
      flexDirection: 'column', 
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)} 
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)} 
        onEnded={onNext}
      />

      <input 
        type="range" min="0" max={duration || 0} value={currentTime} 
        onChange={(e) => { if (audioRef.current) audioRef.current.currentTime = parseFloat(e.target.value); }} 
        style={{ width: '100%', height: '3px', accentColor: '#FF0000', cursor: 'pointer', margin: 0, padding: 0 }} 
      />

      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: '8px', justifyContent: 'space-between', minHeight: '56px', boxSizing: 'border-box', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button onClick={onPrev} style={{ background: 'none', border: 'none', color: '#f1f1f1', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }} title="Anterior">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
          <button onClick={togglePlay} style={{ background: 'none', border: 'none', color: '#f1f1f1', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }} title={isPlaying ? "Pausa" : "Reproducir"}>
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          <button onClick={onNext} style={{ background: 'none', border: 'none', color: '#f1f1f1', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }} title="Siguiente">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </button>
          <span style={{ color: '#aaa', fontSize: '11px', whiteSpace: 'nowrap' }}>
            {formatTime(currentTime)}/{formatTime(duration)}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center', minWidth: '120px', maxWidth: '300px', overflow: 'hidden' }}>
          <img 
            src={cancion.portada_url || cancion.url_portada || cancion.portada || PORTADA_DEFAULT} 
            alt={cancion.titulo} 
            style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }} 
          />
          <div style={{ overflow: 'hidden', width: '100%' }}>
            <h4 style={{ margin: 0, color: '#f1f1f1', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {cancion.titulo || cancion.title || "Sin título"}
            </h4>
            <p style={{ margin: '2px 0 0 0', color: '#aaa', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {cancion.artista || cancion.artist || "Artista desconocido"}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, position: 'relative' }}>
          <button onClick={handleToggleLike} style={{ background: 'transparent', border: 'none', color: meGusta ? '#3ea6ff' : '#aaa', cursor: 'pointer', padding: '4px 6px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '4px' }} title="Me gusta">
            <IconLike filled={meGusta} />
            <span style={{ fontSize: '12px', fontWeight: '500', color: meGusta ? '#3ea6ff' : '#aaa' }}>{totalLikes}</span>
          </button>

          <button onClick={handleDislike} style={{ background: 'transparent', border: 'none', color: noMeGusta ? '#3ea6ff' : '#aaa', cursor: 'pointer', padding: '4px 6px', borderRadius: '18px', display: 'flex', alignItems: 'center' }} title="No me gusta">
            <IconDislike filled={noMeGusta} />
          </button>

          <button onClick={() => setMenuAbierto(!menuAbierto)} style={{ backgroundColor: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center' }} title="Más opciones">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
          </button>

          {menuAbierto && (
            <div style={{ position: 'absolute', bottom: '45px', right: 0, backgroundColor: '#212121', border: '1px solid #383838', borderRadius: '12px', padding: '8px', minWidth: '160px', boxShadow: '0 8px 30px rgba(0,0,0,0.6)', zIndex: 1001 }}>
              <button onClick={descargarCancion} style={{ width: '100%', padding: '8px', backgroundColor: 'transparent', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>📥 Descargar</button>
              <button onClick={() => { alert("Añadir a lista"); setMenuAbierto(false); }} style={{ width: '100%', padding: '8px', backgroundColor: 'transparent', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>➕ Agregar a Lista</button>
              <button onClick={cambiarVelocidad} style={{ width: '100%', padding: '8px', backgroundColor: 'transparent', border: 'none', color: '#ff6b00', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px' }}>⚡ Velocidad: {velocidad}x</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
