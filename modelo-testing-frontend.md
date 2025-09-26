# Modelo de Testing para Frontend - Editorial Blog Platform

## Descripción General

Este documento sirve como guía para un agente de testing automatizado que utiliza el MCP de Chrome-DevTools para realizar pruebas exhaustivas del frontend de la plataforma Editorial Blog. El frontend está compuesto por 5 páginas principales con funcionalidades específicas y elementos interactivos que requieren validación.

## Arquitectura del Frontend

### Páginas Principales
1. **index.html** - Página principal con listado de posts
2. **editor.html** - Editor de posts con Quill.js
3. **post.html** - Vista individual de posts
4. **about.html** - Página informativa
5. **preview.html** - Vista previa de posts

### Tecnologías Utilizadas
- **CSS Framework**: Estilos personalizados con variables CSS
- **JavaScript**: Vanilla JS con servicios modulares
- **Editor**: Quill.js para edición rica de texto
- **Animaciones**: Anime.js y Splitting.js
- **Fuentes**: Suisse Intl y Canela (Google Fonts)

## Elementos Interactivos Identificados

### Navegación Global
- **Logo**: Enlace a página principal (`.logo`)
- **Enlaces de navegación**: Home, Editor, About (`.nav-links a`)
- **Efectos hover**: Cambio de color y línea inferior

### Página Principal (index.html)
- **Barra de búsqueda**: Input de búsqueda de posts (`.search-input`)
- **Filtros de categoría**: Botones de filtrado (`.filter-btn`)
- **Tarjetas de posts**: Enlaces a posts individuales (`.post-card`)
- **Botones de acción**: "Read More" en cada tarjeta

### Editor (editor.html)
- **Campo de título**: Input para título del post
- **Editor Quill**: Área de edición rica de texto
- **Botones de acción**: 
  - Guardar borrador
  - Vista previa
  - Publicar
- **Subida de imágenes**: Funcionalidad de upload
- **Selector de categoría**: Dropdown de categorías

### Vista de Post (post.html)
- **Contenido dinámico**: Carga basada en parámetro URL
- **Navegación entre posts**: Enlaces anterior/siguiente
- **Botones de compartir**: Redes sociales

## Casos de Prueba Específicos para Chrome-DevTools MCP

### 1. Pruebas de Navegación

```javascript
// Caso de prueba: Navegación principal
{
  "test_name": "navegacion_principal",
  "steps": [
    {
      "action": "navigate_page",
      "url": "http://localhost:3000/frontend/index.html"
    },
    {
      "action": "take_snapshot",
      "description": "Capturar estado inicial de la página"
    },
    {
      "action": "click",
      "selector": ".nav-links a[href='editor.html']",
      "description": "Hacer clic en enlace Editor"
    },
    {
      "action": "wait_for",
      "text": "Blog Editor",
      "description": "Esperar carga de página editor"
    },
    {
      "action": "take_screenshot",
      "description": "Capturar pantalla del editor"
    }
  ],
  "expected_results": [
    "URL debe cambiar a editor.html",
    "Título de página debe ser 'Blog Editor - Editorial Blog'",
    "Editor Quill debe estar visible y funcional"
  ]
}
```

### 2. Pruebas de Búsqueda y Filtrado

```javascript
// Caso de prueba: Funcionalidad de búsqueda
{
  "test_name": "busqueda_posts",
  "steps": [
    {
      "action": "navigate_page",
      "url": "http://localhost:3000/frontend/index.html"
    },
    {
      "action": "fill",
      "selector": ".search-input",
      "value": "tecnología"
    },
    {
      "action": "evaluate_script",
      "function": "() => { document.querySelector('.search-input').dispatchEvent(new Event('input')); }"
    },
    {
      "action": "take_snapshot",
      "description": "Verificar filtrado de resultados"
    }
  ],
  "expected_results": [
    "Posts deben filtrarse según término de búsqueda",
    "Contador de resultados debe actualizarse",
    "Animaciones de filtrado deben ejecutarse"
  ]
}
```

