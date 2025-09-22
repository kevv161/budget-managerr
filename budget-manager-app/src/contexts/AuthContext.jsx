import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../connect-firebase';
import { onAuthStateChanged } from 'firebase/auth';

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
    // Suscribirse a los cambios de estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Limpiar la suscripción al desmontar
    return unsubscribe;
  }, []);

  // Valor del contexto
  const value = {
    currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};