import React, { useState } from 'react';
import { supabase } from './supabase';

export function Auth({ onLogin }: { onLogin: () => void }) {
  const [esRegistro, setEsRegistro] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apodo, setApodo] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      if (esRegistro) {
        if (!apodo.trim()) {
          alert('Por favor ingresa un apodo.');
          setCargando(false);
          return;
        }

        // Registrar usuario guardando el apodo en user_metadata
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              apodo: apodo,
            },
          },
        });

        if (error) throw error;
        alert('¡Registro exitoso! Ya puedes iniciar sesión.');
        setEsRegistro(false);
      } else {
        // Iniciar sesión
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        onLogin();
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '40px auto',
      padding: '30px',
      background: '#181818',
      borderRadius: '16px',
      border: '1px solid #333',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      color: '#fff'
    }}>
      <h2 style={{ textAlign: 'center', color: '#ff6600', marginTop: 0 }}>
        {esRegistro ? '📝 Crear Cuenta' : '🔑 Iniciar Sesión'}
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {esRegistro && (
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '5px' }}>
              🏷️ Apodo / Nombre de Usuario:
            </label>
            <input
              type="text"
              placeholder="Ej. ElMelodico99"
              value={apodo}
              onChange={(e) => setApodo(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #444', background: '#0d0d0d', color: '#fff', boxSizing: 'border-box' }}
            />
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '5px' }}>
            📧 Correo Electrónico:
          </label>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #444', background: '#0d0d0d', color: '#fff', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '5px' }}>
            🔒 Contraseña:
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #444', background: '#0d0d0d', color: '#fff', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          style={{
            background: '#ff6600',
            color: '#fff',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '10px',
            fontSize: '1rem'
          }}
        >
          {cargando ? 'Cargando...' : esRegistro ? 'Registrarse 🚀' : 'Entrar 🔓'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
        <span style={{ color: '#aaa' }}>
          {esRegistro ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta aún?'}
        </span>{' '}
        <button
          onClick={() => setEsRegistro(!esRegistro)}
          style={{ background: 'none', border: 'none', color: '#ff6600', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
        >
          {esRegistro ? 'Inicia Sesión' : 'Regístrate aquí'}
        </button>
      </div>
    </div>
  );
}