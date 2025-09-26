# Editorial Blog Platform

A sophisticated, minimalist blog platform built with Node.js, Express, Knex ORM, and SQLite. Features a beautiful editorial-inspired design with a rich text editor and full CRUD functionality.

## ✨ Features

### 🎨 Design & User Experience
- **Minimalist Editorial Design**: Inspired by publications like Kinfolk and The Gentlewoman
- **Responsive Layout**: Perfect experience on all devices
- **Typography-First**: Canela Bold headlines with Suisse Int'l body text
- **Sophisticated Color Palette**: Charcoal, sage green, and muted gold accents
- **Smooth Animations**: Powered by Anime.js for delightful interactions

### ✍️ Content Creation
- **Rich Text Editor**: Full-featured Quill.js editor with formatting options
- **Auto-Save**: Never lose your work with automatic draft saving
- **Image Upload**: Drag-and-drop image upload with preview
- **Live Statistics**: Word count and reading time estimation
- **SEO Optimization**: Custom excerpts, categories, and tags

### 📖 Reading Experience
- **Clean Reading Interface**: Distraction-free post viewing
- **Reading Progress**: Visual progress indicator for long articles
- **Social Sharing**: Easy sharing to Twitter, Facebook, and LinkedIn
- **Related Posts**: Discover more content automatically
- **Search & Filter**: Find content by category or keyword

### 🔧 Technical Features
- **Node.js Backend**: Fast and scalable server architecture
- **Knex ORM**: Clean database abstraction with migrations
- **SQLite Database**: Lightweight, file-based database
- **RESTful API**: Clean API design for all CRUD operations
- **File Upload**: Multer-based image upload handling

## 🏗️ Architecture

### Backend Structure
```
backend/
├── server.js          # Express server setup
├── config/
│   └── database.js    # Database configuration
├── migrations/        # Database migrations
├── models/
│   └── Post.js       # Post model with Knex queries
├── routes/
│   ├── posts.js      # Blog post API routes
│   └── upload.js     # Image upload handling
├── middleware/
│   └── errorHandler.js # Error handling middleware
└── package.json      # Backend dependencies
```

### Frontend Structure
```
frontend/
├── index.html        # Blog homepage with post feed
├── post.html         # Individual blog post view
├── editor.html       # Rich text editor interface
├── about.html        # About page
├── main.js           # Shared JavaScript functionality
└── resources/        # Images and assets
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project**
   ```bash
   cd editorial-blog-platform
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up the database**
   ```bash
   npx knex migrate:latest
   npx knex seed:run
   ```

4. **Start the server**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Access the platform**
   - Homepage: http://localhost:3000
   - Editor: http://localhost:3000/frontend/editor.html
   - About: http://localhost:3000/frontend/about.html
   - API Health: http://localhost:3000/api/health

### Alternative Startup
Run the included startup script:
```bash
./start.sh
```

## 📖 Usage Guide

### Creating Your First Post

1. **Navigate to the Editor**
   - Click "Editor" in the navigation menu
   - Or go directly to `/frontend/editor.html`

2. **Write Your Content**
   - Enter a compelling title
   - Use the rich text editor to format your content
   - Add images using the drag-and-drop upload

3. **Configure Post Settings**
   - Select a category for your post
   - Add relevant tags (comma-separated)
   - Write a compelling excerpt for SEO

4. **Publish Your Post**
   - Click "Save Draft" to save your work
   - Click "Publish" to make it live
   - Use "Preview" to see how it looks

### Managing Content

- **View Posts**: Browse the homepage to see all published posts
- **Read Posts**: Click on any post to read the full content
- **Search**: Use the search bar to find specific content
- **Filter**: Use category filters to browse by topic

### Customization

The platform is built to be easily customizable:

- **Colors**: Modify CSS custom properties in the HTML files
- **Fonts**: Update the font imports and CSS font families
- **Layout**: Adjust the CSS grid and flexbox layouts
- **Features**: Extend the API and frontend functionality

## 🎨 Design System

### Colors
- **Charcoal**: #2C2C2C (primary text)
- **Warm White**: #FEFEFE (background)
- **Sage Green**: #8B9A7A (accent, links)
- **Soft Gray**: #F8F8F8 (section backgrounds)
- **Muted Gold**: #D4B896 (highlights, hover)
- **Cream**: #FDFCF8 (alternative background)

### Typography
- **Display Font**: Canela Bold (headlines, featured titles)
- **Body Font**: Suisse Int'l (body text, UI elements)

### Visual Effects
- **Anime.js**: Smooth animations and transitions
- **Typed.js**: Typewriter effects for hero text
- **Splitting.js**: Text animation effects
- **Quill.js**: Rich text editor

## 🔌 API Endpoints

### Posts
- `GET /api/posts` - Get all posts (with pagination, filtering)
- `GET /api/posts/:id` - Get single post by ID
- `GET /api/posts/slug/:slug` - Get post by slug
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update existing post
- `DELETE /api/posts/:id` - Delete post

### Metadata
- `GET /api/posts/meta/categories` - Get all categories
- `GET /api/posts/meta/popular` - Get popular posts

### Upload
- `POST /api/upload` - Upload image file

### Health
- `GET /api/health` - API health check

## 🗄️ Database Schema

### Posts Table
```sql
CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image VARCHAR(500),
    category VARCHAR(100),
    tags TEXT,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🛠️ Development

### Adding New Features

1. **Backend Changes**
   - Update the database schema with new migrations
   - Modify the Post model to include new functionality
   - Add new API endpoints in the routes folder
   - Update validation and error handling

2. **Frontend Changes**
   - Update HTML files to include new UI elements
   - Add new JavaScript functionality in main.js
   - Modify CSS for styling and layout
   - Update the editor interface if needed

### Database Migrations

Create a new migration:
```bash
npx knex migrate:make migration_name
```

Run migrations:
```bash
npx knex migrate:latest
```

Rollback migrations:
```bash
npx knex migrate:rollback
```

## 🚀 Deployment

### Production Deployment

1. **Environment Variables**
   ```bash
   NODE_ENV=production
   PORT=3000
   ```

2. **Build and Start**
   ```bash
   cd backend
   npm install --production
   npm start
   ```

3. **Reverse Proxy** (Optional)
   Configure nginx or Apache to serve the application

### Docker Deployment

Create a Dockerfile:
```dockerfile
FROM node:14-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "backend/server.js"]
```

## 📋 Requirements

### Backend Dependencies
- express: ^4.18.2
- knex: ^2.5.1
- sqlite3: ^5.1.6
- cors: ^2.8.5
- helmet: ^7.0.0
- morgan: ^1.10.0
- multer: ^1.4.5-lts.1
- slugify: ^1.6.6
- express-validator: ^7.0.1
- dotenv: ^16.3.1

### Frontend Libraries
- Anime.js: ^3.2.1
- Typed.js: ^2.0.12
- Quill.js: ^1.3.6
- Splitting.js: ^1.0.6

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🙏 Acknowledgments

- Design inspiration from Kinfolk, The Gentlewoman, and other editorial publications
- Typography: Canela and Suisse Int'l font families
- Animation libraries: Anime.js, Typed.js, Splitting.js
- Rich text editing: Quill.js

## 📞 Support

For questions, issues, or contributions, please open an issue or reach out through the project repository.

---

**Editorial Blog Platform** - Crafted with care for thoughtful creators.