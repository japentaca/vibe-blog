# Modelo de Testing para Frontend - Editorial Blog Platform

## Descripción General

Este documento sirve como guía para un agente de testing automatizado que utiliza el MCP de Chrome-DevTools para realizar pruebas de funcionalidad y seguridad del frontend de la plataforma Editorial Blog.

**IMPORTANTE**: La funcionalidad de edición de posts requiere autenticación. Los usuarios deben iniciar sesión antes de poder crear, editar o eliminar publicaciones.

## Arquitectura del Frontend

### Páginas Principales
1. **index.html** - Página principal con listado de posts
2. **editor.html** - Editor de posts con Quill.js
3. **post.html** - Vista individual de posts
4. **about.html** - Página informativa
5. **preview.html** - Vista previa de posts

## Sistema de Autenticación y Seguridad

### Credenciales de Prueba
Para probar las funcionalidades que requieren autenticación, utiliza las siguientes credenciales específicas para testing:

#### Usuarios de Testing Disponibles
- **test_admin** / **Adm1n$ecur3T3st!** (test_admin@testing.local) - Rol: admin
- **test_editor** / **Ed1t0r$ecur3T3st!** (test_editor@testing.local) - Rol: editor  
- **test_author** / **Auth0r$ecur3T3st!** (test_author@testing.local) - Rol: author

#### Scripts de Gestión de Usuarios de Testing

```bash
# Navegar al directorio del backend
cd backend

# Crear usuarios de testing (si no existen)
node scripts/createUser.js test_admin "Adm1n$ecur3T3st!" test_admin@testing.local admin
node scripts/createUser.js test_editor "Ed1t0r$ecur3T3st!" test_editor@testing.local editor
node scripts/createUser.js test_author "Auth0r$ecur3T3st!" test_author@testing.local author

# Listar usuarios de testing
node scripts/deleteTestUsers.js list

# Eliminar todos los usuarios de testing (para limpiar entre pruebas)
node scripts/deleteTestUsers.js all

# Eliminar un usuario específico de testing
node scripts/deleteTestUsers.js test_admin
```

### Roles y Permisos
- **admin**: Puede crear, editar, eliminar y publicar posts. Puede gestionar usuarios.
- **editor**: Puede crear, editar, eliminar y publicar posts.
- **author**: Puede crear y editar sus propios posts.

### Rutas Protegidas
Las siguientes rutas del backend requieren autenticación:
- `POST /api/posts` - Crear nuevo post (requiere permiso 'create_posts')
- `PUT /api/posts/:id` - Editar post (requiere ser propietario o tener permisos de edición)
- `DELETE /api/posts/:id` - Eliminar post (requiere ser propietario o tener permisos de edición)

### Endpoints de Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener información del usuario actual
- `GET /api/auth/check` - Verificar si hay sesión activa

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

### 0. Pruebas de Autenticación (PREREQUISITO)

```javascript
// Caso de prueba: Login de usuario
{
  "test_name": "login_usuario_admin",
  "description": "Autenticación de usuario administrador para pruebas de edición",
  "steps": [
    {
      "action": "navigate_page",
      "url": "http://localhost:3000/login"
    },
    {
      "action": "take_snapshot",
      "description": "Capturar estado inicial de la página de login"
    },
    {
      "action": "fill",
      "selector": "#usernameOrEmail",
      "value": "test_admin",
      "description": "Ingresar nombre de usuario"
    },
    {
      "action": "fill",
      "selector": "#password",
      "value": "Adm1n$ecur3T3st!",
      "description": "Ingresar contraseña"
    },
    {
      "action": "click",
      "selector": "#loginBtn",
      "description": "Hacer clic en botón de login"
    },
    {
      "action": "wait_for",
      "text": "Dashboard",
      "description": "Esperar redirección exitosa"
    },
    {
      "action": "evaluate_script",
      "function": "() => { return fetch('/api/auth/check').then(r => r.json()); }",
      "description": "Verificar estado de autenticación"
    }
  ],
  "expected_results": [
    "Login debe ser exitoso",
    "Usuario debe ser redirigido al dashboard o página principal",
    "Sesión debe estar activa",
    "API debe confirmar autenticación"
  ]
}
```

