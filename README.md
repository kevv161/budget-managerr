
---
**Introducción**
- Budget Manager es una aplicación web que ayuda a organizar presupuestos mensuales, registrar gastos por categoría y visualizar métricas financieras clave (gastos, fondo de emergencia, restante y ahorros).
- Incluye autenticación de usuarios, persistencia en Firebase Firestore y exportación de datos a Excel, Word y PDF.
- Está pensada para usuarios finales que desean controlar sus finanzas de manera simple, visual y segura.

**Requisitos**
- Sistema operativo: Windows 10/11.
- Node.js 18 o superior y `npm` instalado.
- Navegador moderno (Chrome, Edge, Firefox).
- Cuenta y proyecto en Firebase con Authentication (Email/Password) y Firestore habilitados.

**Instalación**
- Instalar dependencias:
  ```bash
  npm install
  ```
- Iniciar entorno de desarrollo:
  ```bash
  npm run dev
  ```
- Compilar para producción:
  ```bash
  npm run build
  ```

**Configuración**
- Firebase (recomendado):
  - Crear proyecto en Firebase Console y habilitar Authentication (Email/Password).
  - Habilitar Firestore en modo producción.
  - Configurar reglas de seguridad de Firestore con el archivo `firestore.rules` incluido (ver despliegue):
    ```bash
    firebase deploy --only firestore
    ```
  - Actualizar credenciales de Firebase en `src/Data/firebase.jsx` o, preferentemente, migrarlas a variables de entorno con prefijo `VITE_` para Vite.
- Hosting (opcional):
  - Instalar CLI de Firebase:
    ```bash
    npm install -g firebase-tools
    ```
  - Autenticarse:
    ```bash
    firebase login
    ```
  - Desplegar hosting y reglas:
    ```bash
    firebase deploy --only hosting,firestore
    ```

**Guías Paso a Paso**
- Crear cuenta:
  - Abrir la app y acceder a “Registro”.
  - Completar “Nombre Completo”, “Correo Electrónico” y “Contraseña” (mínimo 6 caracteres).
  - Pulsar “Registrarse”; será redirigido a “Inicio”.
- Iniciar sesión:
  - Ir a “Login”.
  - Ingresar “Correo” y “Contraseña”.
  - Pulsar “Iniciar Sesión”; será redirigido a “Inicio”.
- Seleccionar moneda:
  - En la cabecera, abrir el selector de “Moneda”.
  - Elegir “Quetzales (Q)” o “Dólares ($)”.
  - La preferencia se guarda y se usa en formatos y exportaciones.
- Establecer presupuesto:
  - Si es la primera vez o desea cambiarlo: pulsar “Establecer/Cambiar Presupuesto”.
  - Ingresar el monto y confirmar.
  - Se creará/actualizará el mismo presupuesto para el mes actual y los próximos 3 meses.
- Ver resumen financiero:
  - Panel “Presupuesto Total”, “Gastos Totales”, “Restante” y “Fondo de Emergencia (10%)”.
  - El estado visual de “Restante” cambia cuando está bajo o negativo.
- Agregar gasto:
  - En el panel izquierdo, completar “Descripción”, “Monto” y “Categoría”.
  - El tipo (Fijo/No Fijo) se autocompleta según la categoría.
  - Pulsar “Agregar Gasto”.
- Ver/Eliminar gastos:
  - En el panel derecho, lista de gastos con categoría, tipo y monto.
  - Para eliminar, pulsar el icono de papelera del gasto.
- Exportar datos:
  - Pulsa “Excel”, “Word” o “PDF” en “Exportar Datos”.
  - Requisitos: tener presupuesto y al menos un gasto para habilitar los botones.
  - Se descarga un archivo con nombre del tipo `presupuesto_{email}_{YYYY-MM-DD}.{xlsx|docx|pdf}`.
- Historial de presupuestos:
  - Ir a “Historial”.
  - Filtrar por mes en el selector “Filtrar por mes”.
  - Ver tarjetas por mes con presupuesto, gastos, restante, fondo y ahorros.
- Gráficas:
  - “Comparativa mensual: Presupuesto vs Gastos” muestra barras por mes.
  - “Comparación de gastos por categorías” compara mes anterior vs actual apilado por categoría.
  - Pulsar “Mostrar gráficas” / “Comparación de gastos” para alternar.
- Editar presupuesto por mes:
  - En la tarjeta del mes, pulsar “Editar”.
  - Ingresar el nuevo monto del presupuesto.
  - Guardar cambios; solo afecta ese mes.
