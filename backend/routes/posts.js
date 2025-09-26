import express from 'express';
import { body, validationResult } from 'express-validator';
import slugify from 'slugify';
import Post from '../models/Post.js';
import { requireAuth, requirePermission, requirePostEditPermission, optionalAuth, logUserActivity } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const postValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content is required'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
  body('category')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Category must be less than 100 characters'),
  // Middleware para manejar errores de validación
  (req, res, next) => {
    console.log('✅ postValidation: Iniciando validación de datos');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ postValidation: Errores de validación encontrados:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }
    console.log('✅ postValidation: Validación exitosa, llamando next()');
    next();
  }
];

// GET /api/posts - Get all posts
router.get('/', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'published',
      category = null,
      search = null
    } = req.query;

    const offset = (page - 1) * limit;

    const options = {
      status,
      category,
      limit: parseInt(limit),
      offset: parseInt(offset),
      search
    };

    const posts = await Post.findAll(options);
    const totalCount = await Post.count(options);

    res.json({
      success: true,
      data: posts.map(post => post.toJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/posts/:id - Get single post
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count
    await Post.incrementViewCount(id);

    res.json({
      success: true,
      data: post.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/posts/slug/:slug - Get post by slug
router.get('/slug/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const post = await Post.findBySlug(slug);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count
    await Post.incrementViewCount(post.id);

    res.json({
      success: true,
      data: post.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/posts - Create new post
router.post('/', requireAuth, requirePermission('create_posts'), postValidation, logUserActivity('crear post'), async (req, res, next) => {
  try {
    console.log('📝 POST /api/posts: Iniciando creación de post');
    console.log('📝 POST /api/posts: Body recibido:', req.body);
    console.log('📝 POST /api/posts: Usuario:', req.user?.username);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('📝 POST /api/posts: Errores de validación:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    console.log('📝 POST /api/posts: Validación pasada, procesando datos...');

    const { title, content, excerpt, featured_image, category, tags, status } = req.body;

    // Generate slug from title
    const slug = slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()"'!:@]/g
    });

    const postData = {
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 200) + '...',
      featured_image,
      category,
      tags: Array.isArray(tags) ? tags.join(', ') : tags,
      status: status || 'draft',
      author_id: req.user.id
    };

    console.log('📝 POST /api/posts: Datos del post preparados:', postData);
    console.log('📝 POST /api/posts: Creando post en BD...');
    
    const post = await Post.create(postData);
    
    console.log('📝 POST /api/posts: Post creado exitosamente:', post.id);

    res.status(201).json({
      success: true,
      data: post.toJSON(),
      message: 'Post created successfully'
    });
    
    console.log('📝 POST /api/posts: Respuesta enviada al cliente');
  } catch (error) {
    console.error('📝 POST /api/posts: Error:', error);
    next(error);
  }
});

// PUT /api/posts/:id - Update post
router.put('/:id', requireAuth, requirePostEditPermission, postValidation, logUserActivity, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { title, content, excerpt, featured_image, category, tags, status } = req.body;

    // Check if post exists
    const existingPost = await Post.findById(id);
    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const updateData = {
      title,
      content,
      excerpt: excerpt || content.substring(0, 200) + '...',
      featured_image,
      category,
      tags: Array.isArray(tags) ? tags.join(', ') : tags,
      status
    };

    // Generate new slug if title changed
    if (title !== existingPost.title) {
      updateData.slug = slugify(title, {
        lower: true,
        strict: true,
        remove: /[*+~.()"'!:@]/g
      });
    }

    const post = await Post.update(id, updateData);

    res.json({
      success: true,
      data: post.toJSON(),
      message: 'Post updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/posts/:id - Delete post
router.delete('/:id', requireAuth, requirePostEditPermission, logUserActivity, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const success = await Post.delete(id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/posts/categories - Get all categories
router.get('/meta/categories', async (req, res, next) => {
  try {
    const categories = await Post.getCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/posts/popular - Get popular posts
router.get('/meta/popular', async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    const posts = await Post.getPopular(parseInt(limit));
    res.json({
      success: true,
      data: posts.map(post => post.toJSON())
    });
  } catch (error) {
    next(error);
  }
});

export default router;