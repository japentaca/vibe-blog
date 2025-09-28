// Main JavaScript file for Editorial Blog Platform
// Shared functionality across all pages

// API Configuration
const API_BASE_URL = 'http://localhost:3000';

// Utility Functions
const Utils = {
    // Format date for display
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Estimate reading time
    estimateReadingTime: (content) => {
        if (!content) return 0;
        const text = content.replace(/<[^>]*>/g, '');
        const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        return Math.ceil(wordCount / 200); // 200 words per minute
    },

    // Truncate text
    truncateText: (text, maxLength = 150) => {
        if (!text) return '';
        const plainText = text.replace(/<[^>]*>/g, '');
        if (plainText.length <= maxLength) return plainText;
        return plainText.substring(0, maxLength) + '...';
    },

    // Debounce function for search/input
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Show notification
    showNotification: (message, type = 'success', duration = 3000) => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 2rem;
            background: var(--sage-green);
            color: var(--warm-white);
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(44, 44, 44, 0.15);
            z-index: 1001;
            font-size: 0.95rem;
            max-width: 300px;
        `;

        if (type === 'error') {
            notification.style.background = '#e74c3c';
        }

        document.body.appendChild(notification);

        // Remove notification after duration
        setTimeout(() => {
            document.body.removeChild(notification);
        }, duration);
    },

    // Handle API errors
    handleApiError: (error, customMessage = 'Ocurrió un error') => {
        console.error('API Error:', error);
        Utils.showNotification(customMessage, 'error');
    }
};

// API Service
const ApiService = {
    // Get all posts
    getPosts: async (options = {}) => {
        try {
            const {
                page = 1,
                limit = 10,
                status = 'published',
                category = null,
                search = null
            } = options;

            let url = `${API_BASE_URL}/api/posts?status=${status}&page=${page}&limit=${limit}`;
            if (category) url += `&category=${encodeURIComponent(category)}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            Utils.handleApiError(error, 'Error al cargar las publicaciones');
            throw error;
        }
    },

    // Get single post
    getPost: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/posts/${id}`);
            return await response.json();
        } catch (error) {
            Utils.handleApiError(error, 'Error al cargar la publicación');
            throw error;
        }
    },

    // Get post by slug
    getPostBySlug: async (slug) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/posts/slug/${slug}`);
            return await response.json();
        } catch (error) {
            Utils.handleApiError(error, 'Error al cargar la publicación');
            throw error;
        }
    },

    // Create new post
    createPost: async (postData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });
            return await response.json();
        } catch (error) {
            Utils.handleApiError(error, 'Error al crear la publicación');
            throw error;
        }
    },

    // Update post
    updatePost: async (id, postData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });
            return await response.json();
        } catch (error) {
            Utils.handleApiError(error, 'Error al actualizar la publicación');
            throw error;
        }
    },

    // Delete post
    deletePost: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            Utils.handleApiError(error, 'Error al eliminar la publicación');
            throw error;
        }
    },

    // Get categories
    getCategories: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/posts/meta/categories`);
            return await response.json();
        } catch (error) {
            Utils.handleApiError(error, 'Error al cargar las categorías');
            throw error;
        }
    },

    // Upload image
    uploadImage: async (file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/api/upload`, {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (error) {
            Utils.handleApiError(error, 'Error al subir la imagen');
            throw error;
        }
    }
};





// Navigation Service
const NavigationService = {
    init: () => {
        // Navegación básica sin animaciones

        // Highlight active navigation item
        NavigationService.highlightActiveNav();
    },

    highlightActiveNav: () => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-links a');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }
};

// Form Service
const FormService = {
    // Validate email
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Validate required field
    validateRequired: (value) => {
        return value && value.trim().length > 0;
    },

    // Show field error
    showFieldError: (field, message) => {
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.textContent = message;
        } else {
            const error = document.createElement('div');
            error.className = 'field-error';
            error.style.cssText = `
                color: #e74c3c;
                font-size: 0.85rem;
                margin-top: 0.25rem;
            `;
            error.textContent = message;
            field.parentNode.appendChild(error);
        }
        field.style.borderColor = '#e74c3c';
    },

    // Clear field error
    clearFieldError: (field) => {
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
        field.style.borderColor = '';
    },

    // Clear all form errors
    clearFormErrors: (form) => {
        const errorElements = form.querySelectorAll('.field-error');
        errorElements.forEach(error => error.remove());
        
        const fields = form.querySelectorAll('input, textarea, select');
        fields.forEach(field => {
            field.style.borderColor = '';
        });
    }
};

// Initialize services when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation
    NavigationService.init();
});

// Export services for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Utils,
        ApiService,
        NavigationService,
        FormService
    };
}