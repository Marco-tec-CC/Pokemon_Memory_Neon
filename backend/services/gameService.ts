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
    
    // ALTERAÇÃO: Mudar de 8 para 18 Pokémons para jogo personalizado
    if (customPokemonList && customPokemonList.length >= 18) {
        basePokemonList = customPokemonList.slice(0, 18); // Limita aos primeiros 18
    } else {
        const regionalList = getPokemonsByRegion(region);
        
        // ALTERAÇÃO: Mudar de 8 para 18 na verificação de Pokémons insuficientes
        if (regionalList.length < 18) {
            throw new Error(`A região ${region} não tem Pokémons suficientes para iniciar o jogo.`);
        }
        
        // ALTERAÇÃO: Mudar de 8 para 18 na seleção de amostra aleatória
        basePokemonList = getRandomSample(regionalList, 18);
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

    let message = match ? "Parabéns, é um par!" : "Não é um par, tente novamente.";

    if (match) {
        card1.matched = true;
        card2.matched = true;
        card1.flipped = false; // Reset flip state after match is confirmed
        card2.flipped = false;
    }

    // A condição de fim de jogo é: todas as cartas estão marcadas como 'matched'
    const isGameOver = game.cards.every(c => c.matched);
    
    // Se não for um par, o frontend se encarregará de virar as cartas
    // Se for um par, as cartas são atualizadas no frontend via 'cards'
    
    return { 
        match, 
        moves: game.moves, 
        message, 
        isGameOver,
        // Retorna apenas as cartas que foram alteradas no estado (viradas ou combinadas)
        cards: [card1, card2] 
    };
}

// Em um jogo real, você teria uma função para limpar jogos antigos
// export function cleanupGame(id: string): void { delete games[id]; }