# kalaaVerse - AI Artisan Marketplace

This is a Next.js project with FastAPI backend - an AI-driven marketplace designed to empower local Indian artisans by improving their digital presence and connecting them with a contemporary audience.

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

* [Node.js](https://nodejs.org/en/) (version 20.x or later)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
* [Python](https://www.python.org/) (version 3.10+ recommended)
* [Docker](https://www.docker.com/) (optional, for containerized deployment)
* [Blender](https://www.blender.org/) (for local AR model generation)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Sameerbeedi/Artisan-Marketplace.git
cd Artisan-Marketplace
```

---

## 🎨 Frontend Setup (Next.js)

### Install Dependencies
```bash
cd frontend
npm install
# or
yarn install
```

### Environment Variables
Create `frontend/.env.local`:
```bash
# Google AI API
GOOGLE_API_KEY=your_google_api_key
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_google_api_key

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Backend URL (change based on deployment)
NEXT_PUBLIC_BACKEND_URL=http://localhost:9079
```

### Development Commands
```bash
# Start development server
npm run dev
# or
yarn dev

# Build for production
npm run build
# or
yarn build

# Start production server
npm start
# or
yarn start

# Run linting
npm run lint
# or
yarn lint
```

### Access Frontend
- Development: http://localhost:3000
- Production: Your Vercel deployment URL

---

## ⚙️ Backend Setup (FastAPI + Python)

### 1. Create Virtual Environment
```bash
# Navigate to project root
cd Artisan-Marketplace

# Create virtual environment
python -m venv venv2

# Activate virtual environment
# Windows:
.\venv2\Scripts\activate
# macOS/Linux:
source venv2/bin/activate
```

### 2. Install Dependencies
```bash
# Install Python packages
pip install -r backend/requirements.txt
```

### 3. Environment Variables
Create `backend/.env.local`:
```bash
# Google AI API
GOOGLE_API_KEY=your_google_api_key

# Firebase Configuration
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_PROJECT_ID=your-project-id

# Backend URL (for Railway/Render deployment)
BACKEND_URL=https://your-backend-deployment-url.com
```

### 4. Backend Development Commands
```bash
# Start development server
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 9079

# Or using the simple server
python backend/simple_server.py

# Run tests
python -m pytest backend/tests/

# Check server status
python backend/check_server.py
```

### 5. Access Backend
- Development: http://localhost:9079
- API Documentation: http://localhost:9079/docs
- Alternative docs: http://localhost:9079/redoc

---

## 🐳 Docker Deployment

### Build Docker Image
```bash
# Build the Docker image
docker build -t artisan-marketplace-backend .

# Run the container
docker run -p 8000:8000 artisan-marketplace-backend

# Run with environment variables
docker run -p 8000:8000 --env-file backend/.env.local artisan-marketplace-backend
```

---

## 🌐 Deployment Commands

### Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
cd frontend
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_BACKEND_URL
```

### Backend Deployment Options

#### Option 1: Railway (Current - Limited Blender Support)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

#### Option 2: Render.com (Recommended for Blender)
1. Connect GitHub repository to Render.com
2. Choose "Web Service"
3. Environment: Docker
4. Auto-deploy enabled

#### Option 3: Manual Server Deployment
```bash
# Copy files to server
scp -r . user@your-server:/path/to/app/

# SSH into server
ssh user@your-server

# Install dependencies and run
cd /path/to/app
python -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

---

## 🎯 Development Workflow

### Local Development
```bash
# Terminal 1: Start backend
cd Artisan-Marketplace
.\venv2\Scripts\activate  # Windows
python -m uvicorn backend.main:app --reload --port 9079

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### Git Workflow
```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin main

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main
```

---

## 🔧 Troubleshooting

### Common Issues

#### Backend Issues
```bash
# Check Python version
python --version

# Check if virtual environment is activated
which python

# Reinstall dependencies
pip install -r backend/requirements.txt --force-reinstall

# Check port availability
netstat -ano | findstr :9079  # Windows
lsof -i :9079                 # macOS/Linux
```

#### Frontend Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version
```

#### Docker Issues
```bash
# Check Docker status
docker --version

# View running containers
docker ps

# View logs
docker logs container-id

# Remove all containers
docker container prune

# Remove all images
docker image prune -a
```

---

## 📁 Project Structure

```
Artisan-Marketplace/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable components
│   │   └── lib/            # Utilities and configurations
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # FastAPI Python application
│   ├── main.py             # Main application entry
│   ├── routes.py           # API routes
│   ├── requirements.txt    # Python dependencies
│   └── ar_models/          # 3D model storage
├── Dockerfile              # Docker configuration
├── .dockerignore           # Docker ignore rules
└── README.md               # This file
```

---

## 🔐 Environment Variables Reference

### Frontend (.env.local)
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL | `http://localhost:9079` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | `your-project-id` |

### Backend (.env.local)
| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_API_KEY` | Google AI API key | `AIzaSy...` |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `project.firebasestorage.app` |
| `BACKEND_URL` | Deployed backend URL | `https://api.yourapp.com` |

---

## 🆘 Support

If you encounter any issues:

1. **Check the logs** in your terminal
2. **Verify environment variables** are set correctly
3. **Ensure all dependencies** are installed
4. **Check port availability** (9079 for backend, 3000 for frontend)
5. **Review the troubleshooting section** above

---

## 📝 Additional Notes

- **Blender Installation**: Required for AR model generation locally
- **Firebase Setup**: Needed for image storage and authentication
- **Google AI API**: Required for AI-powered features
- **Port Configuration**: Backend runs on 9079, frontend on 3000
- **Cross-Origin**: CORS is configured for local development

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Firebase credentials added
- [ ] Google AI API key set
- [ ] Database connections tested
- [ ] CORS origins updated
- [ ] SSL certificates configured
- [ ] Domain names pointed correctly
- [ ] Monitoring and logging enabled
