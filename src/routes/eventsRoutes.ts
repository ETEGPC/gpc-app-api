import { Router } from "express";
import eventsController from "../controllers/EventsController";
import { managerAuth } from "../middlewares/auth";

const eventsRoutes = Router();

eventsRoutes.post('/event', managerAuth, eventsController.create);
eventsRoutes.patch('/event/:id', managerAuth, eventsController.update);
eventsRoutes.get('/events', eventsController.index);
eventsRoutes.get('/event/:id', eventsController.show);
eventsRoutes.delete('/event/:id', managerAuth, eventsController.delete);

export default eventsRoutes;