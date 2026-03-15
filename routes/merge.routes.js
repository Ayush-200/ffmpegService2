import express from 'express';
import { mergeController } from '../controller/merge.controller.js';
const router = express.Router();

router.post('/merge', mergeController)
export default router;