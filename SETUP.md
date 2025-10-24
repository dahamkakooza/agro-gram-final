# Agro-Gram Development Environment Setup Guide

This guide will help you set up a complete local development environment for the Agro-Gram monorepo. Follow these steps carefully to get all components running.

## Prerequisites

Ensure you have the following installed on your machine:

- **Git**
- **Node.js** (v18 or higher) & **npm**
- **Python** (3.10 or higher) & **pip**
- **PostgreSQL** (v12 or higher)
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Docker** (Optional, for containerized database)

agro-gram/
├── 📁 apps/                         # React Frontend Applications
│   ├── farmer-dashboard/            # Farmer interface for management
│   ├── consumer-marketplace/        # Consumer shopping experience
│   ├── supplier-portal/             # Supplier inventory management
│   └── admin-console/               # Administrative oversight
│
├── 📁 services/
│   ├── backend-api/                 # Django REST Framework API
│   │   ├── agrogram_api/            # Django project settings
│   │   ├── users/                   # User management app
│   │   ├── recommendations/         # AI recommendation engine
│   │   ├── marketplace/             # Marketplace functionality
│   │   ├── manage.py
│   │   └── requirements.txt
│   │
│   ├── crop-recommendation-ai/      # Crop suggestion models
│   ├── market-analysis-ai/          # Price forecasting models
│   └── search-ranking-ai/           # Prompt-based search models
│
├── 📁 packages/                     # Shared code
│   ├── api/                         # API client utilities
│   ├── ui/                          # Shared React components
│   ├── utils/                       # Common utilities
│   └── eslint-config/               # Shared linting configuration
│
├── 📁 docs/                         # Documentation
│   ├── architecture/                # System diagrams & blueprints
│   ├── api/                         # API specifications
│   └── adr/                         # Architecture decision records
│
└── 📁 scripts/                      # Deployment & utility scripts

## 1. Clone the Repository

