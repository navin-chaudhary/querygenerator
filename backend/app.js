// backend/app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const QueryRoutes = require('./routes/queryRoutes');
const AuthRoutes = require('./routes/authRoutes');
const MessageRoutes = require('./routes/messageRoutes');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', AuthRoutes);
app.use('/api', QueryRoutes);
app.use('/api', MessageRoutes);

module.exports = app;