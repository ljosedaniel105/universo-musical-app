import { useState } from "react";
import { supabase } from "./supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apodo, setApodo] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. INICIO DE SESIÓN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Intentar autenticar con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      alert("Error al iniciar sesión: " + authError.message);
      setLoading(false);
      return;
    }

    const userId = authData.user.id;

    // Verificar si existe en la tabla 'perfiles'
    const { data: profile } = await supabase
      .from("perfiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    // SI EL USUARIO FUE ELIMINADO DEL PANEL:
    if (!profile) {
      // Forzar cierre de sesión en auth
      await supabase.auth.signOut();
      alert("Tu cuenta fue eliminada del sistema. Por favor, regístrate de nuevo para continuar.");
      setIsRegistering(true); // Cambiar automáticamente a la pestaña de registro
      setLoading(false);
      return;
    }

    alert("¡Bienvenido de nuevo!");
    window.location.reload(); // Recargar o redirigir a la app
  };

  // 2. REGISTRO (O RE-REGISTRO)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Intentar crear la cuenta o autenticar
    let { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    // Si el correo ya existía en Auth (porque sólo lo borraste de la tabla), intentamos login directo para re-crear su perfil
    if (authError && authError.message.includes("already registered")) {
      const loginRes = await supabase.auth.signInWithPassword({ email, password });
      authData = loginRes.data;
      authError = loginRes.error;
    }

    if (authError || !authData.user) {
      alert("Error en el registro: " + (authError?.message || "No se pudo crear la cuenta"));
      setLoading(false);
      return;
    }

    // Insertar el nuevo perfil en la tabla 'perfiles'
    const { error: profileError } = await supabase.from("perfiles").insert([
      {
        id: authData.user.id,
        email: email,
        apodo: apodo || email.split("@")[0],
      },
    ]);

    if (profileError) {
      alert("Error al guardar el perfil: " + profileError.message);
    } else {
      alert("¡Registro completado con éxito!");
      window.location.reload();
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "4rem auto", padding: "2rem", backgroundColor: "#171717", borderRadius: "12px", color: "#FFF" }}>
      <h2>{isRegistering ? "Crear Cuenta" : "Iniciar Sesión"}</h2>
      
      <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {isRegistering && (
          <input
            type="text"
            placeholder="Apodo / Nombre"
            value={apodo}
            onChange={(e) => setApodo(e.target.value)}
            style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid #333", backgroundColor: "#0A0A0A", color: "#FFF" }}
            required
          />
        )}
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid #333", backgroundColor: "#0A0A0A", color: "#FFF" }}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid #333", backgroundColor: "#0A0A0A", color: "#FFF" }}
          required
        />

        <button
          type="submit"
          disabled={loading}
          style={{ padding: "0.75rem", borderRadius: "6px", border: "none", backgroundColor: "#E11D48", color: "#FFF", fontWeight: "bold", cursor: "pointer" }}
        >
          {loading ? "Cargando..." : isRegistering ? "Registrarse" : "Entrar"}
        </button>
      </form>

      <p style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#A1A1AA", cursor: "pointer" }} onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate aquí"}
      </p>
    </div>
  );
}
