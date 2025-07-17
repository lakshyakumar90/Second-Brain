# Second Brain - Backend API

A robust Node.js + Express API server with TypeScript, MongoDB, and AI integration for the Second Brain knowledge management system.

## 🏗️ Architecture

```
backend/src/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── database/         # Database connection
├── middlewares/      # Express middlewares
├── models/          # Mongoose models and interfaces
├── routes/          # API route definitions
├── services/        # Business logic services
├── utils/           # Utility functions
├── validations/     # Zod validation schemas
└── index.ts         # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- TypeScript knowledge

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see Configuration section below)

5. **Start development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000` (or your configured PORT).

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure the following:

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MongoDB connection string | `mongodb://localhost:27017/second-brain` |
| `JWT_ACCESS_SECRET` | Secret key for JWT tokens | `your-super-secret-key` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-api-secret` |
| `EMAIL_USER` | Gmail address for sending emails | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | Gmail app password | `your-app-password` |
| `GEMINI_API_KEY` | Google Gemini AI API key | `your-gemini-key` |

#### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `GEMINI_API_ENDPOINT` | Gemini API endpoint | `https://generativelanguage.googleapis.com/v1beta/models` |

### External Service Setup

#### 1. MongoDB Setup
- **Local**: Install MongoDB locally
- **Cloud**: Create a MongoDB Atlas cluster and get connection string

#### 2. Cloudinary Setup (File Storage)
1. Create account at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and API secret from dashboard

#### 3. Gmail Setup (Email Service)
1. Enable 2-factor authentication on your Google account
2. Generate an app password for Gmail
3. Use the app password in `EMAIL_PASSWORD`

#### 4. Google Gemini AI Setup
1. Visit [Google AI Studio](https://makersuite.google.com/)
2. Create an API key for Gemini
3. Add the key to `GEMINI_API_KEY`

## 📊 Database Models

### Core Models

- **User**: User accounts and authentication
- **Item**: Knowledge items (notes, files, etc.)
- **Category**: Organization categories
- **Workspace**: User workspaces
- **Comment**: Comments on items
- **Share**: Sharing configurations
- **Notification**: User notifications
- **Activity**: User activity tracking
- **Collaboration**: Real-time collaboration data
- **Whiteboard**: Digital whiteboard data
- **AIChat**: AI conversation history
- **AIUsage**: AI usage tracking

## 🛣️ API Routes

### Authentication
- `POST /api/auth/register-step1` - User registration (step 1)
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/register-step2` - Complete registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/upload-avatar` - Upload user avatar

### Items
- `GET /api/items` - Get user items (paginated)
- `POST /api/items` - Create new item
- `GET /api/items/:id` - Get specific item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Soft delete item

### Categories
- `GET /api/categories` - Get user categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### AI Features
- `POST /api/ai/summarize` - Summarize content
- `POST /api/ai/suggest-tags` - AI tag suggestions
- `POST /api/ai/categorize` - AI categorization
- `POST /api/ai/chat` - AI chat conversation

### Search
- `GET /api/search` - Search items and content

### Workspaces
- `GET /api/workspaces` - Get user workspaces
- `POST /api/workspaces` - Create workspace
- `PUT /api/workspaces/:id` - Update workspace

## 🔧 Services

### AI Service (`aiService.ts`)
- Content summarization
- Tag suggestion
- Text extraction from files
- AI-powered categorization

### Cleanup Service (`cleanupService.ts`)
- Automated cleanup of soft-deleted items
- Runs daily to permanently delete items older than 1 day

### Email Service (`emailService.ts`)
- OTP email sending
- Password reset emails
- Notification emails

### Cloudinary Service (`cloudinaryService.ts`)
- File upload handling
- Image optimization
- Video processing

### Collaboration Service (`collaborationService.ts`)
- Real-time collaboration via Socket.IO
- Document synchronization
- User presence tracking

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: BCrypt password encryption
- **Input Validation**: Zod schema validation
- **CORS Protection**: Configurable CORS settings
- **Rate Limiting**: API rate limiting (planned)
- **File Upload Security**: File type and size validation

## 🧹 Cleanup System

The system includes an automated cleanup service that:
- Runs every 24 hours
- Permanently deletes soft-deleted items older than 1 day
- Frees up storage space
- Maintains database performance

## 📝 Development

### Code Structure

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and external API interactions
- **Models**: Database schemas and data validation
- **Middlewares**: Request processing (auth, upload, etc.)
- **Validations**: Input validation schemas

### Adding New Features

1. **Create model** (if needed) in `models/`
2. **Add validation schema** in `validations/`
3. **Create controller** in `controllers/`
4. **Define routes** in `routes/`
5. **Add to main app** in `index.ts`

### Testing

```bash
# Run tests (when available)
npm test

# Run with coverage
npm run test:coverage
```

## 🐛 Debugging

### Common Issues

1. **Database Connection**: Check MongoDB URL and network access
2. **Cloudinary Errors**: Verify API credentials and file formats
3. **Email Issues**: Check Gmail app password and 2FA settings
4. **JWT Errors**: Verify JWT secret is set and consistent

### Logging

The application includes comprehensive console logging:
- ✅ Success operations
- ❌ Error operations
- 🚀 Server startup
- 🧹 Cleanup operations

## 📚 Dependencies

### Core Dependencies
- **Express**: Web framework
- **Mongoose**: MongoDB ODM
- **TypeScript**: Type safety
- **Zod**: Runtime validation
- **Socket.IO**: Real-time communication

### Authentication & Security
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT tokens
- **cookie-parser**: Cookie handling

### File & AI Services
- **cloudinary**: File storage
- **multer**: File uploads
- **nodemailer**: Email service
- **axios**: HTTP client for AI APIs

## 🔄 API Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": {...},
  "status": 200
}
```

### Error Response
```json
{
  "message": "Error description",
  "error": "Detailed error info",
  "status": 400
}
```

## 🚀 Deployment

### Production Environment

1. Set `NODE_ENV=production`
2. Use production MongoDB cluster
3. Configure production Cloudinary account
4. Set secure JWT secret
5. Enable HTTPS
6. Set up process manager (PM2)

### Environment-Specific Settings

- **Development**: Detailed logging, CORS enabled
- **Production**: Optimized logging, security headers, HTTPS cookies

## 📞 Support

For backend-specific issues:
1. Check server logs
2. Verify environment variables
3. Test database connectivity
4. Check external service credentials 