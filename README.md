# 🌱 Agro-Gram

**Cultivating prosperity through AI-driven agriculture.**

Agro-Gram is an all-in-one platform connecting farmers, suppliers, and buyers in a modern, AI-powered agricultural ecosystem. We bridge the digital divide with USSD/SMS support while providing advanced tools for data-driven decision making.

![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.8%2B-blue)
![Django](https://img.shields.io/badge/django-5.2-green)
![React](https://img.shields.io/badge/react-18-blue)
![Firebase](https://img.shields.io/badge/firebase-auth-orange)

## 🚀 Features

### 🤖 AI-Powered Recommendations
- **Smart Crop Suggestions**: Get personalized crop recommendations based on soil analysis, weather patterns, and market data
- **Agriculture AI Assistant**: Chat-based interface for farming advice and best practices
- **Professional Crop Recommender**: ML-powered system using soil nutrients, climate data, and regional factors

### 🛒 Intelligent Marketplace
- **Natural Language Search**: "Find drought-resistant maize seeds near Kampala" - our AI understands your needs
- **Price Predictions**: AI-driven price forecasting for crops and commodities
- **Quality Grading**: Premium, Standard, and Economy product classifications
- **Regional Insights**: Location-based product discovery and pricing

### 📊 Multi-Role Dashboards
- **Farmer Dashboard**: Farm management, crop tracking, and sales analytics
- **Buyer Interface**: Product discovery, price comparisons, and purchase history
- **Supplier Portal**: Inventory management, sales analytics, and market insights
- **Admin Panel**: Platform analytics, user management, and system monitoring

### 📱 Inclusive Technology
- **USSD Integration**: *248* access for farmers without smartphones
- **SMS Notifications**: Market alerts, price updates, and farming tips
- **Progressive Web App**: Works offline and on low-bandwidth connections

### 🌦️ Environmental Intelligence
- **Real-Time Weather Integration**: Adaptive recommendations based on current conditions
- **Seasonal Planning**: Crop rotation and planting schedule optimization
- **Climate Risk Assessment**: Early warnings for droughts, floods, and pests

### 💰 Market & Financial Tools
- **Profitability Calculator**: ROI analysis for different crops and farming methods
- **Price Trend Analysis**: Historical data and future projections
- **Supply Chain Insights**: Market demand and inventory optimization

## 🏗️ Architecture

```
Agro-Gram Platform
├── 🌐 Frontend (React + Vite)
│   ├── Farmer Dashboard
│   ├── Marketplace
│   ├── AI Assistant
│   └── Admin Panel
├── 🔧 Backend (Django REST Framework)
│   ├── User Management & Auth
│   ├── Farm Management API
│   ├── Marketplace API
│   ├── AI Recommendations Engine
│   └── USSD/SMS Gateway
├── 🗄️ Database (PostgreSQL)
│   ├── User Profiles
│   ├── Farm Data
│   ├── Product Listings
│   └── Market Analytics
└── 🔐 Authentication (Firebase)
    ├── Email/Password
    ├── Phone Auth
    └── Social Logins
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Context API** - State management
- **CSS3** - Custom styling with modern features

### Backend
- **Django 5.2** - High-level Python web framework
- **Django REST Framework** - Powerful API toolkit
- **PostgreSQL** - Robust relational database
- **Redis** - Caching and session storage
- **Celery** - Asynchronous task processing

### AI & Machine Learning
- **Scikit-learn** - Crop recommendation models
- **Pandas & NumPy** - Data processing and analysis
- **Google Gemini AI** - Natural language processing
- **Custom ML Models** - Price prediction and crop suitability

### Authentication & Security
- **Firebase Authentication** - Secure user management
- **JWT Tokens** - Stateless authentication
- **CORS Headers** - Cross-origin resource sharing
- **Environment Variables** - Secure configuration

### Deployment & Infrastructure
- **Docker** - Containerization
- **nginx** - Web server and reverse proxy
- **Gunicorn** - WSGI HTTP server
- **Cloud Storage** - Media file handling

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Redis 6+

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/agro-gram.git
   cd agro-gram/services/backend-api
   ```

2. **Set up Python environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration:
   # - Database credentials
   # - Firebase admin SDK
   # - Gemini AI API key
   # - Redis URL
   ```

5. **Run database migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start development server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../../agrogram-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase config and API URLs
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### USSD/SMS Integration

1. **Set up Africa's Talking API**
   ```bash
   # Configure in settings.py
   AFRICASTALKING_USERNAME=your_username
   AFRICASTALKING_API_KEY=your_api_key
   ```

2. **Configure USSD endpoints**
   ```bash
   # USSD callback URL: https://yourdomain.com/api/v1/ussd/callback/
   ```

## 🎯 API Endpoints

### Authentication
- `POST /api/v1/users/login/` - Firebase authentication
- `POST /api/v1/users/register/` - User registration
- `GET /api/v1/users/me/` - Current user profile

### Farm Management
- `GET /api/v1/farms/farms/` - List user farms
- `POST /api/v1/farms/farms/` - Create new farm
- `GET /api/v1/farms/farms/{id}/` - Farm details
- `GET /api/v1/farms/plots/` - Farm plots management

### Marketplace
- `GET /api/v1/marketplace/products/` - Browse products
- `POST /api/v1/marketplace/products/` - List product
- `POST /api/v1/marketplace/price-prediction/` - Get price forecasts
- `GET /api/v1/marketplace/search/` - AI-powered search

### AI Recommendations
- `POST /api/v1/recommendations/crop-recommendation/` - Get crop suggestions
- `POST /api/v1/recommendations/agriculture-chat/` - AI farming assistant
- `POST /api/v1/recommendations/feedback/` - Submit recommendation feedback

### USSD/SMS
- `POST /api/v1/ussd/callback/` - Africa's Talking USSD callback
- `POST /api/v1/sms/incoming/` - Process incoming SMS

## 🧪 Testing

### Backend Tests
```bash
python manage.py test users
python manage.py test farms
python manage.py test marketplace
python manage.py test recommendations
```

### Frontend Tests
```bash
npm test
npm run test:coverage
```

### API Testing
```bash
# Using curl examples in docs/api-examples.md
```

## 🚀 Deployment

### Production Setup

1. **Set up production environment variables**
   ```bash
   DEBUG=False
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   DATABASE_URL=postgresql://...
   REDIS_URL=redis://...
   ```

2. **Collect static files**
   ```bash
   python manage.py collectstatic
   ```

3. **Run with Gunicorn**
   ```bash
   gunicorn agrogram_api.wsgi:application --bind 0.0.0.0:8000
   ```

4. **Set up nginx configuration**
   ```nginx
   # See docs/nginx.conf.example
   ```

5. **Configure SSL with Let's Encrypt**
   ```bash
   certbot --nginx -d yourdomain.com
   ```

### Docker Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📱 Mobile & USSD Access

### USSD Code
Dial `*248*` on any mobile phone to access:
- Market prices
- Weather updates
- Farming tips
- Account balance

### SMS Commands
Text keywords to `AGR0GRAM`:
- `PRICE MAIZE` - Get current maize prices
- `WEATHER KAMPALA` - Weather forecast
- `TIPS TOMATO` - Growing tips for tomatoes

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint and Prettier for JavaScript
- Write tests for new features
- Update documentation accordingly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@agro-gram.com
- 💬 Discord: [Join our community](https://discord.gg/agro-gram)
- 📖 Documentation: [Full documentation](https://docs.agro-gram.com)
- 🐛 Bug Reports: [GitHub Issues](https://github.com/your-username/agro-gram/issues)

## 🙏 Acknowledgments

- **Farmers** - For their invaluable feedback and testing
- **Agricultural Experts** - For domain knowledge and validation
- **Open Source Community** - For the amazing tools we build upon
- **Research Partners** - For data and scientific validation

---

<div align="center">

**🌾 Building the future of agriculture, one byte at a time**

[Website](https://agro-gram.com) | [Demo](https://demo.agro-gram.com) | [Documentation](https://docs.agro-gram.com) | [Blog](https://blog.agro-gram.com)

</div>
