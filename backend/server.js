import express from 'express';
import cors from 'cors';
import 'dotenv/config.js'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminrouter from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import doctorRouter from './routes/doctorRoutes.js';
import appointmentRouter from './routes/appointmentRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;
connectDB();
connectCloudinary();

// API endpoints
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminrouter);
app.use('/api/doctors', doctorRouter);
app.use('/api/appointments', appointmentRouter);

app.get('/', (req, res) => {
    res.send('API is running - Healthcare Management System');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} http://localhost:${PORT}`);
});