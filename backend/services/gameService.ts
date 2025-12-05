// src/services/gameService.ts

import { randomUUID } from "crypto";
import { Card, Game, Region, Pokemon } from "../models/gameModel";
import { createDeck, getPokemonsByRegion, getRandomSample } from "../utils/helpers";

const games: Record<string, Game> = {};

type CheckPairSuccessResult = {
    match: boolean;
    moves: number;
    message: string;
    isGameOver: boolean;
    cards: Card[];
};

type CheckPairErrorResult = {
    error: string;
};


// CRÍTICO: O parâmetro numberOfPairs é recebido e usado.
export function startGame(region: Region, customPokemonList?: Pokemon[], numberOfPairs: number = 8): Game { 
    const id = randomUUID();
    
    let basePokemonList: Pokemon[];
    
    if (region === 'custom') {
        // Se custom, usa customPokemonList
        if (!customPokemonList || customPokemonList.length < numberOfPairs) {
            throw new Error(`O modo personalizado requer pelo menos ${numberOfPairs} Pokémons.`);
        }
        // Limita a lista ao número de pares (8)
        basePokemonList = customPokemonList.slice(0, numberOfPairs); 

    } else {
        // Lógica para regiões padrão (kanto, johto, etc.)
        const regionalList = getPokemonsByRegion(region); 
        
        if (regionalList.length < numberOfPairs) {
            throw new Error(`A região ${region} não tem Pokémons suficientes (${regionalList.length}) para criar ${numberOfPairs} pares.`);
        }
        
        basePokemonList = getRandomSample(regionalList, numberOfPairs);
    }

    // Cria o deck com base na lista de Pokémons selecionada (8)
    const shuffledCards = createDeck(basePokemonList);

    const newGame: Game = {
        id,
        cards: shuffledCards,
        moves: 0,
    };
    
    games[id] = newGame;
    
    return newGame;
}

export function getGameState(id: string): Game | undefined {
    return games[id];
}


export function checkPair(gameId: string, cardIds: string[]): CheckPairSuccessResult | CheckPairErrorResult {
    const game = games[gameId];
    if (!game) return { error: "Jogo não encontrado" };
    
    const [cardId1, cardId2] = cardIds;
    const card1 = game.cards.find(c => c.id === cardId1);
    const card2 = game.cards.find(c => c.id === cardId2);

    if (!card1 || !card2 || card1.id === card2.id || card1.matched || card2.matched) {
        return { error: "Cartas inválidas, idênticas ou já combinadas" };
    }
    
    game.moves++; 
    card1.flipped = true;
    card2.flipped = true;
    
    const match = card1.pokemon === card2.pokemon;

    let message = match ? "Parabéns, é um par!" : "Não é um par, tente novamente.";

    if (match) {
        card1.matched = true;
        card2.matched = true;
        card1.flipped = false; 
        card2.flipped = false;
    }

    const isGameOver = game.cards.every(c => c.matched);
    
    return {
        match,
        moves: game.moves,
        message,
        isGameOver,
        cards: game.cards,
    };
}