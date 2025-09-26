import db from '../config/database.js';

class Post {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.slug = data.slug;
    this.content = data.content;
    this.excerpt = data.excerpt;
    this.featured_image = data.featured_image;
    this.category = data.category;
    this.tags = data.tags;
    this.status = data.status;
    this.view_count = data.view_count;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new post
  static async create(postData) {
    try {
      const [id] = await db('posts').insert({
        ...postData,
        created_at: new Date(),
        updated_at: new Date()
      });
      return Post.findById(id);
    } catch (error) {
      throw new Error(`Error creating post: ${error.message}`);
    }
  }

  // Find post by ID
  static async findById(id) {
    try {
      const post = await db('posts').where({ id }).first();
      return post ? new Post(post) : null;
    } catch (error) {
      throw new Error(`Error finding post: ${error.message}`);
    }
  }

  // Find post by slug
  static async findBySlug(slug) {
    try {
      const post = await db('posts').where({ slug }).first();
      return post ? new Post(post) : null;
    } catch (error) {
      throw new Error(`Error finding post by slug: ${error.message}`);
    }
  }

  // Get all posts with optional filtering
  static async findAll(options = {}) {
    try {
      const { 
        status = 'published', 
        category = null, 
        limit = 10, 
        offset = 0,
        search = null 
      } = options;

      let query = db('posts')
        .where('status', status)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);

      if (category) {
        query = query.where('category', category);
      }

      if (search) {
        query = query.where(function() {
          this.where('title', 'like', `%${search}%`)
            .orWhere('content', 'like', `%${search}%`)
            .orWhere('excerpt', 'like', `%${search}%`);
        });
      }

      const posts = await query;
      return posts.map(post => new Post(post));
    } catch (error) {
      throw new Error(`Error finding posts: ${error.message}`);
    }
  }

  // Get posts count for pagination
  static async count(options = {}) {
    try {
      const { status = 'published', category = null, search = null } = options;
      
      let query = db('posts').where('status', status);

      if (category) {
        query = query.where('category', category);
      }

      if (search) {
        query = query.where(function() {
          this.where('title', 'like', `%${search}%`)
            .orWhere('content', 'like', `%${search}%`)
            .orWhere('excerpt', 'like', `%${search}%`);
        });
      }

      const result = await query.count('* as count').first();
      return result.count;
    } catch (error) {
      throw new Error(`Error counting posts: ${error.message}`);
    }
  }

  // Update post
  static async update(id, postData) {
    try {
      await db('posts')
        .where({ id })
        .update({
          ...postData,
          updated_at: new Date()
        });
      return Post.findById(id);
    } catch (error) {
      throw new Error(`Error updating post: ${error.message}`);
    }
  }

  // Delete post
  static async delete(id) {
    try {
      const result = await db('posts').where({ id }).del();
      return result > 0;
    } catch (error) {
      throw new Error(`Error deleting post: ${error.message}`);
    }
  }

  // Increment view count
  static async incrementViewCount(id) {
    try {
      await db('posts')
        .where({ id })
        .increment('view_count', 1);
    } catch (error) {
      console.error(`Error incrementing view count: ${error.message}`);
    }
  }

  // Get categories
  static async getCategories() {
    try {
      const categories = await db('posts')
        .distinct('category')
        .whereNotNull('category')
        .where('category', '!=', '');
      
      return categories.map(cat => cat.category);
    } catch (error) {
      throw new Error(`Error getting categories: ${error.message}`);
    }
  }

  // Get popular posts
  static async getPopular(limit = 5) {
    try {
      const posts = await db('posts')
        .where('status', 'published')
        .orderBy('view_count', 'desc')
        .limit(limit);
      
      return posts.map(post => new Post(post));
    } catch (error) {
      throw new Error(`Error getting popular posts: ${error.message}`);
    }
  }

  // Convert to JSON (for API responses)
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      slug: this.slug,
      content: this.content,
      excerpt: this.excerpt,
      featured_image: this.featured_image,
      category: this.category,
      tags: this.tags ? this.tags.split(',').map(tag => tag.trim()) : [],
      status: this.status,
      view_count: this.view_count,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

export default Post;