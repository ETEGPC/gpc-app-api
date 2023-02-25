import { Router } from "express";
import noticesController from "../controllers/NoticesController";
import { managerAuth } from "../middlewares/auth";
import notificationsController from "../controllers/NotificationsController";

const noticesRoutes = Router();

noticesRoutes.post('/create-notice', managerAuth, noticesController.create, notificationsController.sendNewNoticeNotification);
noticesRoutes.get('/notices', noticesController.index);
noticesRoutes.get('/notice/:id', noticesController.show);
noticesRoutes.patch('/update-notice/:id', managerAuth, noticesController.update);
noticesRoutes.delete('/delete-notice/:id', managerAuth, noticesController.delete);

export default noticesRoutes;