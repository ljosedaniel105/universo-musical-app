import React, { useState } from 'react';
import { supabase } from './supabase';

interface SubirCancionProps {
  alSubirExitoso?: () => void;
}

export default function SubirCancion({ alSubirExitoso }: SubirCancionProps) {
  const [titulo, setTitulo] = useState('');
  const [artista, setArtista] = useState('');
  const [genero, setGenero] = useState('');
  const [portadaUrl, setPortadaUrl] = useState('');
  const [subiendo, setSubiendo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo || !artista) {
      alert("Por favor ingresa al menos el Título y el Artista.");
      return;
    }

    setSubiendo(true);

    try {
      const { error } = await supabase.from('canciones').insert([
        {
          titulo: titulo,
          artista: artista,
          genero: genero,
          portada_url: portadaUrl
        }
      ]);

      if (error) throw error;

      alert("¡Canción subida exitosamente!");

      // RESET COMPLETO DE LOS CAMPOS DE TEXTO
      setTitulo('');
      setArtista('');
      setGenero('');
      setPortadaUrl('');

      if (alSubirExitoso) {
        alSubirExitoso();
      }

    } catch (err: any) {
      console.error('Error al subir canción:', err);
      alert('Error al guardar en Supabase: ' + (err.message || err));
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', color: '#fff', backgroundColor: '#141419', padding: '25px', borderRadius: '12px', border: '1px solid #22222a' }}>
      <h2 style={{ color: '#ff6600', textAlign: 'center', marginTop: 0, marginBottom: '25px' }}>Subir Nueva Canción</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#ccc' }}>Título (*):</label>
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
              border: '1px solid #33333f',
              backgroundColor: '#0d0d11',
              color: '#fff',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#ccc' }}>Artista (*):</label>
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
              border: '1px solid #33333f',
              backgroundColor: '#0d0d11',
              color: '#fff',
              fontSize: '14px',
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
            placeholder="Ej. Bachata, Pop, Rock..."
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #33333f',
              backgroundColor: '#0d0d11',
              color: '#fff',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#ccc' }}>URL de Portada:</label>
          <input
            type="text"
            value={portadaUrl}
            onChange={(e) => setPortadaUrl(e.target.value)}
            placeholder="https://imagen.com/portada.jpg"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #33333f',
              backgroundColor: '#0d0d11',
              color: '#fff',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={subiendo}
          style={{
            padding: '14px',
            backgroundColor: '#ff6600',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          {subiendo ? 'Guardando en la base de datos...' : 'Subir Canción'}
        </button>
      </form>
    </div>
  );
}
