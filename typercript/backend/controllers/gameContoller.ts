import { Request, Response } from "express";
import * as gameService from "../services/gameService";

export function startGame(req: Request, res: Response) {
    const game = gameService.startGame();
    res.json(game);
}

export function getGameState(req: Request, res: Response) {
    const game = gameService.getGameState(req.params.id);
    if (!game) return res.status(404).json({ error: "Jogo não encontrado" });
    res.json(game);
}

export function checkPair(req: Request, res: Response) {
    const { gameId, cardIds } = req.body;
    const result = gameService.checkPair(gameId, cardIds);
    res.json(result);
}
