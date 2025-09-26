import bcrypt from 'bcrypt';
import db from '../config/database.js';

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.display_name = data.display_name;
    this.bio = data.bio;
    this.avatar = data.avatar;
    this.role = data.role;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Método estático para encontrar usuario por ID
  static async findById(id) {
    try {
      const userData = await db('users')
        .where('id', id)
        .first();
      
      return userData ? new User(userData) : null;
    } catch (error) {
      throw new Error(`Error al buscar usuario por ID: ${error.message}`);
    }
  }

  // Método estático para encontrar usuario por username
  static async findByUsername(username) {
    try {
      const userData = await db('users')
        .where('username', username)
        .first();
      
      return userData ? new User(userData) : null;
    } catch (error) {
      throw new Error(`Error al buscar usuario por username: ${error.message}`);
    }
  }

  // Método estático para encontrar usuario por email
  static async findByEmail(email) {
    try {
      const userData = await db('users')
        .where('email', email)
        .first();
      
      return userData ? new User(userData) : null;
    } catch (error) {
      throw new Error(`Error al buscar usuario por email: ${error.message}`);
    }
  }

  // Método estático para autenticar usuario
  static async authenticate(usernameOrEmail, password) {
    try {
      // Buscar usuario por username o email
      const userData = await db('users')
        .where('username', usernameOrEmail)
        .orWhere('email', usernameOrEmail)
        .where('is_active', true)
        .first();

      if (!userData) {
        return null; // Usuario no encontrado
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, userData.password_hash);
      
      if (!isValidPassword) {
        return null; // Contraseña incorrecta
      }

      // Actualizar último acceso
      await db('users')
        .where('id', userData.id)
        .update({ updated_at: new Date() });

      return new User(userData);
    } catch (error) {
      throw new Error(`Error en autenticación: ${error.message}`);
    }
  }

  // Método estático para crear nuevo usuario
  static async create(userData) {
    try {
      // Validar datos requeridos
      if (!userData.username || !userData.email || !userData.password) {
        throw new Error('Username, email y password son requeridos');
      }

      // Verificar que no exista usuario con mismo username o email
      const existingUser = await db('users')
        .where('username', userData.username)
        .orWhere('email', userData.email)
        .first();

      if (existingUser) {
        throw new Error('Ya existe un usuario con ese username o email');
      }

      // Encriptar contraseña
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(userData.password, saltRounds);

      // Crear usuario
      const [userId] = await db('users').insert({
        username: userData.username,
        email: userData.email,
        password_hash,
        display_name: userData.display_name || userData.username,
        bio: userData.bio || null,
        avatar: userData.avatar || null,
        role: userData.role || 'author',
        is_active: userData.is_active !== undefined ? userData.is_active : true,
        created_at: new Date(),
        updated_at: new Date()
      });

      return await User.findById(userId);
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  // Método para verificar contraseña
  async verifyPassword(password) {
    try {
      return await bcrypt.compare(password, this.password_hash);
    } catch (error) {
      throw new Error(`Error al verificar contraseña: ${error.message}`);
    }
  }

  // Método para actualizar contraseña
  async updatePassword(newPassword) {
    try {
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(newPassword, saltRounds);
      
      await db('users')
        .where('id', this.id)
        .update({ 
          password_hash,
          updated_at: new Date()
        });

      this.password_hash = password_hash;
      this.updated_at = new Date();
      
      return true;
    } catch (error) {
      throw new Error(`Error al actualizar contraseña: ${error.message}`);
    }
  }

  // Método para actualizar perfil
  async updateProfile(profileData) {
    try {
      const allowedFields = ['display_name', 'bio', 'avatar'];
      const updateData = {};
      
      // Solo actualizar campos permitidos
      allowedFields.forEach(field => {
        if (profileData[field] !== undefined) {
          updateData[field] = profileData[field];
        }
      });

      if (Object.keys(updateData).length === 0) {
        throw new Error('No hay datos válidos para actualizar');
      }

      updateData.updated_at = new Date();

      await db('users')
        .where('id', this.id)
        .update(updateData);

      // Actualizar propiedades del objeto
      Object.keys(updateData).forEach(key => {
        this[key] = updateData[key];
      });

      return true;
    } catch (error) {
      throw new Error(`Error al actualizar perfil: ${error.message}`);
    }
  }

  // Método para desactivar usuario
  async deactivate() {
    try {
      await db('users')
        .where('id', this.id)
        .update({ 
          is_active: false,
          updated_at: new Date()
        });

      this.is_active = false;
      this.updated_at = new Date();
      
      return true;
    } catch (error) {
      throw new Error(`Error al desactivar usuario: ${error.message}`);
    }
  }

  // Método para verificar permisos
  hasPermission(permission) {
    const permissions = {
      admin: ['create_posts', 'edit_posts', 'delete_posts', 'publish_posts', 'manage_users'],
      editor: ['create_posts', 'edit_posts', 'delete_posts', 'publish_posts'],
      author: ['create_posts', 'edit_own_posts']
    };

    return permissions[this.role]?.includes(permission) || false;
  }

  // Método para verificar si puede editar un post específico
  canEditPost(post) {
    if (this.role === 'admin' || this.role === 'editor') {
      return true;
    }
    
    if (this.role === 'author' && post.author_id === this.id) {
      return true;
    }
    
    return false;
  }

  // Método para obtener datos públicos del usuario
  toPublicJSON() {
    return {
      id: this.id,
      username: this.username,
      display_name: this.display_name,
      bio: this.bio,
      avatar: this.avatar,
      role: this.role,
      created_at: this.created_at
    };
  }

  // Método para obtener datos de sesión
  toSessionJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      display_name: this.display_name,
      role: this.role,
      is_active: this.is_active
    };
  }

  // Método estático para obtener todos los usuarios (con paginación)
  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        role = null,
        is_active = null,
        search = null
      } = options;

      const offset = (page - 1) * limit;
      let query = db('users').select('*');

      // Aplicar filtros
      if (role) {
        query = query.where('role', role);
      }

      if (is_active !== null) {
        query = query.where('is_active', is_active);
      }

      if (search) {
        query = query.where(function() {
          this.where('username', 'like', `%${search}%`)
              .orWhere('email', 'like', `%${search}%`)
              .orWhere('display_name', 'like', `%${search}%`);
        });
      }

      const users = await query
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);

      return users.map(userData => new User(userData));
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }

  // Método estático para contar usuarios
  static async count(options = {}) {
    try {
      const { role = null, is_active = null, search = null } = options;
      
      let query = db('users').count('* as count');

      if (role) {
        query = query.where('role', role);
      }

      if (is_active !== null) {
        query = query.where('is_active', is_active);
      }

      if (search) {
        query = query.where(function() {
          this.where('username', 'like', `%${search}%`)
              .orWhere('email', 'like', `%${search}%`)
              .orWhere('display_name', 'like', `%${search}%`);
        });
      }

      const result = await query.first();
      return parseInt(result.count);
    } catch (error) {
      throw new Error(`Error al contar usuarios: ${error.message}`);
    }
  }
}

export default User;