```javascript
// Caso de prueba: Verificación de sesión
{
  "test_name": "verificar_sesion_activa",
  "description": "Verificar que la sesión se mantiene entre páginas",
  "steps": [
    {
      "action": "navigate_page",
      "url": "http://localhost:3000/editor"
    },
    {
      "action": "evaluate_script",
      "function": "() => { return fetch('/api/auth/check').then(r => r.json()); }",
      "description": "Verificar estado de autenticación en editor"
    },
    {
      "action": "take_snapshot",
      "description": "Capturar estado del editor con usuario autenticado"
    }
  ],
  "expected_results": [
    "Usuario debe tener acceso al editor",
    "API debe confirmar sesión activa",
    "Editor debe mostrar opciones de creación/edición"
  ]
}
```

### 1. Pruebas de Navegación

```javascript
// Caso de prueba: Navegación principal
{
  "test_name": "navegacion_principal",
  "steps": [
    {
      "action": "navigate_page",
      "url": "http://localhost:3000/"
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
      "url": "http://localhost:3000/"
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
// Caso de prueba: Creación de post (REQUIERE AUTENTICACIÓN PREVIA)
{
  "test_name": "crear_post_completo",
  "prerequisites": ["login_usuario_admin"],
  "description": "Creación completa de un post con usuario autenticado",
  "steps": [
    {
      "action": "evaluate_script",
      "function": "() => { return fetch('/api/auth/check').then(r => r.json()); }",
      "description": "Verificar autenticación antes de proceder"
    },
    {
      "action": "navigate_page",
      "url": "http://localhost:3000/editor"
    },
    {
      "action": "take_snapshot",
      "description": "Capturar estado inicial del editor"
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
      "selector": ".btn-save",
      "description": "Guardar borrador del post"
    },
    {
      "action": "wait_for",
      "text": "Borrador guardado",
      "description": "Esperar confirmación de guardado"
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
    "Usuario debe estar autenticado",
    "Editor debe cargar correctamente",
    "Post debe guardarse como borrador",
    "Título debe aparecer en vista previa",
    "Contenido debe renderizarse correctamente",
    "URL debe cambiar a preview.html"
  ]
}
```

```javascript
// Caso de prueba: Publicación de post
{
  "test_name": "publicar_post",
  "prerequisites": ["login_usuario_admin", "crear_post_completo"],
  "description": "Publicar un post previamente creado",
  "steps": [
    {
      "action": "navigate_page",
      "url": "http://localhost:3000/editor"
    },
    {
      "action": "fill",
      "selector": "#post-title",
      "value": "Post de Prueba para Publicación"
    },
    {
      "action": "click",
      "selector": ".ql-editor"
    },
    {
      "action": "evaluate_script",
      "function": "() => { window.quill.setText('Este post será publicado automáticamente.'); }"
    },
    {
      "action": "fill",
      "selector": "#category",
      "value": "Tecnología"
    },
    {
      "action": "click",
      "selector": ".btn-publish",
      "description": "Hacer clic en botón de publicar"
    },
    {
      "action": "wait_for",
      "text": "Post publicado exitosamente",
      "description": "Esperar confirmación de publicación"
    },
    {
      "action": "navigate_page",
      "url": "http://localhost:3000/"
    },
    {
      "action": "wait_for",
      "text": "Post de Prueba para Publicación",
      "description": "Verificar que el post aparece en la página principal"
    }
  ],
  "expected_results": [
    "Post debe publicarse exitosamente",
    "Debe aparecer confirmación de publicación",
    "Post debe ser visible en la página principal",
    "Post debe tener estado 'published'"
  ]
}
```

