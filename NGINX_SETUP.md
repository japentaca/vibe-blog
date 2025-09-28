# Configuración de NGINX para el Blog Node.js

## Configuración de Seguridad Implementada

### Mejoras en el Servidor Backend (server.js)

1. **Configuración segura de archivos estáticos**:
   - Denegación de archivos que empiecen con punto (dotfiles)
   - Headers de seguridad automáticos
   - Protección contra directory traversal
   - Validación de tipos MIME

2. **Rutas optimizadas**:
   - `/resources/` - Para recursos estáticos (CSS, imágenes, etc.)
   - `/js/` - Para archivos JavaScript con validación estricta
   - Eliminación de la ruta `/frontend/` que exponía todos los archivos

3. **Headers de seguridad**:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`

## Configuración de NGINX para Producción

### Instalación y Configuración

1. **Copiar el archivo de configuración**:
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/blog
   ```

2. **Editar las rutas en el archivo**:
   - Cambiar `tu-dominio.com` por el dominio real
   - Actualizar `/ruta/al/proyecto/` con la ruta real del proyecto
   - Configurar certificados SSL si se usa HTTPS

3. **Habilitar el sitio**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Características de Seguridad de NGINX

1. **Archivos estáticos servidos directamente por NGINX**:
   - Mayor rendimiento
   - Cache optimizado
   - Compresión gzip automática

2. **Protección contra ataques**:
   - Denegación de archivos sensibles
   - Límites de tamaño de archivo
   - Headers de seguridad

3. **Optimización de cache**:
   - Recursos estáticos: 1 año
   - JavaScript: 1 hora
   - API: sin cache

## Variables de Entorno Recomendadas

Crear un archivo `.env` en el directorio backend:

```env
NODE_ENV=production
PORT=3000
SESSION_SECRET=tu_secreto_muy_seguro_aqui
DB_PATH=./database/blog.db
```

## Comandos de Despliegue

### Desarrollo
```bash
cd backend
npm run dev
```

### Producción
```bash
cd backend
NODE_ENV=production npm start
```

## Verificación de Seguridad

### Comprobar que los archivos estáticos se sirven correctamente:
```bash
curl -I http://tu-dominio.com/js/main.js
curl -I http://tu-dominio.com/resources/style.css
```

### Verificar que los archivos sensibles están protegidos:
```bash
curl -I http://tu-dominio.com/.env  # Debe devolver 403
curl -I http://tu-dominio.com/backend/  # Debe devolver 403
```

### Comprobar headers de seguridad:
```bash
curl -I http://tu-dominio.com/
```

## Monitoreo y Logs

Los logs de NGINX se guardan en:
- Access log: `/var/log/nginx/blog_access.log`
- Error log: `/var/log/nginx/blog_error.log`

Para monitorear en tiempo real:
```bash
sudo tail -f /var/log/nginx/blog_access.log
sudo tail -f /var/log/nginx/blog_error.log
```

## Consideraciones Adicionales

1. **Firewall**: Configurar para permitir solo puertos 80 y 443
2. **SSL/TLS**: Usar Let's Encrypt para certificados gratuitos
3. **Backup**: Configurar backup automático de la base de datos SQLite
4. **Monitoreo**: Implementar monitoreo de salud del servicio

## Solución de Problemas

### Si los archivos JavaScript no cargan:
1. Verificar que el servidor Node.js esté ejecutándose en el puerto 3000
2. Comprobar los logs de NGINX
3. Verificar que las rutas en los archivos HTML sean correctas (`/js/main.js`)

### Si hay errores 403:
1. Verificar permisos de archivos
2. Comprobar configuración de NGINX
3. Revisar logs de error de NGINX