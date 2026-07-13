const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoute = require('./routes/auth');
const equipmentRoute = require('./routes/equipment');
const ordersRoute = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../web')));

// Serve uploaded ID card images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Register API Routes
app.use('/api/auth', authRoute.router);
app.use('/api/equipment', equipmentRoute);
app.use('/api/orders', ordersRoute);

// Catch-all route to serve index.html for undefined frontend routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../web/index.html'));
});

// Database Connection & Server Startup
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("Error: MONGO_URI environment variable is missing in .env file.");
  process.exit(1);
}

console.log("Connecting to MongoDB Database...");
mongoose.connect(mongoUri)
  .then(() => {
    console.log("MongoDB connection established successfully!");
    app.listen(PORT, () => {
      console.log(`Server is running in production/dev mode on port ${PORT}`);
      console.log(`URL: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed. Detail:", err.message);
    console.log("If using MongoDB Atlas, make sure you replaced <db_password> and configured IP Access List.");
  });
