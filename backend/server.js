const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

// loading the environment variables
dotenv.config();

const app = express();

// the middleware components
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically with security headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', 'inline');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
connectDB();

// the routes
const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const messageRoutes = require('./routes/messageRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const reviewDirectRoutes = require('./routes/reviewDirectRoutes');
app.use('/api/listings', listingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/listings/:listingId/reviews', reviewRoutes);
app.use('/api/reviews', reviewDirectRoutes);



// checking the health status of api
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    message: 'BruinRent API is running',
    timestamp: new Date().toISOString()
  });
});

// gen error handling 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`The Server is running on port ${PORT}`);
});