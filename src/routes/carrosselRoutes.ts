import { Router } from "express";
import carrosselController from "../controllers/CarrosselController";

const carrosselRoutes = Router();

carrosselRoutes.get('/carrossel-data', carrosselController.index);

export default carrosselRoutes;