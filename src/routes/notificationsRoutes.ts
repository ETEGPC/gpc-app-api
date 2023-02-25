import { Router } from 'express';
import webpush from 'web-push';
import notificationsController from '../controllers/NotificationsController';
import noticesRoutes from './noticesRoutes';

const notificationsRoutes = Router();

notificationsRoutes.get('/push/publicKey', notificationsController.sendPublicKey);
notificationsRoutes.post('/push/register', notificationsController.registerParent);
notificationsRoutes.get('/push/teste', notificationsController.sendNewNoticeNotification);
notificationsRoutes.post('/push/expo', notificationsController.registerManager);
notificationsRoutes.post('/push/new-solicitation', notificationsController.newSolicitationNotification);

export default notificationsRoutes;