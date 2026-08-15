import React, { useState } from 'react';
import { supabase } from './supabase';

interface SubirCancionProps {
  alSubirExitoso?: () => void;
}

export default function SubirCancion({ alSubirExitoso }: SubirCancionProps) {
  const [titulo, setTitulo] = useState('');
  const [artista, setArtista] = useState('');
  const [genero, setGenero] = useState('');
  const [archivoPortada, setArchivoPortada] = useState<File | null>(null);
  const [archivoAudio, setArchivoAudio] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo || !artista) {
      alert("Por favor completa el título y el artista.");
      return;
    }

    setSubiendo(true);

    try {
      let portadaUrl = '';
      let audioUrl = '';

      if (archivoPortada) {
        const nombrePortada = `${Date.now()}_${archivoPortada.name}`;
        const { error: errorPortada } = await supabase.storage
          .from('canciones')
          .upload(`portadas/${nombrePortada}`, archivoPortada);

        if (!errorPortada) {
          const { data } = supabase.storage
            .from('canciones')
            .getPublicUrl(`portadas/${nombrePortada}`);
          portadaUrl = data.publicUrl;
        }
      }

      if (archivoAudio) {
        const nombreAudio = `${Date.now()}_${archivoAudio.name}`;
        const { error: errorAudio } = await supabase.storage
          .from('canciones')
          .upload(`audios/${nombreAudio}`, archivoAudio);

        if (!errorAudio) {
          const { data } = supabase.storage
            .from('canciones')
            .getPublicUrl(`audios/${nombreAudio}`);
          audioUrl = data.publicUrl;
        }
      }

      const { error } = await supabase.from('canciones').insert([
        {
          titulo,
          artista,
          genero,
          portada_url: portadaUrl,
          audio_url: audioUrl
        }
      ]);

      if (error) throw error;

      alert("¡Canción subida correctamente!");

      setTitulo('');
      setArtista('');
      setGenero('');
      setArchivoPortada(null);
      setArchivoAudio(null);

      if (alSubirExitoso) {
        alSubirExitoso();
      }
    } catch (err: any) {
      console.error('Error al subir canción:', err);
      alert('Error al guardar la canción: ' + (err.message || err));
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', color: '#fff', backgroundColor: '#161720', padding: '28px', borderRadius: '16px', border: '1px solid #222432' }}>
      <h2 style={{ color: '#ff5500', textAlign: 'center', marginTop: 0, marginBottom: '24px' }}>Subir Canción</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#ccc' }}>Título:</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Nombre de la canción"
            required
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #2a2c3d',
              backgroundColor: '#0d0e14',
              color: '#fff',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#ccc' }}>Artista:</label>
          <input
            type="text"
            value={artista}
            onChange={(e) => setArtista(e.target.value)}
            placeholder="Nombre del artista"
            required
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #2a2c3d',
              backgroundColor: '#0d0e14',
              color: '#fff',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#ccc' }}>Género:</label>
          <input
            type="text"
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            placeholder="Ej. Música Grupera, Bachata..."
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #2a2c3d',
              backgroundColor: '#0d0e14',
              color: '#fff',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#ccc' }}>Seleccionar Portada (Imagen):</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setArchivoPortada(e.target.files ? e.target.files[0] : null)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #2a2c3d',
              backgroundColor: '#0d0e14',
              color: '#fff',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#ccc' }}>Seleccionar Audio (MP3/WAV):</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setArchivoAudio(e.target.files ? e.target.files[0] : null)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #2a2c3d',
              backgroundColor: '#0d0e14',
              color: '#fff',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={subiendo}
          style={{
            padding: '14px',
            backgroundColor: '#ff5500',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          {subiendo ? 'Subiendo...' : 'Subir Canción'}
        </button>
      </form>
    </div>
  );
}
