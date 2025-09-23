import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../Data/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { loginUser, registerUser, logoutUser } from '../Data/firebase';

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
    // Suscribirse a Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
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