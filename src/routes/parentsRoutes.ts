import { Router } from 'express';
import notificationsController from '../controllers/NotificationsController';
import parentsController from '../controllers/ParentsController';
import { managerAuth, parentAuth } from '../middlewares/auth';
import path from 'path';

const parentsRoutes = Router();

parentsRoutes.post('/signup-parent', parentsController.create, notificationsController.newParentNotification);
parentsRoutes.get('/parents', managerAuth, parentsController.index);
parentsRoutes.post('/parent-login', parentsController.login);
parentsRoutes.patch('/update-parent/:id', parentAuth, parentsController.updatePassword);
parentsRoutes.get('/parent/:id', parentAuth, parentsController.show);
parentsRoutes.patch('/authorize/parent/:id', managerAuth, parentsController.authorize);
parentsRoutes.get('/validate/parent/:token', parentsController.validate);
parentsRoutes.get('/unauthorized-parents', managerAuth, parentsController.listNonAuthParents);
parentsRoutes.get('/parents/recoverpass/:id', async (req, res) => {
  return res.sendFile(path.join(__dirname, '..', '..', 'public', 'passwordRecover', 'index.html'));
});
parentsRoutes.post('/parents/recoverpass/:id', parentsController.recoverPass);
parentsRoutes.post('/parents/sendRecoverEmail', parentsController.sendRecoverEmail);


export default parentsRoutes;

// https://eteginasiopecapi.herokuapp.com