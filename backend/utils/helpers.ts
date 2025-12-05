import { Card, Pokemon, pokemons as allPokemons, Region } from "../models/gameModel";
import { randomUUID } from "crypto";

function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function getRandomSample<T>(array: T[], count: number): T[] {
    if (array.length < count) {
        throw new Error("O array não tem elementos suficientes para a amostra solicitada.");
    }
    const shuffledCopy = [...array];
    shuffleArray(shuffledCopy);
    return shuffledCopy.slice(0, count);
}

export function getPokemonsByRegion(region: Region): Pokemon[] {
    const regionName = region.toString().toLowerCase();
    
    let startIndex: number;
    let endIndex: number;

    switch (regionName) {
        case "kanto":
            startIndex = 0;
            endIndex = 151;
            break;
        case "johto":
            startIndex = 151;
            endIndex = 251;
            break;
        case "hoenn":
            startIndex = 251;
            endIndex = 386;
            break;
        case "sinnoh":
            startIndex = 386;
            endIndex = 493;
            break;
        default:
            throw new Error(`Região desconhecida: ${region}.`);
    }

    if (endIndex > allPokemons.length) {
        throw new Error(`Dados de Pokémons insuficientes! Sua lista de Pokémons tem apenas ${allPokemons.length} itens. Para a região ${region} você precisa de pelo menos ${endIndex} Pokémons.`);
    }

    return allPokemons.slice(startIndex, endIndex);
}

export function createDeck(basePokemonList: Pokemon[]): Card[] {
    // ALTERAÇÃO: Mudar de 8 para 18 e atualizar a mensagem
    if (basePokemonList.length !== 18) {
        throw new Error("A lista de Pokémons deve ter exatamente 18 itens para criar o baralho de 36 cartas.");
    }
    
    const deck: Card[] = [];
    
    basePokemonList.forEach(p => {
        const baseCard = { 
            pokemon: p.nome, 
            imagem: p.imagem, 
            flipped: false, 
            matched: false 
        };
        
        // Cria duas cartas para cada Pokémon
        deck.push({ ...baseCard, id: randomUUID() });
        deck.push({ ...baseCard, id: randomUUID() });
    });
    
    return shuffleArray(deck);
}