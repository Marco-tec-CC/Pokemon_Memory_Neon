// helpers.ts

import { Card } from "../models/gameModel";
import { randomUUID } from "crypto";
// ESSENCIAL: Importa o array de Pokémons COMPLETO (com nomes e URLs) do gameModel.ts
import { pokemons as availablePokemons } from "../models/gameModel"; 

/**
 * Cria o baralho do Jogo da Memória.
 */
export function createDeck(): Card[] {
    const deck: Card[] = [];
    
    // =====================================================================
    // AJUSTE CRÍTICO: Mude este número '20' para definir o número de Pokémons ÚNICOS 
    // que farão parte do jogo (multiplique por 2 para ter o número total de cartas).
    // Se você quer 30 Pokémons diferentes (60 cartas), mude para 30.
    // =====================================================================
    const numberOfUniquePokemon = 20; 
    
    // Seleciona os N primeiros Pokémons da lista de Kanto
    const cardsToUse = availablePokemons.slice(0, numberOfUniquePokemon); 
    
    // Se quiser usar todos os Pokémons disponíveis, remova o .slice() e comente a linha acima:
    // const cardsToUse = availablePokemons; 

    // Duplica cada Pokémon e cria as cartas com o estado inicial
    cardsToUse.forEach(p => {
        const baseCard = { 
            pokemon: p.nome,      
            imagem: p.imagem,     // <--- A URL da imagem é passada aqui!
            flipped: false, 
            matched: false 
        };

        // Adiciona o par
        deck.push({ id: randomUUID(), ...baseCard });
        deck.push({ id: randomUUID(), ...baseCard });
    });
    
    // Embaralha o deck
    return deck.sort(() => Math.random() - 0.5);
}