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

// Configuration de CORS avec des options spécifiques
const allowedOrigins = [
  'https://myfirstadminhome.netlify.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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