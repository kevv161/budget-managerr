import { createContext, useContext, useState, useEffect } from 'react';
import { getStoredUser, loginUser, registerUser, logoutUser } from '../services/auth';

// Crear el contexto de autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario almacenado localmente
    const stored = getStoredUser();
    setCurrentUser(stored);
    setLoading(false);
  }, []);

  // Valor del contexto
  const value = {
    currentUser,
    loading,
    async login(email, password) {
      const result = await loginUser(email, password);
      if (result.success) {
        setCurrentUser(result.user);
      }
      return result;
    },
    async register(email, password, displayName) {
      const result = await registerUser(email, password, displayName);
      if (result.success) {
        setCurrentUser(result.user);
      }
      return result;
    },
    async logout() {
      await logoutUser();
      setCurrentUser(null);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};