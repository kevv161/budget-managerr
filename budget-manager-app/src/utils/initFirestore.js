// Script para inicializar automáticamente la base de datos de Firestore
import { db } from '../Data/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Función para inicializar la estructura de datos de un usuario
export const initializeUserData = async (userId) => {
  try {
    // Crear documento de usuario con metadatos
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        createdAt: new Date(),
        lastLogin: new Date(),
        version: '1.0'
      });
    }

    // Crear subcolecciones si no existen
    const budgetRef = doc(db, 'users', userId, 'budgets', 'default');
    const budgetDoc = await getDoc(budgetRef);
    
    if (!budgetDoc.exists()) {
      await setDoc(budgetRef, {
        amount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // La colección de gastos se creará automáticamente cuando se agregue el primer gasto
    
  } catch (error) {
    console.error('❌ Error inicializando datos de usuario:', error);
    throw error;
  }
};

// Función para verificar la conexión a Firestore
export const testFirestoreConnection = async () => {
  try {
    const testDocRef = doc(db, '_test', 'connection');
    await setDoc(testDocRef, {
      timestamp: new Date(),
      test: true
    });
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a Firestore:', error);
    
    // Verificar si es un error de permisos
    if (error.code === 'permission-denied') {
      console.error('🔒 Error de permisos: Las reglas de Firestore no están configuradas correctamente');
      console.error('📋 Ve a Firebase Console > Firestore > Rules y aplica las reglas de seguridad');
    }
    
    return false;
  }
};
