import { Router } from 'express';
import { getUserController } from '../controllers/userController.js';


const router = Router();

router.get('/me', getUserController);

export default router;