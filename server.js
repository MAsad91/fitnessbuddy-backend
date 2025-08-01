require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// CORS configuration
const corsOptions = {
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Database connection
connectDB();

// Health check endpoints (must be before routes to avoid conflicts)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint for mobile app IP detection
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/food', require('./routes/food'));
app.use('/api/workout', require('./routes/workoutAndExercise')); // Combined workout and exercise routes
app.use('/api/sleep', require('./routes/sleep'));
app.use('/api/hydration', require('./routes/hydration'));
app.use('/api/community', require('./routes/community'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/challenges', require('./routes/challenge'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/weight', require('./routes/weightRoutes')); // Weight tracking routes

const PORT = process.env.PORT || 5000;
// Listen on all network interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server accessible at:`);
  console.log(`- Local: http://localhost:${PORT}`);
  console.log(`- Network: http://YOUR_IP:${PORT}`);
});