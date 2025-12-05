import { Request, Response } from "express";
import * as gameService from "../services/gameService";

export function startGame(req: Request, res: Response) {

    const { region, customPokemonList } = req.body; 

    try {

        const game = gameService.startGame(region, customPokemonList);
        res.json(game);
    } catch (error: any) {

        return res.status(400).json({ error: error.message });
    }
}

export function getGameState(req: Request, res: Response) {
    const game = gameService.getGameState(req.params.id);
    if (!game) return res.status(404).json({ error: "Jogo não encontrado" });
    res.json(game);
}

export function checkPair(req: Request, res: Response) {
    const { gameId, cardIds } = req.body;

    const result = gameService.checkPair(gameId, cardIds);
    
    if ('error' in result) {

        const status = result.error.includes("não encontrado") ? 404 : 400;
    
        return res.status(status).json(result);
    }

    res.json(result);
}