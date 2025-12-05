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

export function startGame(region: Region, customPokemonList?: Pokemon[]): Game { 
    const id = randomUUID();
    
    let basePokemonList: Pokemon[];
    
    if (customPokemonList && customPokemonList.length >= 8) {
        basePokemonList = customPokemonList.slice(0, 8);
    } else {
        const regionalList = getPokemonsByRegion(region);
        
        if (regionalList.length < 8) {
            throw new Error(`A região ${region} não tem Pokémons suficientes para iniciar o jogo.`);
        }
        
        basePokemonList = getRandomSample(regionalList, 8);
    }

    const shuffledCards = createDeck(basePokemonList);
    
    const newGame: Game = { 
        id, 
        cards: shuffledCards,
        moves: 0 
    };
    
    games[id] = newGame;
    return newGame; 
}

export function getGameState(id: string): Game | null {
    return games[id] || null;
}

export function checkPair(gameId: string, cardIds: string[]): CheckPairSuccessResult | { error: string } {
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

    if (match) {
        card1.matched = true;
        card2.matched = true;
    }
    
    const isGameOver = game.cards.every(c => c.matched);
    
    return {
        match,
        moves: game.moves,
        message: match ? 'Par encontrado!' : 'Não é um par.',
        isGameOver,
        cards: game.cards
    };
}
