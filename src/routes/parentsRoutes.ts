import { Router } from 'express';
import notificationsController from '../controllers/NotificationsController';
import parentsController from '../controllers/ParentsController';
import { managerAuth, parentAuth } from '../middlewares/auth';

const parentsRoutes = Router();

parentsRoutes.post('/signup-parent', parentsController.create, notificationsController.newParentNotification);
parentsRoutes.get('/parents', managerAuth, parentsController.index);
parentsRoutes.post('/parent-login', parentsController.login);
parentsRoutes.patch('/update-parent/:id', parentAuth, parentsController.updatePassword);
parentsRoutes.get('/parent/:id', parentAuth, parentsController.show);
parentsRoutes.patch('/authorize/parent/:id', managerAuth, parentsController.authorize);
parentsRoutes.get('/validate/parent/:token', parentsController.validate);
parentsRoutes.get('/unauthorized-parents', managerAuth, parentsController.listNonAuthParents);

export default parentsRoutes;

// https://eteginasiopecapi.herokuapp.com