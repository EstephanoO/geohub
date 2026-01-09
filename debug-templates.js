// Script de prueba para diagnosticar problemas con templates personalizados
// Para ejecutar: copy-paste este código en la consola del navegador cuando estés en la página de administración

(function debugPopupTemplates() {
  console.log('🔍 INICIANDO DIAGNÓSTICO DE TEMPLATES PERSONALIZADOS');
  
  // Verificar si tenemos acceso al manager
  if (typeof window === 'undefined') {
    console.error('❌ Este script solo funciona en el navegador');
    return;
  }
  
  // Importar las funciones necesarias (adaptar según la estructura real)
  console.log('📋 Verificando localStorage...');
  
  // Verificar datos existentes
  const allKeys = Object.keys(localStorage);
  const templateKeys = allKeys.filter(k => k.startsWith('custom-templates-'));
  
  console.log('🗂️ Keys encontradas:', templateKeys);
  
  templateKeys.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      const parsed = JSON.parse(data);
      console.log(`📦 ${key}:`, {
        isObject: typeof parsed === 'object',
        isArray: Array.isArray(parsed),
        length: Array.isArray(parsed) ? parsed.length : 'N/A',
        firstItem: Array.isArray(parsed) && parsed.length > 0 ? {
          id: parsed[0].id,
          name: parsed[0].name,
          isCustom: parsed[0].isCustom
        } : null
      });
    } catch (error) {
      console.error(`❌ Error parsing ${key}:`, error);
    }
  });
  
  // Función de prueba para crear un template
  console.log('🧪 Creando template de prueba...');
  const testTemplate = {
    name: 'Template de Prueba Debug',
    description: 'Template creado para debugging',
    icon: '🔧',
    colors: ['#ff0000', '#00ff00'],
    size: { width: 350, minHeight: 250 },
    style: {
      background: 'white',
      borderColor: '#ccc',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      textColor: '#333',
      header: {
        background: 'linear-gradient(135deg, #ff0000, #00ff00)',
        textColor: 'white',
        padding: '16px 20px',
        fontSize: '16px',
        fontWeight: 600,
        borderBottom: 'none'
      },
      section: {
        padding: '20px',
        gap: '8px'
      },
      separator: {
        height: '2px',
        background: '#eee',
        margin: '16px 0'
      },
      table: {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0 8px',
        fontSize: '14px'
      },
      tableRow: {
        borderBottom: '1px solid #eee',
        backgroundColor: '#f9f9f9'
      },
      tableLabel: {
        color: '#666',
        fontWeight: 500,
        padding: '12px 16px',
        width: '45%',
        textAlign: 'left',
        borderLeft: '3px solid #ff0000'
      },
      tableValue: {
        color: '#333',
        fontWeight: 600,
        padding: '12px 16px',
        textAlign: 'right'
      },
      footer: {
        background: '#f5f5f5',
        padding: '16px 20px',
        fontSize: '12px',
        color: '#666',
        textAlign: 'center',
        borderTop: '1px solid #eee'
      }
    },
    layout: {
      sections: ['header', 'content', 'footer'],
      contentLayout: 'table'
    }
  };
  
  // Intentar guardar el template
  const testMapId = 'test-map-' + Date.now();
  try {
    const key = `custom-templates-${testMapId}`;
    localStorage.setItem(key, JSON.stringify([testTemplate]));
    console.log('✅ Template de prueba guardado en:', key);
    
    // Verificar que se puede recuperar
    const recovered = JSON.parse(localStorage.getItem(key));
    console.log('✅ Template recuperado:', recovered[0].name);
  } catch (error) {
    console.error('❌ Error guardando template de prueba:', error);
  }
  
  console.log('🏁 DIAGNÓSTICO COMPLETADO');
  console.log('📖 Resumen:');
  console.log('- Revisa los logs arriba para ver si hay errores');
  console.log('- Si ves templates creados pero no aparecen en UI, el problema está en PopupConfigModal');
  console.log('- Si no se guardan, el problema está en popupTemplatesManager o templateStorage');
  console.log('- Si se guardan pero no se recuperan, el problema está en loadCustomTemplates');
  
  return {
    templateKeys,
    testMapId,
    success: true
  };
})();