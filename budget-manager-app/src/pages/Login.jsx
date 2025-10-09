import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ThemeContext } from "../contexts/ThemeContext";

export default function Login() {
  const navigate = useNavigate();
  const { currentUser, login } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Login exitoso
        // Redirigir directamente a Home
        navigate('/home');
      } else {
        // Error en el login
        setError(result.error);
      }
    } catch (error) {
      console.error("Error durante el login:", error);
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark-theme' : ''}`} style={{ 
        backgroundColor: theme === 'dark' ? "#121212" : "#f0f2f5", 
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div></div>
            <h1 style={{ fontSize: "2.5em", color: "var(--primary-color)", margin: "0" }}>Budget Manager</h1>
            <button 
              onClick={toggleTheme}
              style={{
                backgroundColor: theme === 'dark' ? '#444' : '#f0f0f0',
                color: theme === 'dark' ? '#e0e0e0' : '#333',
                border: theme === 'dark' ? '1px solid #555' : '1px solid #ddd',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.3s ease'
              }}
              title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            >
              <span>{theme === 'light' ? '🌙' : '☀️'}</span>
              <span>{theme === 'light' ? 'Oscuro' : 'Claro'}</span>
            </button>
          </div>
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

        {/* Login Card */}
        <div className={`login-card ${theme === 'dark' ? 'dark-theme' : ''}`} style={{ 
          backgroundColor: theme === 'dark' ? "#1e1e1e" : "white", 
          borderRadius: "12px", 
          padding: "35px",
          boxShadow: theme === 'dark' ? "0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)" : "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
          margin: "0 15px"
        }}>
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "var(--text-color)", marginBottom: "10px" }}>
              Iniciar Sesión
            </h2>
            <p style={{ color: theme === 'dark' ? "#a0a0a0" : "#666" }}>
              Ingresa tus credenciales para acceder a tu cuenta
            </p>
            {error && (
              <div style={{ 
                backgroundColor: "#fee", 
                color: "#c53030", 
                padding: "10px", 
                borderRadius: "var(--border-radius)", 
                fontSize: "0.9rem",
                textAlign: "center",
                border: "1px solid #feb2b2"
              }}>
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
                  border: theme === 'dark' ? "1px solid #555" : "1px solid #ddd", 
                  borderRadius: "var(--border-radius)", 
                  outline: "none",
                  transition: "all 0.3s ease",
                  backgroundColor: theme === 'dark' ? "#333" : "white",
                  color: theme === 'dark' ? "#e0e0e0" : "black"
                }}
                placeholder="tu@email.com"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", color: "var(--text-color)", marginBottom: "8px" }}>
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "12px 15px", 
                  border: theme === 'dark' ? "1px solid #555" : "1px solid #ddd", 
                  borderRadius: "var(--border-radius)", 
                  outline: "none",
                  transition: "all 0.3s ease",
                  backgroundColor: theme === 'dark' ? "#333" : "white",
                  color: theme === 'dark' ? "#e0e0e0" : "black"
                }}
                placeholder="••••••••"
                required
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  style={{ height: "16px", width: "16px" }}
                />
                <span style={{ marginLeft: "8px", fontSize: "0.9rem", color: theme === 'dark' ? "#a0a0a0" : "#666" }}>Recordarme</span>
              </label>
              <a href="#" style={{ fontSize: "0.9rem", color: "var(--primary-color)", textDecoration: "none" }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{ 
                width: "100%", 
                backgroundColor: isLoading ? "#a0aec0" : "var(--primary-color)", 
                color: "white", 
                fontWeight: "500", 
                padding: "12px 15px", 
                borderRadius: "var(--border-radius)", 
                border: "none",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "background-color 0.3s ease",
                marginTop: "10px"
              }}
            >
              {isLoading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg
                    style={{ 
                      animation: "spin 1s linear infinite",
                      marginRight: "8px",
                      height: "16px",
                      width: "16px"
                    }}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      style={{ opacity: "0.25" }}
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      style={{ opacity: "0.75" }}
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Procesando...</span>
                </div>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <span style={{ color: theme === 'dark' ? "#a0a0a0" : "#666" }}>¿No tienes una cuenta? </span>
            <Link 
              to="/register" 
              style={{ 
                color: "var(--primary-color)", 
                textDecoration: "none", 
                fontWeight: "500"
              }}
            >
              Regístrate aquí
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 Budget Manager. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}