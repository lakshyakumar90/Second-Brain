# Second Brain

A modern, intelligent knowledge management system that helps you organize, search, and discover insights from your personal knowledge base.

## 🚀 Features

- **Smart Organization**: AI-powered categorization and tagging
- **Intelligent Search**: Semantic search across all your content
- **Real-time Collaboration**: Work together with team members
- **File Management**: Support for multiple file types with cloud storage
- **Analytics**: Track your knowledge patterns and usage
- **Responsive Design**: Modern UI that works on all devices

## 🏗️ Project Structure

```
Second Brain/
├── backend/          # Node.js + Express API server
├── frontend/         # React + TypeScript frontend
└── README.md         # This file
```

## 🛠️ Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Second Brain"
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Setup Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 🤝 GitHub Collaboration Workflow

### Branch Strategy

We use a feature branch workflow with separate development branches for frontend and backend:

- `main` - Production ready code
- `frontend-dev` - Frontend development branch
- `backend-dev` - Backend development branch
- `feature/*` - Feature branches

### Workflow Steps

#### For Frontend Changes:

1. **Create and switch to a feature branch from frontend-dev**
   ```bash
   git checkout frontend-dev
   git pull origin frontend-dev
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes and commit**
   ```bash
   # Make your changes in the frontend/ directory
   git add .
   git commit -m "feat: add your feature description"
   ```

3. **Push your feature branch**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request**
   - Go to GitHub and create a PR from `feature/your-feature-name` to `frontend-dev`
   - Add a clear description of your changes
   - Request review from team members

5. **After PR approval and merge**
   ```bash
   git checkout frontend-dev
   git pull origin frontend-dev
   git branch -d feature/your-feature-name
   ```

#### For Backend Changes:

1. **Create and switch to a feature branch from backend-dev**
   ```bash
   git checkout backend-dev
   git pull origin backend-dev
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes and commit**
   ```bash
   # Make your changes in the backend/ directory
   git add .
   git commit -m "feat: add your feature description"
   ```

3. **Push your feature branch**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request**
   - Go to GitHub and create a PR from `feature/your-feature-name` to `backend-dev`
   - Add a clear description of your changes
   - Request review from team members

5. **After PR approval and merge**
   ```bash
   git checkout backend-dev
   git pull origin backend-dev
   git branch -d feature/your-feature-name
   ```

#### For Full-Stack Features:

1. **Create separate feature branches for frontend and backend**
   ```bash
   # For backend changes
   git checkout backend-dev
   git checkout -b feature/your-feature-name-backend
   
   # For frontend changes
   git checkout frontend-dev
   git checkout -b feature/your-feature-name-frontend
   ```

2. **Create separate PRs** for each part and link them in the descriptions

### Commit Message Guidelines

Use conventional commits for better changelog generation:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```bash
git commit -m "feat: add user authentication system"
git commit -m "fix: resolve search pagination issue"
git commit -m "docs: update API documentation"
```

### Code Review Guidelines

- **Frontend PRs**: Focus on UI/UX, React best practices, TypeScript usage
- **Backend PRs**: Focus on API design, database operations, security
- **All PRs**: Check for proper error handling, testing, and documentation

## 📚 Documentation

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)

## 🤝 Contributing

1. Fork the repository
2. Follow the branch strategy outlined above
3. Make your changes
4. Submit a pull request with a clear description

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the documentation in respective folders
2. Search existing issues on GitHub
3. Create a new issue with detailed information

## 🔧 Environment Variables

Each component requires specific environment variables. Check the respective `.env.example` files:

- Backend: `backend/.env.example`
- Frontend: `frontend/.env.example` 