import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

export function ListaCanciones({ alReproducir, esAdmin }: { alReproducir: (c: any, l: any[]) => void, esAdmin: boolean }) {
  const [canciones, setCanciones] = useState<any[]>([]);

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.from('canciones').select('*').order('created_at', { ascending: false });
      setCanciones(data || []);
    };
    cargar();
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>🌍 Todas las Canciones</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {canciones.map((c) => (
          <div key={c.id} style={{ background: '#121214', padding: '15px', borderRadius: '12px', border: '1px solid #222', textAlign: 'center' }}>
            <div style={{ width: '100%', height: '170px', borderRadius: '8px', background: `url(${c.portada_url || 'https://via.placeholder.com/150'}) center/cover`, marginBottom: '10px' }} />
            <h4 style={{ margin: '5px 0', fontSize: '0.9rem' }}>{c.titulo}</h4>
            <p style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '10px' }}>{c.artista}</p>
            <button 
              onClick={() => alReproducir(c, canciones)}
              style={{ background: '#ff6600', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
            >
              ▶ Escuchar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}