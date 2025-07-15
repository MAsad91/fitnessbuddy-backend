# Backend Deployment Guide - Render

## Prerequisites

1. **MongoDB Database**: You'll need a MongoDB database (MongoDB Atlas recommended)
2. **Environment Variables**: All required environment variables (see `env.example`)
3. **GitHub Repository**: Your code should be in a GitHub repository

## Step-by-Step Deployment

### Step 1: Prepare Your Database

1. **Create MongoDB Atlas Account** (if you don't have one):
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free cluster
   - Get your connection string

2. **Set up Database**:
   - Create a database named `calories-calculator`
   - Note your connection string

### Step 2: Deploy to Render

1. **Sign up for Render**:
   - Go to [Render.com](https://render.com)
   - Sign up with your GitHub account

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your backend

3. **Configure the Service**:
   - **Name**: `calories-calculator-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend` (if your backend is in a subdirectory)

4. **Set Environment Variables**:
   Click "Environment" tab and add these variables:

   ```
   NODE_ENV=production
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_jwt_secret
   JWT_EXPIRE=30d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   NUTRITIONIX_APP_ID=your_nutritionix_app_id
   NUTRITIONIX_API_KEY=your_nutritionix_api_key
   ```

5. **Deploy**:
   - Click "Create Web Service"
   - Render will automatically build and deploy your app

### Step 3: Update Frontend Configuration

Once deployed, update your frontend API configuration:

```javascript
// In mobile-expo/src/config/api.js
const API_URL = 'https://your-render-app-name.onrender.com';
```

### Step 4: Test Your Deployment

1. **Health Check**: Visit `https://your-app-name.onrender.com/health`
2. **API Test**: Test your endpoints with Postman or similar tool

## Environment Variables Guide

### Required Variables:

- **MONGO_URI**: Your MongoDB connection string
- **JWT_SECRET**: A secure random string for JWT tokens
- **NODE_ENV**: Set to `production`

### Optional Variables (based on features you use):

- **Email**: For password reset functionality
- **Cloudinary**: For image uploads
- **OAuth**: For social login
- **Nutritionix**: For food database

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check your `package.json` has correct scripts
2. **Database Connection**: Verify your MongoDB URI is correct
3. **Environment Variables**: Ensure all required variables are set
4. **CORS Issues**: Check your CORS configuration

### Logs:
- Check Render logs in the dashboard
- Use `console.log()` for debugging

## Security Notes

1. **Never commit `.env` files**
2. **Use strong JWT secrets**
3. **Enable MongoDB Atlas IP whitelist**
4. **Use HTTPS in production**

## Cost

- **Free Tier**: 750 hours/month
- **Paid Plans**: Start at $7/month for unlimited usage 