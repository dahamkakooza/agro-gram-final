# Contributing to Agro-Gram

Thank you for your commitment to cultivating prosperity through AI-driven agriculture. This guide is essential for ensuring a smooth and collaborative development process.

## 🚀 Our Tech Stack

- **Monorepo Manager:** Turborepo
- **Frontend:** React 18, TypeScript, Vite, Chakra UI
- **Backend:** Firebase Cloud Functions, Node.js, Firestore
- **AI Services:** Python 3.10+, FastAPI, Scikit-learn, PyTorch
- **Infrastructure:** Firebase Hosting, Google Cloud Run

## 📋 Prerequisites

Before you start, ensure you have these installed on your machine:
- **Node.js** v18 or higher
- **Python** 3.10 or higher
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Git**
- **Turborepo** (will be installed as a dev dependency)

## 🛠️ Development Environment Setup

Follow these steps to get your local environment running:

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/[your-organization]/agro-gram.git
    cd agro-gram
    ```

2.  **Install Root Dependencies**
    ```bash
    npm install
    ```

3.  **Install Python Dependencies**
    ```bash
    # Install dependencies for each AI service
    cd services/crop-recommendation-ai && pip install -r requirements.txt
    cd ../market-analysis-ai && pip install -r requirements.txt
    cd ../search-ranking-ai && pip install -r requirements.txt
    cd ../..
    ```

4.  **Setup Firebase Emulators (Optional but Recommended)**
    ```bash
    cd services/functions
    firebase login
    firebase init emulators
    # Select Firestore and Functions emulators
    cd ../..
    ```

5.  **Start the Development Environment**
    ```bash
    # This command is defined in the root package.json
    npm run dev
    ```

## 🔀 Git Branching Strategy

We use a **Feature Branch Workflow** with clear naming conventions.

### Branch Naming Convention

Use the following format: `[type]/[short-description]`

**Types:**
- `feat/`: A new feature
- `fix/`: A bug fix
- `docs/`: Documentation changes
- `refactor/`: Code refactoring
- `test/`: Adding tests
- `chore/`: Maintenance tasks

**Examples:**
- `feat/prompt-based-search`
- `fix/farmer-auth-bug`
- `docs/api-update`

### Branch Creation

Always create your branch from the latest `main`:
```bash
# Step 1: Ensure main is up-to-date
git checkout main
git pull origin main

# Step 2: Create and switch to your feature branch
git checkout -b feat/your-feature-name
