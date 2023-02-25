import { Router } from 'express';
import managerController from "../controllers/ManagerController";
import { managerAuth } from '../middlewares/auth';

const managerRoutes = Router();

managerRoutes.post('/signup-manager', managerController.create);
managerRoutes.post('/login-manager', managerController.login);
managerRoutes.patch('/update-manager/:id', managerAuth, managerController.update);

export default managerRoutes;