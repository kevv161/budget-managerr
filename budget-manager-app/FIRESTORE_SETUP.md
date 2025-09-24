# 🔥 Configuración de Firestore - Budget Manager

## ❌ Problema Actual
La app muestra "Missing or insufficient permissions" porque Firestore no tiene reglas de seguridad configuradas.

## ✅ Solución Rápida (Manual)

### Paso 1: Ir a la Consola de Firebase
1. Abre [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **budget-managementt**
3. Ve a **Firestore Database** en el menú lateral

### Paso 2: Configurar Reglas de Seguridad
1. Haz clic en la pestaña **"Reglas"** (Rules)
2. Reemplaza el contenido actual con estas reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para usuarios autenticados
    match /users/{userId} {
      // Permitir lectura y escritura solo al propietario del documento
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Reglas para subcolecciones de presupuestos
      match /budgets/{budgetId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Reglas para subcolecciones de gastos
      match /expenses/{expenseId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Reglas para colección de prueba (temporal)
    match /_test/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Denegar acceso a cualquier otra colección
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Haz clic en **"Publicar"** (Publish)

### Paso 3: Verificar Configuración
1. Ve a la pestaña **"Datos"** (Data)
2. Deberías ver la estructura:
   ```
   users/
     {userId}/
       budgets/
       expenses/
   ```

## 🚀 Solución Automática (Opcional)

Si tienes Firebase CLI instalado:

```bash
# 1. Instalar Firebase CLI (si no lo tienes)
npm install -g firebase-tools

# 2. Autenticarse
firebase login

# 3. Seleccionar proyecto
firebase use budget-managementt

# 4. Aplicar reglas automáticamente
firebase deploy --only firestore:rules
```

## 🔍 Verificación

Después de aplicar las reglas:

1. **Refresca tu app** en el navegador
2. **Inicia sesión** con tu cuenta
3. **Verifica el panel de debug** (esquina superior derecha)
4. Debería mostrar **"Conectado"** en lugar de errores

## 📋 Estructura de Datos

Con estas reglas, cada usuario solo puede acceder a:

```
users/
  {userId}/                    # Solo el usuario autenticado
    budgets/                   # Sus presupuestos
      {budgetId}/
        amount: number
        createdAt: timestamp
        updatedAt: timestamp
    expenses/                  # Sus gastos
      {expenseId}/
        description: string
        amount: number
        category: string
        isFixed: boolean
        createdAt: timestamp
        updatedAt: timestamp
```

## 🛡️ Seguridad

- ✅ Solo usuarios autenticados pueden acceder
- ✅ Cada usuario solo ve sus propios datos
- ✅ No se puede acceder a datos de otros usuarios
- ✅ Todas las operaciones CRUD están permitidas para el propietario

## 🆘 Si Sigue Fallando

1. **Verifica que estés autenticado** en la app
2. **Revisa la consola del navegador** para errores específicos
3. **Asegúrate de que las reglas se publicaron** correctamente
4. **Espera 1-2 minutos** para que las reglas se propaguen

---

**¡Listo!** Tu app debería funcionar correctamente después de aplicar estas reglas.
