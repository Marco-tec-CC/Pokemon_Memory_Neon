import { Router } from "express";
import * as gameController from "../controllers/gameContoller"; 

const router = Router();

router.post("/start", gameController.startGame);
router.get("/state/:id", gameController.getGameState);
router.post("/check", gameController.checkPair);

export default router;