### 3. Pruebas del Editor

```javascript
// Caso de prueba: Creación de post
{
  "test_name": "crear_post_completo",
  "steps": [
    {
      "action": "navigate_page",
      "url": "http://localhost:3000/frontend/editor.html"
    },
    {
      "action": "fill",
      "selector": "#post-title",
      "value": "Post de Prueba Automatizada"
    },
    {
      "action": "click",
      "selector": ".ql-editor",
      "description": "Hacer clic en editor Quill"
    },
    {
      "action": "evaluate_script",
      "function": "() => { window.quill.setText('Contenido de prueba para el post automatizado.'); }"
    },
    {
      "action": "click",
      "selector": ".btn-preview",
      "description": "Hacer clic en botón de vista previa"
    },
    {
      "action": "wait_for",
      "text": "Post Preview",
      "description": "Esperar carga de vista previa"
    }
  ],
  "expected_results": [
    "Título debe aparecer en vista previa",
    "Contenido debe renderizarse correctamente",
    "URL debe cambiar a preview.html"
  ]
}
```

### 4. Pruebas de Responsividad

```javascript
// Caso de prueba: Diseño responsivo
{
  "test_name": "responsividad_mobile",
  "steps": [
    {
      "action": "navigate_page",
      "url": "http://localhost:3000/frontend/index.html"
    },
    {
      "action": "resize_page",
      "width": 375,
      "height": 667,
      "description": "Simular dispositivo móvil"
    },
    {
      "action": "take_screenshot",
      "description": "Capturar vista móvil"
    },
    {
      "action": "resize_page",
      "width": 1920,
      "height": 1080,
      "description": "Volver a vista desktop"
    },
    {
      "action": "take_screenshot",
      "description": "Capturar vista desktop"
    }
  ],
  "expected_results": [
    "Navegación debe adaptarse a móvil",
    "Grid de posts debe reorganizarse",
    "Texto debe mantenerse legible"
  ]
}
```

### 5. Pruebas de Performance

```javascript
// Caso de prueba: Análisis de rendimiento
{
  "test_name": "performance_carga_inicial",
  "steps": [
    {
      "action": "performance_start_trace",
      "reload": true,
      "autoStop": true
    },
    {
      "action": "navigate_page",
      "url": "http://localhost:3000/frontend/index.html"
    },
    {
      "action": "wait_for",
      "text": "Editorial Blog",
      "description": "Esperar carga completa"
    },
    {
      "action": "performance_stop_trace"
    }
  ],
  "expected_results": [
    "LCP debe ser menor a 2.5 segundos",
    "FID debe ser menor a 100ms",
    "CLS debe ser menor a 0.1"
  ]
}
```

## Selectores CSS Críticos

### Elementos de Navegación
- `.navbar` - Barra de navegación principal
- `.logo` - Logo del sitio
- `.nav-links a` - Enlaces de navegación

### Elementos de Búsqueda y Filtrado
- `.search-input` - Campo de búsqueda
- `.filter-btn` - Botones de filtro de categoría
- `.filter-btn.active` - Filtro activo

### Elementos del Editor
- `#post-title` - Campo de título
- `.ql-editor` - Área de edición Quill
- `.btn-save` - Botón guardar
- `.btn-preview` - Botón vista previa
- `.btn-publish` - Botón publicar

### Elementos de Posts
- `.posts-grid` - Contenedor de posts
- `.post-card` - Tarjeta individual de post
- `.post-title` - Título del post
- `.post-excerpt` - Extracto del post
- `.read-more` - Enlace "leer más"

## Flujos de Usuario Principales

### 1. Flujo de Lectura
1. Usuario llega a página principal
2. Navega por lista de posts
3. Utiliza búsqueda/filtros si necesario
4. Hace clic en post de interés
5. Lee contenido completo
6. Navega a otros posts relacionados

