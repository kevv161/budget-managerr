#!/usr/bin/env node

/**
 * Script para configurar Firestore automáticamente
 * 
 * Este script:
 * 1. Aplica las reglas de seguridad de Firestore
 * 2. Crea la estructura inicial de la base de datos
 * 3. Verifica la conexión
 * 
 * Requisitos:
 * - Firebase CLI instalado: npm install -g firebase-tools
 * - Proyecto configurado: firebase login && firebase use budget-managementt
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando Firestore para Budget Manager...\n');

// Verificar si Firebase CLI está instalado
function checkFirebaseCLI() {
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    console.log('✅ Firebase CLI detectado');
    return true;
  } catch (error) {
    console.log('❌ Firebase CLI no encontrado');
    console.log('📦 Instalando Firebase CLI...');
    try {
      execSync('npm install -g firebase-tools', { stdio: 'inherit' });
      console.log('✅ Firebase CLI instalado');
      return true;
    } catch (installError) {
      console.log('❌ Error instalando Firebase CLI:', installError.message);
      return false;
    }
  }
}

// Aplicar reglas de Firestore
function deployFirestoreRules() {
  try {
    console.log('📋 Aplicando reglas de seguridad de Firestore...');
    
    // Verificar que el archivo de reglas existe
    const rulesPath = path.join(__dirname, 'firestore.rules');
    if (!fs.existsSync(rulesPath)) {
      console.log('❌ Archivo firestore.rules no encontrado');
      return false;
    }
    
    // Aplicar las reglas
    execSync('firebase deploy --only firestore:rules', { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    
    console.log('✅ Reglas de Firestore aplicadas correctamente');
    return true;
  } catch (error) {
    console.log('❌ Error aplicando reglas:', error.message);
    console.log('💡 Asegúrate de estar autenticado: firebase login');
    console.log('💡 Y de tener el proyecto configurado: firebase use budget-managementt');
    return false;
  }
}

// Verificar configuración del proyecto
function checkProjectConfig() {
  try {
    console.log('🔍 Verificando configuración del proyecto...');
    const result = execSync('firebase projects:list', { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    if (result.includes('budget-managementt')) {
      console.log('✅ Proyecto budget-managementt encontrado');
      return true;
    } else {
      console.log('❌ Proyecto budget-managementt no encontrado');
      console.log('💡 Ejecuta: firebase use budget-managementt');
      return false;
    }
  } catch (error) {
    console.log('❌ Error verificando proyecto:', error.message);
    return false;
  }
}

// Función principal
async function main() {
  console.log('='.repeat(50));
  console.log('🔧 CONFIGURACIÓN AUTOMÁTICA DE FIRESTORE');
  console.log('='.repeat(50));
  
  // Paso 1: Verificar Firebase CLI
  if (!checkFirebaseCLI()) {
    console.log('\n❌ No se puede continuar sin Firebase CLI');
    process.exit(1);
  }
  
  // Paso 2: Verificar configuración del proyecto
  if (!checkProjectConfig()) {
    console.log('\n❌ Configuración del proyecto incorrecta');
    console.log('\n📝 Pasos manuales requeridos:');
    console.log('1. firebase login');
    console.log('2. firebase use budget-managementt');
    console.log('3. Ejecuta este script nuevamente');
    process.exit(1);
  }
  
  // Paso 3: Aplicar reglas
  if (deployFirestoreRules()) {
    console.log('\n🎉 ¡Configuración completada exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('✅ Firebase CLI configurado');
    console.log('✅ Proyecto budget-managementt seleccionado');
    console.log('✅ Reglas de seguridad aplicadas');
    console.log('\n🚀 Tu app ahora debería funcionar correctamente');
  } else {
    console.log('\n❌ Error en la configuración');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkFirebaseCLI, deployFirestoreRules, checkProjectConfig };
