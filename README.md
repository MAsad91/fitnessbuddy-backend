# 🏋️‍♂️ Fitness Buddy Backend API

> **A powerful, scalable Node.js backend for comprehensive fitness and nutrition tracking**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.13.2-green.svg)](https://mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-orange.svg)](https://jwt.io/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Image%20Upload-blue.svg)](https://cloudinary.com/)

## 🚀 Features

### 🔐 Authentication & Security
- **JWT-based authentication** with secure token management
- **Password encryption** using bcryptjs
- **Email verification** system with beautiful HTML templates
- **Social login integration** (Google, Facebook OAuth)
- **Biometric authentication** support for mobile apps
- **Rate limiting** and security middleware

### 🍎 Nutrition & Food Tracking
- **Comprehensive food database** with 4,700+ Pakistani food items
- **Barcode scanning** integration with Nutritionix API
- **Calorie calculation** and nutritional analysis
- **Custom food creation** and editing
- **Meal planning** and tracking
- **Local food database** with fallback support

### 💪 Workout & Exercise Management
- **Exercise library** with 200+ exercises across all muscle groups
- **Workout planning** and scheduling
- **Progress tracking** with personal records
- **Exercise recommendations** based on fitness level
- **Muscle group targeting** and workout variety
- **Rest day management** and recovery tracking

### 📊 Health Metrics & Analytics
- **BMR calculation** using multiple formulas (Mifflin-St Jeor, Harris-Benedict)
- **Weight tracking** with goal setting
- **Sleep monitoring** with quality assessment
- **Hydration tracking** with daily water intake goals
- **Progress visualization** with charts and analytics
- **Body composition** tracking

### 🎯 Goal Setting & Challenges
- **Smart goal setting** with realistic targets
- **Challenge system** with community features
- **Progress milestones** and achievements
- **Goal categories** (weight, fitness, nutrition)
- **Deadline tracking** and reminders

### 👥 Community & Social Features
- **Community posts** and sharing
- **Progress sharing** with privacy controls
- **Motivational content** and tips
- **User profiles** with achievements
- **Social interactions** and support

### 📅 Calendar Integration
- **Event scheduling** for workouts and meals
- **Calendar synchronization** with external services
- **Reminder system** for appointments
- **Progress milestones** tracking

## 🏗️ Architecture

```
backend/
├── 📁 config/           # Configuration files
│   ├── db.js           # MongoDB connection
│   ├── cloudinary.js   # Image upload config
│   └── nutritionix.js  # Food API config
├── 📁 controllers/      # Business logic
│   ├── auth.js         # Authentication logic
│   ├── food.js         # Food management
│   ├── workout.js      # Exercise & workout logic
│   └── ...            # Other feature controllers
├── 📁 models/          # Database schemas
│   ├── User.js         # User model
│   ├── FoodEntry.js    # Food tracking
│   ├── Workout.js      # Exercise data
│   └── ...            # Other data models
├── 📁 routes/          # API endpoints
│   ├── auth.js         # Auth routes
│   ├── food.js         # Food API
│   ├── workout.js      # Exercise routes
│   └── ...            # Other route files
├── 📁 middleware/      # Custom middleware
│   └── auth.js         # JWT verification
├── 📁 utils/           # Helper functions
│   ├── email.js        # Email service
│   ├── healthCalculations.js
│   └── imageUpload.js  # File upload handling
└── 📁 ThirdParty/      # External API integrations
    └── nutritionixAPI.js
```

## 🛠️ Technology Stack

### Core Technologies
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB

### Authentication & Security
- **JWT** - JSON Web Tokens
- **bcryptjs** - Password hashing
- **nodemailer** - Email service
- **passport** - Social authentication

### External APIs & Services
- **Cloudinary** - Image upload and management
- **Nutritionix** - Food database API
- **Gmail SMTP** - Email delivery

### Development Tools
- **nodemon** - Development server
- **dotenv** - Environment management
- **cors** - Cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

### Environment Variables

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Authentication
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE=30d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=Fitness Buddy <your_email@gmail.com>

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Nutritionix API (Food Database)
NUTRITIONIX_APP_ID=your_app_id
NUTRITIONIX_API_KEY=your_api_key

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
POST   /api/auth/logout       # User logout
GET    /api/auth/me           # Get current user
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Food & Nutrition
```
GET    /api/food/search       # Search food items
POST   /api/food/add          # Add food entry
GET    /api/food/entries      # Get user's food entries
PUT    /api/food/update/:id   # Update food entry
DELETE /api/food/delete/:id   # Delete food entry
GET    /api/food/barcode/:code # Scan barcode
```

### Workouts & Exercises
```
GET    /api/workout/exercises     # Get exercise library
POST   /api/workout/create        # Create workout
GET    /api/workout/user          # Get user's workouts
PUT    /api/workout/update/:id    # Update workout
DELETE /api/workout/delete/:id    # Delete workout
GET    /api/workout/muscle-groups # Get muscle groups
```

### Health Tracking
```
POST   /api/weight/add        # Add weight entry
GET    /api/weight/history    # Get weight history
POST   /api/sleep/add         # Add sleep entry
GET    /api/sleep/history     # Get sleep history
POST   /api/hydration/add     # Add water intake
GET    /api/hydration/history # Get hydration history
```

### Goals & Challenges
```
POST   /api/goals/create      # Create new goal
GET    /api/goals/user        # Get user's goals
PUT    /api/goals/update/:id  # Update goal
POST   /api/challenges/create # Create challenge
GET    /api/challenges/list    # Get challenges
```

### Community
```
POST   /api/community/post    # Create community post
GET    /api/community/posts   # Get community posts
PUT    /api/community/like    # Like/unlike post
POST   /api/community/comment # Add comment
```

### Dashboard & Analytics
```
GET    /api/dashboard/summary     # Get dashboard summary
GET    /api/dashboard/calories    # Get calorie data
GET    /api/dashboard/progress    # Get progress data
GET    /api/dashboard/analytics   # Get analytics
```

## 🗄️ Database Schema

### Core Models
- **User** - User profiles and authentication
- **FoodEntry** - Food tracking and nutrition
- **Workout** - Exercise and workout data
- **Weight** - Weight tracking and goals
- **Sleep** - Sleep monitoring
- **Hydration** - Water intake tracking
- **Goal** - Goal setting and progress
- **Challenge** - Community challenges
- **Community** - Social features
- **Calendar** - Event scheduling

## 🔧 Development

### Running Tests
```bash
npm test
```

### Database Seeding
```bash
npm run seed
```

### Code Quality
- ESLint configuration
- Prettier formatting
- Consistent code style

## 🚀 Deployment

### Heroku Deployment
1. **Create Heroku app**
   ```bash
   heroku create your-app-name
   ```

2. **Set environment variables**
   ```bash
   heroku config:set MONGO_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   # ... set other variables
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Render Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Render deployment instructions.

## 📊 Performance & Monitoring

### Health Checks
- `/health` - Basic health check
- `/api/health` - Detailed health status

### Monitoring
- Request/response logging
- Error tracking
- Performance metrics
- Database connection monitoring

## 🔒 Security Features

- **JWT token validation**
- **Password encryption**
- **Rate limiting**
- **CORS configuration**
- **Input validation**
- **SQL injection prevention**
- **XSS protection**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the API documentation

---

<div align="center">

**Built with ❤️ for the fitness community**

[![GitHub stars](https://img.shields.io/github/stars/your-repo/calories-calculator)](https://github.com/your-repo/calories-calculator)
[![GitHub forks](https://img.shields.io/github/forks/your-repo/calories-calculator)](https://github.com/your-repo/calories-calculator)
[![GitHub issues](https://img.shields.io/github/issues/your-repo/calories-calculator)](https://github.com/your-repo/calories-calculator)

</div>