### 2. Flujo de Creación
1. Usuario accede al editor
2. Ingresa título del post
3. Escribe contenido usando editor rico
4. Agrega imágenes si necesario
5. Selecciona categoría
6. Previsualiza el post
7. Publica o guarda como borrador

### 3. Flujo de Navegación
1. Usuario utiliza menú principal
2. Accede a diferentes secciones
3. Utiliza logo para volver al inicio
4. Navega entre posts usando enlaces

## Configuración de Testing

### Variables de Entorno
```javascript
const TEST_CONFIG = {
  BASE_URL: "http://localhost:3000/frontend",
  TIMEOUT: 5000,
  SCREENSHOT_PATH: "./screenshots",
  VIEWPORT_SIZES: [
    { width: 1920, height: 1080 }, // Desktop
    { width: 1024, height: 768 },  // Tablet
    { width: 375, height: 667 }    // Mobile
  ]
};
```

### Datos de Prueba
```javascript
const TEST_DATA = {
  SAMPLE_POST: {
    title: "Post de Prueba Automatizada",
    content: "Este es un contenido de prueba para validar la funcionalidad del editor.",
    category: "Tecnología"
  },
  SEARCH_TERMS: ["tecnología", "diseño", "escritura"],
  INVALID_INPUTS: ["", "   ", "<script>alert('xss')</script>"]
};
```

## Validaciones Específicas

### 1. Validaciones Visuales
- Verificar que las fuentes se cargan correctamente
- Confirmar que los colores coinciden con la paleta definida
- Validar que las animaciones se ejecutan suavemente
- Comprobar que las imágenes se cargan sin errores

### 2. Validaciones Funcionales
- Confirmar que la búsqueda filtra correctamente
- Verificar que el editor guarda el contenido
- Validar que la navegación funciona en todas las páginas
- Comprobar que los formularios manejan errores apropiadamente

### 3. Validaciones de Accesibilidad
- Verificar que todos los elementos tienen etiquetas apropiadas
- Confirmar que la navegación por teclado funciona
- Validar contraste de colores
- Comprobar que las imágenes tienen texto alternativo

## Manejo de Errores

### Errores Comunes a Detectar
1. **Error 404**: Páginas no encontradas
2. **Error de API**: Fallos en carga de datos
3. **Error de JavaScript**: Excepciones no manejadas
4. **Error de CSS**: Estilos no aplicados
5. **Error de Fuentes**: Fuentes no cargadas

### Estrategias de Recuperación
```javascript
// Ejemplo de manejo de errores en testing
{
  "error_handling": {
    "network_errors": "Reintentar hasta 3 veces",
    "timeout_errors": "Aumentar tiempo de espera",
    "element_not_found": "Tomar screenshot y continuar",
    "javascript_errors": "Capturar en consola y reportar"
  }
}
```

## Reportes de Testing

### Estructura de Reporte
```javascript
{
  "test_run": {
    "timestamp": "2024-01-XX T XX:XX:XX",
    "duration": "XX segundos",
    "total_tests": XX,
    "passed": XX,
    "failed": XX,
    "skipped": XX
  },
  "test_results": [
    {
      "test_name": "navegacion_principal",
      "status": "passed|failed|skipped",
      "duration": "XX ms",
      "screenshots": ["path/to/screenshot.png"],
      "errors": ["error message if any"]
    }
  ],
  "performance_metrics": {
    "lcp": "X.X segundos",
    "fid": "XX ms",
    "cls": "X.XX"
  }
}
```

## Conclusiones

Este modelo de testing proporciona una base sólida para la automatización de pruebas del frontend Editorial Blog Platform utilizando Chrome-DevTools MCP. Los casos de prueba cubren los aspectos críticos de funcionalidad, rendimiento y experiencia de usuario, asegurando que la aplicación funcione correctamente en diferentes escenarios y dispositivos.

La implementación de estos tests debe realizarse de manera incremental, comenzando con los flujos principales y expandiendo gradualmente hacia casos más específicos y edge cases.