```bash
git clone https://github.com/[your-organization]/agro-gram.git
cd agro-gram
2. Firebase Setup (Authentication & Hosting)
2.1. Create Firebase Project
Go to Firebase Console

Click "Create Project" → Name it agro-gram → Enable Google Analytics (optional)

Once created, note your Project ID

2.2. Enable Authentication
In Firebase Console, go to Authentication → Get Started

Enable Email/Password and Phone authentication providers

Configure authorized domains (localhost for development)

2.3. Get Service Account Key
Go to Project Settings → Service Accounts

Click Generate New Private Key

Save the JSON file as firebase-service-account.json in services/backend-api/

3. Database Setup
3.1. Install and Start PostgreSQL
Mac (Homebrew):

bash
brew install postgresql
brew services start postgresql
Ubuntu/Debian:

bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
Windows: Download and install from PostgreSQL Downloads

3.2. Create Database and User
bash
# Login to PostgreSQL
sudo -u postgres psql

# Execute these commands in psql:
CREATE DATABASE agrogram_db;
CREATE USER agrogram_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE agrogram_db TO agrogram_user;
\q
4. Backend Setup (Django API)
4.1. Setup Python Environment
bash
cd services/backend-api

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Mac/Linux:
source venv/bin/activate
# On Windows (PowerShell):
.\venv\Scripts\activate
4.2. Install Python Dependencies
bash
pip install -r requirements.txt

# Install additional development packages
pip install pytest pytest-django coverage
4.3. Configure Environment Variables
bash
# Copy environment template
cp .env.example .env
Edit the .env file with your configuration:

bash
# Django
DEBUG=True
SECRET_KEY='your-very-secure-secret-key-change-this-in-production'
DJANGO_SETTINGS_MODULE=agram_api.settings.local

# Database
DATABASE_URL=postgresql://agrogram_user:your_secure_password_here@localhost:5432/agrogram_db

# Firebase
FIREBASE_PROJECT_ID=your-firebase-project-id
GOOGLE_APPLICATION_CREDENTIALS=firebase-service-account.json

# API Keys (get these from respective services)
OPENWEATHER_API_KEY=your_openweather_api_key
4.4. Run Database Migrations
bash
python manage.py migrate
4.5. Create Superuser
bash
python manage.py createsuperuser
# Follow prompts to create admin user
4.6. Start Development Server
bash
python manage.py runserver
The Django API will be available at http://localhost:8000
The Django Admin will be at http://localhost:8000/admin

5. Frontend Setup (React Applications)
5.1. Farmer Dashboard
bash
cd apps/farmer-dashboard

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
Edit .env.local:

bash
VITE_API_BASE_URL=http://localhost:8000/api
VITE_FIREBASE_API_KEY=your-firebase-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
bash
# Start development server
npm run dev
Farmer Dashboard will be at http://localhost:5173

5.2. Consumer Marketplace
bash
cd apps/consumer-marketplace
npm install
cp .env.example .env.local
# Edit .env.local with same Firebase config as above
npm run dev
Consumer Marketplace will be at http://localhost:5174

5.3. Repeat for other apps:
apps/supplier-portal/

apps/admin-console/

6. AI Services Setup
6.1. Crop Recommendation AI
bash
cd services/crop-recommendation-ai

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download or generate training data
# Place crop.csv in this directory

# Train the model
python train_model.py
6.2. Market Analysis AI
bash
cd services/market-analysis-ai
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
7. Shared Packages Setup
7.1. UI Components Package
bash
cd packages/ui
npm install
npm run build
7.2. API Client Package
bash
cd packages/api
npm install
npm run build
8. Verify Installation
8.1. Test Backend API
bash
curl http://localhost:8000/api/health/
# Should return: {"status": "healthy"}
8.2. Test Frontend Apps
Open http://localhost:5173 in browser

You should see the Farmer Dashboard login page

Try creating a new account - it should work with Firebase Auth

8.3. Test Database Connection
bash
python manage.py dbshell
# Should connect to PostgreSQL
9. Development Workflow
9.1. Running Tests
bash
# Backend tests
cd services/backend-api
python manage.py test

# Frontend tests (per app)
cd apps/farmer-dashboard
npm run test

# All tests (from root)
npm run test
9.2. Code Quality
bash
# Linting
npm run lint

# Formatting
npm run format
9.3. Database Management
bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Reset database (careful!)
python manage.py reset_db
10. Troubleshooting
10.1. Common Issues
Port already in use:

bash
# Find process using port 8000
lsof -ti:8000
# Kill the process
kill -9 $(lsof -ti:8000)
Python dependencies issues:

bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install --force-reinstall -r requirements.txt
Database connection errors:

Check PostgreSQL is running: sudo service postgresql status

Verify credentials in .env file

Check database exists: psql -l

Firebase authentication errors:

Verify service account key path is correct

Check Firebase project ID matches

Ensure required Firebase APIs are enabled

10.2. Getting Help
Check the docs/ directory for architecture diagrams

Review Django and React documentation

Check existing GitHub issues

Ask in team Slack/Discord channel

11. Next Steps
After successful setup:

Explore the Django Admin at http://localhost:8000/admin

Test user registration in any frontend app

Run the test suite to verify everything works

Check out the API documentation at http://localhost:8000/api/schema/swagger-ui/

Review the architecture diagrams in docs/architecture/

Need help? Contact the development team or create an issue in the repository.

text

## Key Updates in this SETUP.md:

1. **Firebase-Centric Setup:** Detailed steps for Firebase Auth setup, service accounts, and web configuration
2. **PostgreSQL Focus:** Specific instructions for different operating systems
3. **Environment Variables:** Complete `.env` configuration for both Django and React
4. **Multi-App Setup:** Instructions for all four React applications
5. **AI Integration:** Setup for your machine learning services
6. **Verification Steps:** Commands to verify everything is working
7. **Troubleshooting:** Common issues and solutions
8. **Complete Workflow:** Testing, linting, and database management commands

This guide will help any developer get this complex hybrid architecture up and running quickly and consistently.
