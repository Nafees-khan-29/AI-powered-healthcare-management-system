import express from 'express';
import cors from 'cors';
import 'dotenv/config.js'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminrouter from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
//const express = require('express');

const app = express();
app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 3000;
connectDB();
connectCloudinary();

// api end points
app.use('/api/auth', authRoutes);
app.use('/api/admin',adminrouter);

app.get('/', (req, res) => {
    res.send('api is running');

});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} http://localhost:${PORT}`);
});