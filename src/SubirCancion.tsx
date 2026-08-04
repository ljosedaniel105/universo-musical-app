import React, { useState } from 'react';
import { supabase } from './lib/supabase';

export default function SubirCancion() {
  const [titulo, setTitulo] = useState('');
  const [artista, setArtista] = useState('');
  const [genero, setGenero] = useState('');
  const [urlAudio, setUrlAudio] = useState('');
  const [urlPortada, setUrlPortada] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const handleSubir = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubiendo(true);
    setMensaje('');

    try {
      const { error } = await supabase.from('canciones').insert([
        {
          titulo: titulo,
          artista: artista,
          genero: genero || 'Varios',
          url_audio: urlAudio,
          url_portada: urlPortada || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500'
        }
      ]);

      if (error) throw error;

      setMensaje('¡Canción publicada con éxito! 🎶');
      setTitulo('');
      setArtista('');
      setGenero('');
      setUrlAudio('');
      setUrlPortada('');
    } catch (error: any) {
      setMensaje('Error al publicar: ' + error.message);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#18181c', padding: '30px', borderRadius: '16px', border: '1px solid #2a2a30' }}>
      {mensaje && <p style={{ color: '#ff6b00', fontWeight: 'bold', textAlign: 'center' }}>{mensaje}</p>}

      <form onSubmit={handleSubir} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '14px', textAlign: 'center' }}>Título de la Canción</label>
            <input 
              type="text" required placeholder="Ej. Starlight" value={titulo} onChange={(e) => setTitulo(e.target.value)} 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #2a2a30', backgroundColor: '#0d0d0f', color: 'white', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '14px', textAlign: 'center' }}>Artista</label>
            <input 
              type="text" required placeholder="Ej. Muse" value={artista} onChange={(e) => setArtista(e.target.value)} 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #2a2a30', backgroundColor: '#0d0d0f', color: 'white', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '14px', textAlign: 'center' }}>Género Musical</label>
          <select 
            value={genero} onChange={(e) => setGenero(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #2a2a30', backgroundColor: '#0d0d0f', color: '#aaa', boxSizing: 'border-box' }}
          >
            <option value="">Selecciona un género...</option>
            <option value="Pop">Pop</option>
            <option value="Rock">Rock</option>
            <option value="Urbano">Urbano / Reggaeton</option>
            <option value="Bachata">Bachata</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '14px', textAlign: 'center' }}>URL del Audio (Direct Link)</label>
          <input 
            type="text" required placeholder="https://ejemplo.com/audio.mp3" value={urlAudio} onChange={(e) => setUrlAudio(e.target.value)} 
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #2a2a30', backgroundColor: '#0d0d0f', color: 'white', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '14px', textAlign: 'center' }}>URL de la Portada (Imagen)</label>
          <input 
            type="text" placeholder="https://ejemplo.com/portada.jpg" value={urlPortada} onChange={(e) => setUrlPortada(e.target.value)} 
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #2a2a30', backgroundColor: '#0d0d0f', color: 'white', boxSizing: 'border-box' }}
          />
        </div>

        <button 
          type="submit" disabled={subiendo}
          style={{ backgroundColor: '#ff6b00', color: 'white', padding: '14px', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}
        >
          {subiendo ? 'Publicando...' : 'Publicar Canción 🎵'}
        </button>
      </form>
    </div>
  );
}
