import express from 'express';

import { addDoctor } from '../controllers/adminController.js';

import upload from '../middlewares/multer.js';

const adminrouter = express.Router();

adminrouter.post('/add-doctor',upload.single('image') ,addDoctor);

export default adminrouter;