```javascript
// Caso de prueba: Edición de post existente
{
  "test_name": "editar_post_existente",
  "prerequisites": ["login_usuario_admin"],
  "description": "Editar un post existente con permisos de administrador",
  "steps": [
    {
      "action": "navigate_page",
      "url": "http://localhost:3000/"
    },
    {
      "action": "click",
      "selector": ".post-item:first-child .btn-edit",
      "description": "Hacer clic en botón editar del primer post"
    },
    {
      "action": "wait_for",
      "text": "Editor",
      "description": "Esperar carga del editor"
    },
    {
      "action": "evaluate_script",
      "function": "() => { const title = document.getElementById('post-title'); title.value = title.value + ' - EDITADO'; title.dispatchEvent(new Event('input')); }",
      "description": "Modificar título del post"
    },
    {
      "action": "click",
      "selector": ".ql-editor"
    },
    {
      "action": "evaluate_script",
      "function": "() => { const currentText = window.quill.getText(); window.quill.setText(currentText + '\\n\\nContenido editado automáticamente.'); }",
      "description": "Agregar contenido al post"
    },
    {
      "action": "click",
      "selector": ".btn-save",
      "description": "Guardar cambios"
    },
    {
      "action": "wait_for",
      "text": "Post actualizado",
      "description": "Esperar confirmación de actualización"
    },
    {
      "action": "navigate_page",
      "url": "http://localhost:3000/"
    },
    {
      "action": "wait_for",
      "text": "EDITADO",
      "description": "Verificar que los cambios se reflejan en la lista"
    }
  ],
  "expected_results": [
    "Usuario debe tener permisos de edición",
    "Editor debe cargar con contenido existente",
    "Cambios deben guardarse correctamente",
    "Post editado debe aparecer en la lista principal",
    "Título debe mostrar la modificación"
  ]
}
```

```javascript
// Caso de prueba: Eliminación de post
{
  "test_name": "eliminar_post",
  "prerequisites": ["login_usuario_admin"],
  "description": "Eliminar un post con permisos de administrador",
  "steps": [
    {
      "action": "navigate_page",
      "url": "http://localhost:3000/"
    },
    {
      "action": "evaluate_script",
      "function": "() => { return document.querySelectorAll('.post-item').length; }",
      "description": "Contar posts antes de eliminar"
    },
    {
      "action": "click",
      "selector": ".post-item:last-child .btn-delete",
      "description": "Hacer clic en botón eliminar del último post"
    },
    {
      "action": "handle_dialog",
      "action": "accept",
      "description": "Confirmar eliminación en el diálogo"
    },
    {
      "action": "wait_for",
      "text": "Post eliminado",
      "description": "Esperar confirmación de eliminación"
    },
    {
      "action": "evaluate_script",
      "function": "() => { return document.querySelectorAll('.post-item').length; }",
      "description": "Verificar que el número de posts disminuyó"
    }
  ],
  "expected_results": [
    "Usuario debe tener permisos de eliminación",
    "Debe aparecer diálogo de confirmación",
    "Post debe eliminarse de la base de datos",
    "Lista debe actualizarse automáticamente",
    "Número total de posts debe disminuir en 1"
  ]
}
```

### 4. Pruebas de Seguridad

```javascript
// Caso de prueba: Validación de autenticación
{
  "test_name": "validacion_autenticacion",
  "description": "Verificar que las rutas protegidas requieren autenticación",
  "steps": [
    {
      "action": "navigate_page",
      "url": "http://localhost:3000/editor"
    },
    {
      "action": "evaluate_script",
      "function": "() => { return fetch('/api/auth/check').then(r => r.json()); }",
      "description": "Verificar estado de autenticación"
    },
    {
      "action": "take_snapshot",
      "description": "Capturar estado sin autenticación"
    }
  ],
  "expected_results": [
    "Usuario no autenticado debe ser redirigido al login",
    "API debe retornar estado no autenticado",
    "Editor no debe ser accesible sin login"
  ]
}
```

```javascript
// Caso de prueba: Validación de permisos por rol
{
  "test_name": "validacion_permisos_rol",
  "description": "Verificar que los permisos se respetan según el rol del usuario",
  "prerequisites": ["login_usuario_author"],
  "steps": [
    {
      "action": "navigate_page",
      "url": "http://localhost:3000/"
    },
    {
      "action": "evaluate_script",
      "function": "() => { return document.querySelectorAll('.btn-delete').length; }",
      "description": "Verificar botones de eliminación visibles para author"
    },
    {
      "action": "click",
      "selector": ".post-item:first-child .btn-edit",
      "description": "Intentar editar post de otro usuario"
    }
  ],
  "expected_results": [
    "Author no debe ver botones de eliminación en posts ajenos",
    "Author no debe poder editar posts de otros usuarios",
    "Debe aparecer mensaje de permisos insuficientes"
  ]
}
```

