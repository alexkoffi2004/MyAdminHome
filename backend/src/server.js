const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./utils/errorHandler');
const { initializeSocket } = require('./config/socket');

// Chargement des variables d'environnement
dotenv.config();

// Connexion à la base de données
console.log('Tentative de connexion à MongoDB...');
console.log('URI:', process.env.MONGODB_URI);

connectDB();

const app = express();

// Middleware pour parser le corps des requêtes
app.use(express.json());

// Configuration de l'environnement
const isDevelopment = process.env.NODE_ENV !== 'production';

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://myadminhome.onrender.com',
  'https://myadminhome.netlify.app',
  'https://myfirstadminhome.netlify.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // En développement, accepter toutes les origines
    if (isDevelopment) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware pour la journalisation
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', require('./routes'));

// Middleware pour la gestion des erreurs
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Démarrer le serveur
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);

  // Initialiser Socket.IO pour la communication en temps réel
  initializeSocket(server);
});

// Gestion des rejets de promesses non gérés
process.on('unhandledRejection', (err) => {
  console.error('Rejet de promesse non géré:', err);
  // Fermer le serveur et quitter le processus
  server.close(() => process.exit(1));
}); 