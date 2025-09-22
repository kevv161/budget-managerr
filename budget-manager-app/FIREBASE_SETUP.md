# Configuración de Firebase Authentication

## Pasos para configurar la autenticación

### 1. Instalar Firebase (si no está instalado)
```bash
npm install firebase
```

### 2. Crear usuario de prueba
Para crear el usuario de prueba con las credenciales especificadas, ejecuta:

```bash
node src/create-test-user.js
```

**Credenciales de prueba:**
- Email: `daniel@gmail.com`
- Contraseña: `564321`

### 3. Configuración de Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `budget-managerr`
3. Ve a **Authentication** > **Sign-in method**
4. Habilita **Email/Password** como método de autenticación
5. En la pestaña **Users**, puedes ver los usuarios registrados

### 4. Funcionalidades implementadas

✅ **Autenticación con Firebase**
- Login con email y contraseña
- Registro de nuevos usuarios con validación completa
- Manejo de errores de autenticación
- Logout de usuarios

✅ **Interfaz de usuario**
- Formulario de login con validación
- Formulario de registro con campos: nombre completo, email, contraseña y confirmación
- Mensajes de error y éxito personalizados
- Botón para llenar credenciales de prueba automáticamente
- Indicador de carga durante la autenticación
- Navegación fluida entre login y registro

✅ **Navegación protegida**
- Redirección automática después del login exitoso
- Redirección automática al login después del registro exitoso
- Integración completa con React Router

### 5. Uso de la aplicación

#### **Para usuarios existentes (Login):**
1. Ejecuta la aplicación: `npm run dev`
2. Ve a la página de login (`/login`)
3. Usa las credenciales de prueba o haz clic en "Usar credenciales de prueba"
4. El sistema te redirigirá al dashboard principal después del login exitoso

#### **Para nuevos usuarios (Registro):**
1. Desde la página de login, haz clic en "Regístrate aquí"
2. Completa el formulario de registro con:
   - Nombre completo
   - Correo electrónico
   - Contraseña (mínimo 6 caracteres)
   - Confirmación de contraseña
3. Haz clic en "Crear Cuenta"
4. Después del registro exitoso, serás redirigido automáticamente al login
5. Inicia sesión con tus nuevas credenciales

### 6. Archivos modificados

- `src/connect-firebase.jsx` - Configuración y funciones de Firebase
- `src/pages/Login.jsx` - Componente de login con autenticación real
- `src/pages/Register.jsx` - Componente de registro de usuarios
- `src/App.jsx` - Routing actualizado con ruta de registro
- `src/create-test-user.js` - Script para crear usuario de prueba

### 7. Funciones disponibles

```javascript
import { loginUser, registerUser, logoutUser } from './connect-firebase';

// Login
const result = await loginUser(email, password);

// Registro
const result = await registerUser(email, password);

// Logout
const result = await logoutUser();
```

### 8. Manejo de errores

La aplicación maneja automáticamente los siguientes errores:

**En Login:**
- Credenciales incorrectas
- Usuario no encontrado
- Errores de conexión

**En Registro:**
- Email ya registrado
- Contraseña débil (menos de 6 caracteres)
- Contraseñas que no coinciden
- Campos vacíos o inválidos
- Errores de conexión

**Validaciones del formulario de registro:**
- Nombre completo requerido
- Email válido requerido
- Contraseña mínimo 6 caracteres
- Confirmación de contraseña debe coincidir

### 9. Próximos pasos

- [ ] Implementar recuperación de contraseña
- [ ] Agregar autenticación con Google/Twitter
- [ ] Implementar persistencia de sesión
- [ ] Agregar validación de email
