import { Router } from "express";
import schedulesController from "../controllers/SchedulesController";
import multer from "multer";
import uploadConfig from "../config/upload";

const upload = multer(uploadConfig);

const schedulesRoutes = Router();

schedulesRoutes.post('/schedule', upload.single('schedule'), schedulesController.create);
schedulesRoutes.patch('/schedule/:schoolClass', upload.single('schedule'), schedulesController.update);
schedulesRoutes.get('/schedule/:schoolClass', schedulesController.show);

export default schedulesRoutes;