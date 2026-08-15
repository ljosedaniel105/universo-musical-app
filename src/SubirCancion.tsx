import React, { useState } from 'react';
import { supabase } from './supabase';

export default function SubirCancion() {
  const [titulo, setTitulo] = useState('');
  const [artista, setArtista] = useState('');
  const [genero, setGenero] = useState('');
  const [portadaUrl, setPortadaUrl] = useState('');
  const [subiendo, setSubiendo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo || !artista) {
      alert("Por favor completa el título y el artista.");
      return;
    }

    setSubiendo(true);

    try {
      const { error } = await supabase.from('canciones').insert([
        {
          titulo,
          artista,
          genero,
          portada_url: portadaUrl
        }
      ]);

      if (error) throw error;

      alert("¡Canción subida con éxito!");

      // --- AQUÍ REINICIAMOS EL FORMULARIO A CERO ---
      setTitulo('');
      setArtista('');
      setGenero('');
      setPortadaUrl('');

    } catch (err: any) {
      console.error('Error al subir canción:', err);
      alert('Error al subir la canción: ' + err.message);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', color: '#fff' }}>
      <h2 style={{ color: '#ff6600', textAlign: 'center', marginBottom: '20px' }}>Subir Canción</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Título:</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Nombre de la canción"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #333',
              backgroundColor: '#1a1a1a',
              color: '#fff',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Artista:</label>
          <input
            type="text"
            value={artista}
            onChange={(e) => setArtista(e.target.value)}
            placeholder="Nombre del artista"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #333',
              backgroundColor: '#1a1a1a',
              color: '#fff',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Género:</label>
          <input
            type="text"
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            placeholder="Ej. Pop, Bachata..."
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #333',
              backgroundColor: '#1a1a1a',
              color: '#fff',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>URL de Portada:</label>
          <input
            type="text"
            value={portadaUrl}
            onChange={(e) => setPortadaUrl(e.target.value)}
            placeholder="https://link-de-imagen.jpg"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #333',
              backgroundColor: '#1a1a1a',
              color: '#fff',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={subiendo}
          style={{
            padding: '12px',
            backgroundColor: '#ff6600',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
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
