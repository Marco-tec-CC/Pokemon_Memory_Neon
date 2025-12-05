// src/controllers/gameContoller.ts

import { Request, Response } from "express";
import * as gameService from "../services/gameService";

export function startGame(req: Request, res: Response) {

    // CRÍTICO: Extrair numberOfPairs do corpo da requisição
    const { region, customPokemonList, numberOfPairs } = req.body; 

    try {
        // CRÍTICO: Passar numberOfPairs para o Service
        const game = gameService.startGame(region, customPokemonList, numberOfPairs);
        res.json(game);
    } catch (error: any) {

        // Garante que o erro retorne como JSON 400 em caso de falha na lógica
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