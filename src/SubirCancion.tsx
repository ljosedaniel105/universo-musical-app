import React, { useState } from 'react';
import { supabase } from './supabase';

export function SubirCancion() {
  const [titulo, setTitulo] = useState('');
  const [artista, setArtista] = useState('');
  const [genero, setGenero] = useState('');
  const [archivoAudio, setArchivoAudio] = useState<File | null>(null);
  const [archivoPortada, setArchivoPortada] = useState<File | null>(null);
  const [keyArchivos, setKeyArchivos] = useState(Date.now()); // Para resetear los inputs de archivo
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const manejarSubida = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !artista || !archivoAudio) {
      setMensaje('⚠️ Completa el título, artista y selecciona el archivo MP3.');
      return;
    }

    setSubiendo(true);
    setMensaje('⏳ Subiendo archivos a Universo Musical...');

    try {
      // 1. Subir MP3 a Supabase Storage
      const nombreAudio = `${Date.now()}_${archivoAudio.name.replace(/\s+/g, '_')}`;
      const { data: dataAudio, error: errorAudio } = await supabase.storage
        .from('canciones')
        .upload(nombreAudio, archivoAudio);

      if (errorAudio) throw errorAudio;

      const urlAudio = supabase.storage.from('canciones').getPublicUrl(dataAudio.path).data.publicUrl;

      // 2. Subir Portada Imagen (JPG / PNG)
      let urlPortada = '';
      if (archivoPortada) {
        const nombrePortada = `${Date.now()}_${archivoPortada.name.replace(/\s+/g, '_')}`;
        const { data: dataPortada, error: errorPortada } = await supabase.storage
          .from('portadas')
          .upload(nombrePortada, archivoPortada);

        if (!errorPortada && dataPortada) {
          urlPortada = supabase.storage.from('portadas').getPublicUrl(dataPortada.path).data.publicUrl;
        }
      }

      // 3. Guardar en Base de Datos
      const { error: errorDB } = await supabase.from('canciones').insert([
        {
          titulo,
          artista,
          genero: genero || 'Varios',
          url_archivo: urlAudio,
          portada_url: urlPortada || 'https://via.placeholder.com/300/121214/ff6600?text=Universo+Musical',
        },
      ]);

      if (errorDB) throw errorDB;

      setMensaje('🎉 ¡Canción publicada con éxito!');
      
      // RESETEAR EL FORMULARIO COMPLETAMENTE
      setTitulo('');
      setArtista('');
      setGenero('');
      setArchivoAudio(null);
      setArchivoPortada(null);
      setKeyArchivos(Date.now()); // Resetea la selección de archivos del navegador
    } catch (err: any) {
      console.error(err);
      setMensaje(`❌ Error al subir: ${err.message || 'Comprueba la conexión'}`);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: '#121214', padding: '30px', borderRadius: '12px', border: '1px solid #222' }}>
      <h2 style={{ color: '#fff', marginBottom: '20px' }}>📁 Subir Nueva Canción</h2>

      {mensaje && (
        <div style={{ padding: '12px', borderRadius: '8px', background: mensaje.includes('🎉') ? 'rgba(0,255,100,0.1)' : 'rgba(255,102,0,0.1)', color: mensaje.includes('🎉') ? '#00ff66' : '#ff6600', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(255,102,0,0.3)' }}>
          {mensaje}
        </div>
      )}

      <form onSubmit={manejarSubida} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: '#aaa', display: 'block', marginBottom: '6px' }}>Título *</label>
            <input type="text" placeholder="Ej. Hoja de té" value={titulo} onChange={(e) => setTitulo(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#18181b', border: '1px solid #333', color: '#fff', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: '#aaa', display: 'block', marginBottom: '6px' }}>Artista *</label>
            <input type="text" placeholder="Ej. Manu Beker" value={artista} onChange={(e) => setArtista(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#18181b', border: '1px solid #333', color: '#fff', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', color: '#aaa', display: 'block', marginBottom: '6px' }}>Género Musical</label>
          <select value={genero} onChange={(e) => setGenero(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#18181b', border: '1px solid #333', color: '#fff' }}>
            <option value="">Selecciona un género...</option>
            <option value="Rock">Rock</option>
            <option value="Pop">Pop</option>
            <option value="Reggaeton">Reggaeton</option>
            <option value="Salsa">Salsa</option>
            <option value="Hip-Hop">Hip-Hop</option>
            <option value="Electronica">Electrónica</option>
            <option value="Cumbia">Cumbia</option>
            <option value="Trap">Trap</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', color: '#ff6600', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Archivo de Audio (*.mp3, *.wav)</label>
          <input key={`audio_${keyArchivos}`} type="file" accept="audio/*" onChange={(e) => setArchivoAudio(e.target.files?.[0] || null)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#18181b', border: '1px dashed #ff6600', color: '#fff', cursor: 'pointer' }} />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', color: '#aaa', display: 'block', marginBottom: '6px' }}>Portada Imagen (*.jpg, *.png)</label>
          <input key={`portada_${keyArchivos}`} type="file" accept="image/*" onChange={(e) => setArchivoPortada(e.target.files?.[0] || null)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#18181b', border: '1px solid #333', color: '#fff', cursor: 'pointer' }} />
        </div>

        <button type="submit" disabled={subiendo} style={{ marginTop: '10px', background: '#ff6600', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: subiendo ? 'wait' : 'pointer', fontSize: '1rem' }}>
          {subiendo ? 'Subiendo...' : 'Publicar Canción 🎵'}
        </button>
      </form>
    </div>
  );
}