```javascript
// Caso de prueba: Prevención de XSS
{
  "test_name": "prevencion_xss",
  "description": "Verificar que el contenido malicioso es sanitizado",
  "prerequisites": ["login_usuario_admin"],
  "steps": [
    {
      "action": "navigate_page",
      "url": "http://localhost:3000/editor"
    },
    {
      "action": "fill",
      "selector": "#post-title",
      "value": "<script>alert('XSS')</script>Título de Prueba"
    },
    {
      "action": "click",
      "selector": ".ql-editor"
    },
    {
      "action": "evaluate_script",
      "function": "() => { window.quill.setText('<script>alert(\"XSS\")</script>Contenido malicioso'); }"
    },
    {
      "action": "click",
      "selector": ".btn-save"
    },
    {
      "action": "navigate_page",
      "url": "http://localhost:3000/"
    },
    {
      "action": "evaluate_script",
      "function": "() => { return document.querySelector('.post-title').innerHTML; }",
      "description": "Verificar que el script fue sanitizado"
    }
  ],
  "expected_results": [
    "Scripts maliciosos deben ser sanitizados",
    "Contenido debe mostrarse como texto plano",
    "No debe ejecutarse código JavaScript inyectado"
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
  BASE_URL: "http://localhost:3000",
  TIMEOUT: 5000,
  SCREENSHOT_PATH: "./screenshots"
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
  MALICIOUS_INPUTS: ["<script>alert('xss')</script>", "javascript:alert('xss')", "onload=alert('xss')"]
};
```

## Validaciones Específicas

### 1. Validaciones Funcionales
- Confirmar que la búsqueda filtra correctamente
- Verificar que el editor guarda el contenido
- Validar que la navegación funciona en todas las páginas
- Comprobar que los formularios manejan errores apropiadamente

### 2. Validaciones de Seguridad
- Verificar autenticación en rutas protegidas
- Validar permisos según roles de usuario
- Comprobar sanitización de contenido malicioso
- Confirmar que las sesiones expiran correctamente

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
      "errors": ["error message if any"],
      "security_issues": ["security issue if any"]
    }
  ]
}
```

## Conclusiones

Este modelo de testing proporciona una base sólida para la automatización de pruebas de funcionalidad y seguridad del frontend Editorial Blog Platform utilizando Chrome-DevTools MCP. Los casos de prueba cubren los aspectos críticos de autenticación, autorización, prevención de vulnerabilidades y funcionalidad básica, asegurando que la aplicación sea segura y funcional.

## Notas Adicionales

- Todos los tests deben ejecutarse con el servidor backend corriendo en puerto 3001
- El frontend debe estar servido desde puerto 3000
- Verificar que la base de datos SQLite esté inicializada con datos de prueba
- Los tests de performance deben ejecutarse en modo incógnito para evitar interferencias de extensiones

## Notas Importantes sobre Autenticación

### Prerequisitos de Autenticación
- **CRÍTICO**: Todas las operaciones de creación, edición y eliminación de posts requieren autenticación previa
- Los tests que involucren estas operaciones DEBEN ejecutar primero el caso de prueba `login_usuario_admin`
- Verificar siempre el estado de autenticación antes de proceder con operaciones protegidas

### Gestión de Sesiones en Testing
- Las sesiones se mantienen durante la ejecución de los tests en el mismo navegador
- Para tests de diferentes roles, cerrar sesión explícitamente antes de cambiar de usuario
- Usar `evaluate_script` con `fetch('/api/auth/check')` para verificar estado de autenticación

### Roles y Permisos en Testing
- **Admin**: Puede crear, editar y eliminar cualquier post
- **Editor**: Puede crear posts y editar sus propios posts
- **Author**: Solo puede crear posts (sin edición posterior)

### Manejo de Errores de Autenticación
- Si un test falla por falta de autenticación, verificar:
  1. Que el usuario esté logueado correctamente
  2. Que el usuario tenga los permisos necesarios
  3. Que la sesión no haya expirado
  4. Que las cookies de sesión estén presentes

### Limpieza de Datos de Prueba
- Después de ejecutar tests de creación/edición, considerar limpiar los posts de prueba
- Usar el endpoint `DELETE /api/posts/:id` con credenciales de admin para limpieza
- Mantener un registro de los IDs de posts creados durante testing para facilitar la limpieza