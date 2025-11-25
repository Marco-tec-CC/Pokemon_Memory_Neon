// helpers.ts

import { Card } from "../models/gameModel";
import { randomUUID } from "crypto";
// IMPORTAÇÃO CRÍTICA: Importa o array de Pokémons COM as URLs de imagem
import { pokemons as availablePokemons } from "../models/gameModel"; 

/**
 * Cria o baralho do Jogo da Memória.
 * @returns {Card[]} Um array de cartas pronto para o jogo.
 */
export function createDeck(): Card[] {
    const deck: Card[] = [];
    
    // Usamos os primeiros 8 Pokémons definidos no gameModel.ts
    const cardsToUse = availablePokemons.slice(0, 8); 

    // Duplica cada Pokémon e cria as cartas, incluindo o campo 'imagem'
    cardsToUse.forEach(p => {
        const baseCard = { 
            pokemon: p.nome,       
            imagem: p.imagem,      // <--- CAMPO ESSENCIAL INCLUÍDO!
            flipped: false, 
            matched: false 
        };

        // Adiciona o par com IDs únicos (UUIDs)
        deck.push({ id: randomUUID(), ...baseCard });
        deck.push({ id: randomUUID(), ...baseCard });
    });
    
    // Embaralha o deck
    return deck.sort(() => Math.random() - 0.5);
}