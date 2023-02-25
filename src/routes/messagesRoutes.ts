import { Router } from "express";
import messagesController from "../controllers/MessagesController";

const messagesRoutes = Router();

messagesRoutes.get('/messages', messagesController.index);

export default messagesRoutes;