const admin = require('firebase-admin');

// Firebase configuration
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      console.log('✅ Firebase already initialized');
      return admin.apps[0];
    }

    // Check if we have the required Firebase environment variables
    if (!process.env.FIREBASE_PROJECT_ID) {
      console.log('⚠️ FIREBASE_PROJECT_ID not set, skipping Firebase initialization');
      throw new Error('FIREBASE_PROJECT_ID not configured');
    }

    // Initialize Firebase Admin SDK
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE || 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    };

    // Initialize the app
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return app;
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    
    // Fallback to application default credentials
    try {
      console.log('🔄 Trying application default credentials...');
      const app = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      console.log('✅ Firebase initialized with application default credentials');
      return app;
    } catch (fallbackError) {
      console.error('❌ Firebase initialization failed:', fallbackError);
      throw new Error('Firebase initialization failed');
    }
  }
};

// Get Firebase messaging instance
const getMessaging = () => {
  if (admin.apps.length === 0) {
    initializeFirebase();
  }
  return admin.messaging();
};

// Get Firebase app instance
const getApp = () => {
  if (admin.apps.length === 0) {
    return initializeFirebase();
  }
  return admin.apps[0];
};

module.exports = {
  initializeFirebase,
  getMessaging,
  getApp,
  admin
}; 