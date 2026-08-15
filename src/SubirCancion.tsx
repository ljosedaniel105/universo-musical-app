import React, { useState } from 'react';

// Estado inicial con todos los campos en blanco
const ESTADO_INICIAL = {
  titulo: '',
  artista: '',
  genero: '',
  portadaUrl: '',
  audioUrl: ''
};

interface SubirCancionProps {
  alSubirCancion?: (cancion: typeof ESTADO_INICIAL) => void;
}

export default function SubirCancion({ alSubirCancion }: SubirCancionProps) {
  const [formData, setFormData] = useState(ESTADO_INICIAL);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo || !formData.artista) {
      alert("Por favor completa al menos el título y el artista.");
      return;
    }

    if (alSubirCancion) {
      alSubirCancion(formData);
    }

    alert("¡Canción subida correctamente!");

    // ESTA LÍNEA REINICIA EL FORMULARIO A CERO TRAS SUBIR
    setFormData(ESTADO_INICIAL);
  };

  return (
    <div style={{ padding: '20px', color: '#fff', maxWidth: '500px' }}>
      <h2 style={{ color: '#ff6600', marginBottom: '20px' }}>Subir Canción</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Título:</label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Nombre de la canción"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#1e1e1e', color: '#fff' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Artista:</label>
          <input
            type="text"
            name="artista"
            value={formData.artista}
            onChange={handleChange}
            placeholder="Nombre del artista"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#1e1e1e', color: '#fff' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Género:</label>
          <input
            type="text"
            name="genero"
            value={formData.genero}
            onChange={handleChange}
            placeholder="Ej. Pop, Bachata..."
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#1e1e1e', color: '#fff' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>URL de Portada:</label>
          <input
            type="text"
            name="portadaUrl"
            value={formData.portadaUrl}
            onChange={handleChange}
            placeholder="https://link-de-imagen.jpg"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#1e1e1e', color: '#fff' }}
          />
        </div>

        <button
          type="submit"
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
          Subir Canción
        </button>
      </form>
    </div>
  );
}
