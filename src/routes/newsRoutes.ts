import { Router } from "express";
import newsController from "../controllers/NewsController";
import multer from "multer";
import uploadConfig from "../config/upload";
import { managerAuth } from "../middlewares/auth";

const upload = multer(uploadConfig)
const newsRoutes = Router();

newsRoutes.post('/news', managerAuth, upload.single('file'), newsController.create);
newsRoutes.get('/news', newsController.index);
newsRoutes.delete('/news/:id', managerAuth, newsController.delete);

export default newsRoutes