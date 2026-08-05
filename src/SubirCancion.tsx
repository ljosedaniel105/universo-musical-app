import React, { useState } from 'react';
import { supabase } from './supabase';

export default function SubirCancion() {
  const [titulo, setTitulo] = useState('');
  const [artista, setArtista] = useState('');
  const [archivoAudio, setArchivoAudio] = useState<File | null>(null);
  const [archivoPortada, setArchivoPortada] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const handleSubir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivoAudio) {
      alert('Por favor selecciona un archivo de audio MP3.');
      return;
    }

    setSubiendo(true);
    setMensaje('Subiendo archivos...');

    try {
      // 1. Subir Audio
      const audioExt = archivoAudio.name.split('.').pop();
      const audioName = `${Date.now()}_audio.${audioExt}`;
      const { error: errorAudio } = await supabase.storage.from('canciones').upload(audioName, archivoAudio);
      if (errorAudio) throw errorAudio;

      const { data: dataAudioUrl } = supabase.storage.from('canciones').getPublicUrl(audioName);
      const urlAudioFinal = dataAudioUrl.publicUrl;

      // 2. Subir Imagen de Portada
      let urlPortadaFinal = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500';

      if (archivoPortada) {
        const portadaExt = archivoPortada.name.split('.').pop();
        const portadaName = `${Date.now()}_portada.${portadaExt}`;

        const { error: errorPortada } = await supabase.storage
          .from('portadas')
          .upload(portadaName, archivoPortada, { upsert: true });

        if (!errorPortada) {
          const { data: dataPortadaUrl } = supabase.storage.from('portadas').getPublicUrl(portadaName);
          urlPortadaFinal = dataPortadaUrl.publicUrl;
        }
      }

      // 3. Guardar en la Base de Datos
      const { error: errorBD } = await supabase.from('canciones').insert([
        {
          titulo: titulo,
          artista: artista,
          genero: 'Varios',
          url_audio: urlAudioFinal,
          url_archivo: urlAudioFinal,
          url_portada: urlPortadaFinal,
          portada_url: urlPortadaFinal
        }
      ]);

      if (errorBD) throw errorBD;

      setMensaje('¡Canción subida con éxito! 🎉');
      setTitulo('');
      setArtista('');
      setArchivoAudio(null);
      setArchivoPortada(null);
    } catch (error: any) {
      setMensaje('Error al subir: ' + error.message);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: '#18181c', padding: '30px', borderRadius: '16px', border: '1px solid #2a2a30' }}>
      <h2 style={{ color: '#ff6b00', marginTop: 0, textAlign: 'center' }}>📁 Subir Nueva Canción</h2>

      {mensaje && <p style={{ color: '#ff6b00', fontWeight: 'bold', textAlign: 'center' }}>{mensaje}</p>}

      <form onSubmit={handleSubir} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Título:</label>
          <input 
            type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)} 
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#0d0d0f', color: 'white', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>Artista:</label>
          <input 
            type="text" required value={artista} onChange={(e) => setArtista(e.target.value)} 
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#0d0d0f', color: 'white', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>🎵 Seleccionar MP3 desde tu equipo:</label>
          <input 
            type="file" accept="audio/*" required onChange={(e) => setArchivoAudio(e.target.files?.[0] || null)} 
            style={{ color: 'white' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '5px' }}>🖼️ Seleccionar Imagen de Portada:</label>
          <input 
            type="file" accept="image/*" onChange={(e) => setArchivoPortada(e.target.files?.[0] || null)} 
            style={{ color: 'white' }}
          />
        </div>

        <button 
          type="submit" disabled={subiendo}
          style={{ backgroundColor: '#ff6b00', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
        >
          {subiendo ? 'Subiendo...' : 'Guardar Canción 🚀'}
        </button>
      </form>
    </div>
  );
}
