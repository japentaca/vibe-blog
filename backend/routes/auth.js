import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { requireAuth, requireGuest, logUserActivity } from '../middleware/auth.js';

const router = express.Router();

// Validaciones para login
const loginValidation = [
  body('usernameOrEmail')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Username o email es requerido'),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Contraseña es requerida')
];

// Validaciones para cambio de contraseña
const changePasswordValidation = [
  body('currentPassword')
    .isLength({ min: 1 })
    .withMessage('Contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];

// POST /api/auth/login - Iniciar sesión
router.post('/login', requireGuest, loginValidation, async (req, res, next) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { usernameOrEmail, password, rememberMe = false } = req.body;

    // Intentar autenticar usuario
    const user = await User.authenticate(usernameOrEmail, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Crear sesión
    req.session.userId = user.id;
    req.session.username = user.username;
    
    // Configurar duración de la sesión
    if (rememberMe) {
      // Sesión de 30 días si "recordarme" está marcado
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    } else {
      // Sesión de 24 horas por defecto
      req.session.cookie.maxAge = 24 * 60 * 60 * 1000;
    }

    console.log(`[${new Date().toISOString()}] Usuario ${user.username} inició sesión`);

    res.json({
      success: true,
      message: 'Sesión iniciada correctamente',
      user: user.toSessionJSON()
    });

  } catch (error) {
    console.error('Error en login:', error);
    next(error);
  }
});

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', requireAuth, logUserActivity('logout'), async (req, res, next) => {
  try {
    const username = req.user.username;
    
    // Destruir sesión
    req.session.destroy((err) => {
      if (err) {
        console.error('Error al destruir sesión:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al cerrar sesión'
        });
      }

      // Limpiar cookie de sesión
      res.clearCookie('connect.sid');
      
      console.log(`[${new Date().toISOString()}] Usuario ${username} cerró sesión`);

      res.json({
        success: true,
        message: 'Sesión cerrada correctamente'
      });
    });

  } catch (error) {
    console.error('Error en logout:', error);
    next(error);
  }
});

// GET /api/auth/me - Obtener información del usuario actual
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user.toSessionJSON()
    });
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    next(error);
  }
});

// GET /api/auth/check - Verificar si hay sesión activa
router.get('/check', async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.json({
        success: true,
        authenticated: false,
        user: null
      });
    }

    // Verificar que el usuario aún existe y está activo
    const user = await User.findById(req.session.userId);
    
    if (!user || !user.is_active) {
      // Limpiar sesión inválida
      req.session.destroy();
      return res.json({
        success: true,
        authenticated: false,
        user: null
      });
    }

    res.json({
      success: true,
      authenticated: true,
      user: user.toSessionJSON()
    });

  } catch (error) {
    console.error('Error al verificar sesión:', error);
    next(error);
  }
});

// PUT /api/auth/change-password - Cambiar contraseña
router.put('/change-password', requireAuth, changePasswordValidation, logUserActivity('cambio de contraseña'), async (req, res, next) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Verificar contraseña actual
    const isCurrentPasswordValid = await req.user.verifyPassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

    // Actualizar contraseña
    await req.user.updatePassword(newPassword);

    console.log(`[${new Date().toISOString()}] Usuario ${req.user.username} cambió su contraseña`);

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    next(error);
  }
});

// PUT /api/auth/profile - Actualizar perfil
router.put('/profile', requireAuth, logUserActivity('actualización de perfil'), async (req, res, next) => {
  try {
    const { display_name, bio, avatar } = req.body;

    // Validar datos
    if (display_name && display_name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El nombre para mostrar no puede estar vacío'
      });
    }

    if (display_name && display_name.length > 150) {
      return res.status(400).json({
        success: false,
        message: 'El nombre para mostrar no puede exceder 150 caracteres'
      });
    }

    if (bio && bio.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'La biografía no puede exceder 1000 caracteres'
      });
    }

    // Actualizar perfil
    await req.user.updateProfile({
      display_name: display_name?.trim(),
      bio: bio?.trim(),
      avatar: avatar?.trim()
    });

    console.log(`[${new Date().toISOString()}] Usuario ${req.user.username} actualizó su perfil`);

    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      user: req.user.toSessionJSON()
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    next(error);
  }
});

// GET /api/auth/session-info - Información detallada de la sesión
router.get('/session-info', requireAuth, async (req, res, next) => {
  try {
    const sessionInfo = {
      sessionId: req.sessionID,
      userId: req.session.userId,
      username: req.session.username,
      createdAt: req.session.cookie.originalMaxAge ? 
        new Date(Date.now() - req.session.cookie.originalMaxAge + req.session.cookie.maxAge) : 
        null,
      expiresAt: req.session.cookie.expires || 
        new Date(Date.now() + req.session.cookie.maxAge),
      maxAge: req.session.cookie.maxAge,
      secure: req.session.cookie.secure,
      httpOnly: req.session.cookie.httpOnly
    };

    res.json({
      success: true,
      session: sessionInfo,
      user: req.user.toSessionJSON()
    });

  } catch (error) {
    console.error('Error al obtener información de sesión:', error);
    next(error);
  }
});

// POST /api/auth/refresh-session - Renovar sesión
router.post('/refresh-session', requireAuth, async (req, res, next) => {
  try {
    // Renovar la sesión extendiendo su tiempo de vida
    req.session.touch();
    
    res.json({
      success: true,
      message: 'Sesión renovada correctamente',
      expiresAt: new Date(Date.now() + req.session.cookie.maxAge)
    });

  } catch (error) {
    console.error('Error al renovar sesión:', error);
    next(error);
  }
});

export default router;