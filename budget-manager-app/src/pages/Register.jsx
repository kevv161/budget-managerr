import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../connect-firebase';
import { useAuth } from '../contexts/AuthContext';
import '../styles.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Registrar usuario con Firebase usando la función registerUser
      const result = await registerUser(email, password, displayName);
      
      if (result.success) {
        console.log('Usuario registrado exitosamente:', result.user);
        // Redirección a la página principal después del registro exitoso
        navigate('/home');
      } else {
        throw new Error(result.error || 'Error al crear la cuenta');
      }
    } catch (error) {
      console.error('Error al registrar:', error);
      setError(error.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ 
        backgroundColor: "#f0f2f5", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        padding: "40px 20px"
      }}>
      <div style={{ 
        maxWidth: "450px", 
        width: "100%",
        margin: "0 auto",
        position: "relative"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "2.5em", color: "var(--primary-color)", marginBottom: "10px" }}>Budget Manager</h1>
          <div style={{ 
            display: "inline-block", 
            backgroundColor: "var(--accent-color)", 
            color: "white", 
            padding: "5px 15px", 
            borderRadius: "20px", 
            fontSize: "0.9rem" 
          }}>
            Moneda: Quetzales (Q)
          </div>
        </div>

        {/* Register Card */}
        <div style={{ 
          backgroundColor: "white", 
          borderRadius: "12px", 
          padding: "35px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
          margin: "0 15px"
        }}>
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "var(--text-color)", marginBottom: "10px" }}>
              Crear Cuenta
            </h2>
            <p style={{ color: "#666" }}>
              Completa el formulario para registrarte
            </p>
            
            {error && (
              <div style={{ 
                backgroundColor: "#fee", 
                color: "#c53030", 
                padding: "10px", 
                borderRadius: "var(--border-radius)", 
                fontSize: "0.9rem",
                textAlign: "center",
                border: "1px solid #feb2b2",
                marginTop: "15px"
              }}>
                {error}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Nombre Completo Field */}
            <div>
              <label htmlFor="displayName" style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", color: "var(--text-color)", marginBottom: "8px" }}>
                Nombre Completo
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "12px 15px", 
                  border: "1px solid #ddd", 
                  borderRadius: "var(--border-radius)", 
                  outline: "none",
                  transition: "all 0.3s ease"
                }}
                placeholder="Tu nombre completo"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", color: "var(--text-color)", marginBottom: "8px" }}>
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "12px 15px", 
                  border: "1px solid #ddd", 
                  borderRadius: "var(--border-radius)", 
                  outline: "none",
                  transition: "all 0.3s ease"
                }}
                placeholder="tu@email.com"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", color: "var(--text-color)", marginBottom: "8px" }}>
                Contraseña (mínimo 6 caracteres)
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "12px 15px", 
                  border: "1px solid #ddd", 
                  borderRadius: "var(--border-radius)", 
                  outline: "none",
                  transition: "all 0.3s ease"
                }}
                placeholder="••••••••"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              style={{ 
                width: "100%", 
                backgroundColor: loading ? "#a0aec0" : "var(--primary-color)", 
                color: "white", 
                fontWeight: "500", 
                padding: "12px 15px", 
                borderRadius: "var(--border-radius)", 
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background-color 0.3s ease",
                marginTop: "10px"
              }}
            >
              {loading ? "Creando cuenta..." : "Registrarse"}
            </button>
            
            {/* Login Link */}
            <div style={{ textAlign: "center", marginTop: "15px" }}>
              <Link to="/login" style={{ color: "var(--primary-color)", textDecoration: "none", fontSize: "0.9rem" }}>
                ¿Ya tienes cuenta? Inicia Sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;