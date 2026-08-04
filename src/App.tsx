import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import ListaCanciones from './ListaCanciones';
import SubirCancion from './SubirCancion';
import PanelAdmin from './PanelAdmin';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [seccionActual, setSeccionActual] = useState<'descubrir' | 'playlists' | 'subir' | 'admin'>('descubrir');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [esRegistro, setEsRegistro] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const [cancionActual, setCancionActual] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCargando(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeError('');
    
    if (esRegistro) {
      const { data, error } = await supabase.auth.signUp({
        email: emailInput,
        password: passwordInput,
      });
      if (error) {
        setMensajeError(error.message);
      } else if (data.user) {
        await supabase.from('perfiles').insert([
          { id: data.user.id, email: data.user.email, nombre_usuario: data.user.email?.split('@')[0] }
        ]);
        alert('¡Registro exitoso! Ya puedes iniciar sesión.');
        setEsRegistro(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailInput,
        password: passwordInput,
      });
      if (error) setMensajeError(error.message);
    }
  };

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    setSeccionActual('descubrir');
  };

  if (cargando) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#121214', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Cargando Universo Musical...</h2>
      </div>
    );
  }

  // Pantalla de Iniciar Sesión / Registro
  if (!session) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#121214', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: '#1a1a1e', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '400px', border: '1px solid #2a2a30', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#ff6b00' }}>
            {esRegistro ? '🔑 Crear Cuenta' : '🔑 Iniciar Sesión'}
          </h2>
          
          {mensajeError && (
            <div style={{ backgroundColor: 'rgba(255, 0, 0, 0.2)', color: '#ff4d4d', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>
              {mensajeError}
            </div>
          )}

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#ccc' }}>✉️ Correo Electrónico:</label>
              <input 
                type="email" 
                required 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="correo@ejemplo.com"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#0d0d0f', color: 'white', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#ccc' }}>🔒 Contraseña:</label>
              <input 
                type="password" 
                required 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#0d0d0f', color: 'white', boxSizing: 'border-box' }}
              />
            </div>

            <button 
              type="submit" 
              style={{ backgroundColor: '#ff6b00', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', marginTop: '10px' }}
            >
              {esRegistro ? 'Registrarse 🚀' : 'Entrar 🔒'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#aaa' }}>
            {esRegistro ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta aún?'} {' '}
            <button 
              onClick={() => { setEsRegistro(!esRegistro); setMensajeError(''); }}
              style={{ background: 'none', border: 'none', color: '#ff6b00', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {esRegistro ? 'Inicia Sesión aquí' : 'Regístrate aquí'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Pantalla Principal (Barra Lateral + Contenido)
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#121214', color: 'white', fontFamily: 'sans-serif' }}>
      
      {/* BARRA LATERAL */}
      <div style={{ width: '260px', backgroundColor: '#18181c', borderRight: '1px solid #2a2a30', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
        <div>
          {/* LOGO DE TU APLICACIÓN */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '35px' }}>
            <img 
              src="https://gfpvkkroxjxpyfinhopi.supabase.co/storage/v1/object/public/portadas/logo.png" 
              alt="Logo Universo Musical" 
              style={{ width: '42px', height: '42px', borderRadius: '12px', objectFit: 'contain', boxShadow: '0 0 15px rgba(255,107,0,0.5)', flexShrink: 0 }} 
            />
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px', margin: 0, color: '#ffffff' }}>
              UNIVERSO <span style={{ color: '#ff6b00' }}>MUSICAL</span>
            </h1>
          </div>

          {/* MENÚ DE NAVEGACIÓN */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => setSeccionActual('descubrir')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: 'none', 
                backgroundColor: seccionActual === 'descubrir' ? '#26262e' : 'transparent', 
                color: seccionActual === 'descubrir' ? '#ff6b00' : '#a0a0ab', 
                fontWeight: seccionActual === 'descubrir' ? 'bold' : 'normal', cursor: 'pointer', textAlign: 'left', fontSize: '15px' 
              }}
            >
              🏠 Descubrir
            </button>

            <button 
              onClick={() => setSeccionActual('playlists')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: 'none', 
                backgroundColor: seccionActual === 'playlists' ? '#26262e' : 'transparent', 
                color: seccionActual === 'playlists' ? '#ff6b00' : '#a0a0ab', 
                fontWeight: seccionActual === 'playlists' ? 'bold' : 'normal', cursor: 'pointer', textAlign: 'left', fontSize: '15px' 
              }}
            >
              🎧 Mis Playlists
            </button>

            <button 
              onClick={() => setSeccionActual('subir')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: 'none', 
                backgroundColor: seccionActual === 'subir' ? '#26262e' : 'transparent', 
                color: seccionActual === 'subir' ? '#ff6b00' : '#a0a0ab', 
                fontWeight: seccionActual === 'subir' ? 'bold' : '
