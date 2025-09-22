// Script para crear el usuario de prueba
// Ejecutar este script una vez para registrar el usuario daniel@gmail.com

import { registerUser } from './connect-firebase.js';

const createTestUser = async () => {
  console.log('Creando usuario de prueba...');
  
  const email = 'daniel@gmail.com';
  const password = '564321';
  
  try {
    const result = await registerUser(email, password);
    
    if (result.success) {
      console.log('✅ Usuario de prueba creado exitosamente!');
      console.log('Email:', email);
      console.log('Password:', password);
      console.log('UID:', result.user.uid);
    } else {
      console.error('❌ Error al crear usuario:', result.error);
    }
  } catch (error) {
    console.error('❌ Error durante el registro:', error);
  }
};

// Ejecutar la función
createTestUser();
