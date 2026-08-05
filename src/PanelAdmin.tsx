import React, { useEffect, useState } from 'react';
// @ts-ignore
import { supabase } from './supabase';

export default function PanelAdmin() {
  const [usuarios, setUsuarios] = useState<any[]>([]);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    const { data } = await supabase.from('perfiles').select('*');
    if (data) setUsuarios(data);
  };

  const eliminarUsuario = async (userId: string) => {
    if (!confirm("¿Seguro que deseas eliminar definitivamente a este usuario?")) return;

    // Ejecutar la Edge Function
    const { error } = await supabase.functions.invoke('delete-user', {
      body: { userId }
    });

    if (error) {
      alert("Error al eliminar: " + error.message);
    } else {
      alert("Usuario eliminado por completo de la base de datos y del sistema de login.");
      cargarUsuarios(); // Recargar lista
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Panel de Administración - Usuarios</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        {usuarios.map((u) => (
          <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#18181c', padding: '12px 20px', borderRadius: '8px', border: '1px solid #2a2a30' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>{u.apodo || 'Sin apodo'}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{u.email}</p>
            </div>
            <button 
              onClick={() => eliminarUsuario(u.id)}
              style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
