import User from '../models/User.js';

// Middleware para verificar si el usuario está autenticado
export const requireAuth = async (req, res, next) => {
  try {
    console.log('🔐 requireAuth: Iniciando verificación de autenticación');
    console.log('🔐 requireAuth: Session:', req.session ? 'exists' : 'missing');
    console.log('🔐 requireAuth: UserId:', req.session?.userId);
    
    // Verificar si existe una sesión activa
    if (!req.session || !req.session.userId) {
      console.log('🔐 requireAuth: No hay sesión activa');
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Debes iniciar sesión.'
      });
    }

    console.log('🔐 requireAuth: Buscando usuario en BD...');
    // Buscar el usuario en la base de datos
    const user = await User.findById(req.session.userId);
    console.log('🔐 requireAuth: Usuario encontrado:', user ? 'sí' : 'no');
    
    if (!user) {
      // Usuario no encontrado, limpiar sesión
      req.session.destroy();
      return res.status(401).json({
        success: false,
        message: 'Usuario no válido. Inicia sesión nuevamente.'
      });
    }

    if (!user.is_active) {
      // Usuario desactivado, limpiar sesión
      req.session.destroy();
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada. Contacta al administrador.'
      });
    }

    // Agregar usuario a la request para uso posterior
    req.user = user;
    console.log('🔐 requireAuth: Usuario agregado a req.user, llamando next()');
    next();
  } catch (error) {
    console.error('🔐 requireAuth: Error en middleware de autenticación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para verificar roles específicos
export const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Primero verificar autenticación
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Acceso denegado. Debes iniciar sesión.'
        });
      }

      // Verificar si el rol del usuario está permitido
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. No tienes permisos suficientes.'
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de roles:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

// Middleware para verificar permisos específicos
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      console.log(`🔑 requirePermission: Verificando permiso '${permission}'`);
      console.log('🔑 requirePermission: Usuario:', req.user?.username);
      console.log('🔑 requirePermission: Rol del usuario:', req.user?.role);
      
      // Primero verificar autenticación
      if (!req.user) {
        console.log('🔑 requirePermission: Usuario no autenticado');
        return res.status(401).json({
          success: false,
          message: 'Acceso denegado. Debes iniciar sesión.'
        });
      }

      console.log('🔑 requirePermission: Verificando si el usuario tiene el permiso...');
      // Verificar si el usuario tiene el permiso
      if (!req.user.hasPermission(permission)) {
        console.log('🔑 requirePermission: Usuario no tiene el permiso');
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. No tienes permisos para esta acción.'
        });
      }

      console.log('🔑 requirePermission: Permiso verificado, llamando next()');
      next();
    } catch (error) {
      console.error('Error en middleware de permisos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

// Middleware para verificar si el usuario puede editar un post específico
export const requirePostEditPermission = async (req, res, next) => {
  try {
    // Primero verificar autenticación
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Debes iniciar sesión.'
      });
    }

    // Si es admin o editor, puede editar cualquier post
    if (req.user.role === 'admin' || req.user.role === 'editor') {
      return next();
    }

    // Si es author, solo puede editar sus propios posts
    if (req.user.role === 'author') {
      // Necesitamos obtener el post para verificar la propiedad
      const postId = req.params.id;
      
      if (!postId) {
        return res.status(400).json({
          success: false,
          message: 'ID de post requerido'
        });
      }

      // Importar modelo Post dinámicamente para evitar dependencias circulares
      const { default: Post } = await import('../models/Post.js');
      const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post no encontrado'
        });
      }

      if (post.author_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Solo puedes editar tus propios posts'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Error en middleware de edición de posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware opcional de autenticación (no bloquea si no está autenticado)
export const optionalAuth = async (req, res, next) => {
  try {
    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId);
      
      if (user && user.is_active) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    console.error('Error en middleware de autenticación opcional:', error);
    // No bloquear la request, solo continuar sin usuario
    next();
  }
};

// Middleware para verificar si ya está autenticado (para rutas como login)
export const requireGuest = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.status(400).json({
      success: false,
      message: 'Ya tienes una sesión activa'
    });
  }
  
  next();
};

// Middleware para logging de actividad de usuarios autenticados
export const logUserActivity = (action) => {
  return (req, res, next) => {
    console.log('📊 logUserActivity: Iniciando log de actividad');
    if (req.user) {
      console.log(`📊 [${new Date().toISOString()}] Usuario ${req.user.username} (${req.user.role}) realizó: ${action || 'acción no especificada'}`);
    } else {
      console.log('📊 logUserActivity: No hay usuario en req.user');
    }
    console.log('📊 logUserActivity: Llamando next()');
    next();
  };
};