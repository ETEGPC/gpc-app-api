import { Router } from "express";
import notificationsController from "../controllers/NotificationsController";
import solicitationController from "../controllers/SolicitationController";

const solicitationRoutes = Router();

solicitationRoutes.post('/solicitation', solicitationController.create, notificationsController.newSolicitationNotification);
solicitationRoutes.get('/solicitations', solicitationController.index);
solicitationRoutes.get('/solicitations/:parentId', solicitationController.list);
solicitationRoutes.patch('/solicitation/:id', solicitationController.update);
solicitationRoutes.delete('/solicitation/:id', solicitationController.delete);

export default solicitationRoutes;