- Simular mes (para pruebas):
  - En “Historial”, seleccionar un mes en “Simular mes actual”.
  - Útil para probar visualizaciones como exportación y gráficos con distintos contextos.
  - Pulsar “Resetear” para volver al mes real.
- Cerrar sesión:
  - En cabecera, pulsar “Cerrar sesión” (🚪); regresará a “Login”.

**Capturas de Pantalla (Sugeridas y Anotadas)**
- Inicio de sesión:
  - Anotar campos de “Correo”, “Contraseña” y botón “Iniciar Sesión”.
- Registro:
  - Resaltar “Nombre Completo”, “Correo”, “Contraseña” y el botón “Registrarse”.
- Inicio (Home):
  - Cabecera: anotar “Moneda” y “Mes actual”.
  - Sección “Establecer/Cambiar Presupuesto”: resaltar el formulario y aviso de meses afectados.
  - Resumen: señalar tarjetas de “Presupuesto”, “Gastos”, “Restante”, “Fondo”.
  - Panel gastos: anotar “Agregar Gasto” y “Gastos”.
  - Exportar: resaltar botones y condición de habilitado.
- Historial:
  - Filtro por mes: resaltar selector.
  - Tarjeta de mes: señalar “Editar”, presupuesto, métricas y listado de gastos.
  - Gráficas: apuntar leyenda, ejes y barras (Presupuesto vs Gasto; Categorías).
  - Simulación: anotar selector y botón “Resetear”.
- Recomendación:
  - Incluir flechas y etiquetas con textos breves (“Selecciona moneda aquí”, “Agrega un gasto”, “Exportar PDF”).
  - Guardar las capturas con nombres descriptivos: `01-login.png`, `02-home-currency.png`, etc.

**Problemas Comunes (FAQ)**
- No puedo iniciar sesión:
  - Verificar correo/contraseña; la contraseña debe tener al menos 6 caracteres.
  - Confirmar que Firebase Authentication Email/Password esté habilitado.
- “Error de conexión a Firestore”:
  - Revisar reglas `firestore.rules`, permisos y que el proyecto de Firebase esté correctamente vinculado.
  - Asegurar que el usuario esté autenticado.
- Botones de exportación deshabilitados:
  - Debe existir un presupuesto y al menos un gasto para habilitarlos.
- No veo presupuestos:
  - Establecer un presupuesto desde Home.
  - El sistema crea/actualiza presupuesto para 4 meses (actual + 3 futuros).
- Gastos no aparecen:
  - Verificar que el monto sea >0 y con formato numérico.
  - Confirmar que está autenticado (los datos son por usuario).
- Conversión de moneda no coincide:
  - Las tasas GTQ↔USD son estáticas y aproximadas; pueden ajustarse en `src/utils/currencyConverter.js`.
- “permission-denied” en Firestore:
  - Asegurar que `request.auth.uid == userId` para rutas `users/{userId}`.
  - Volver a desplegar reglas:
    ```bash
    firebase deploy --only firestore
    ```
- Presupuestos duplicados por mes:
  - Evitar establecer presupuesto simultáneamente en múltiples dispositivos.
  - Si ocurre, editar el mes específico desde “Historial” y conservar solo un documento por `monthKey`.
- Gráficas no se muestran:
  - Verificar que existan datos (presupuesto y gastos) para los meses.
  - Revisar consola del navegador por errores.
- Despliegue muestra página en blanco:
  - Confirmar que ejecutó `npm run build` y que `firebase.json` apunta a `public: "dist"`.
  ```bash
  npm run build
  ```
  - Desplegar hosting:
  ```bash
  firebase deploy --only hosting
  ```

**Soporte Técnico**
- Email de soporte (personalizar): `soporte@tu-dominio.com`
- Horario de atención (personalizar): `L-V 9:00–18:00 (GMT-6)`
- Incluir en su organización:
  - En la app: un enlace “Ayuda/Soporte” en la cabecera o pie.
  - En los archivos: sección “Contacto” en `README.md`.
  - Opcional: formulario de contacto o chatbot.

**Recomendaciones**
- Configurar variables de entorno (`.env`) para credenciales de Firebase (con prefijo `VITE_`) y evitar hardcode:
  - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`.
- Eliminar el acceso a la colección `_test` en `firestore.rules` en producción si no se utiliza.
- Añadir una sección “Ayuda” dentro de la app con enlaces a esta documentación y a soporte.

Con esta guía, cualquier usuario final puede instalar, configurar y usar el sistema con claridad, además de contar con referencias visuales y soluciones a problemas comunes.
        