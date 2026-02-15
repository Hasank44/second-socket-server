import { Router } from 'express';
import { getUserController, userLoginController, userLogoutController, userRegisterController } from '../controllers/userController.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';


const router = Router();

router.get('/me', isAuthenticated, getUserController);
router.post('/register', userRegisterController);
router.post('/login', userLoginController);
router.post('/logout', isAuthenticated , userLogoutController);

export default router;