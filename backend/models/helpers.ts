import { Card } from "../models/gameModel";
import { randomUUID } from "crypto";
import { pokemons as availablePokemons } from "../models/gameModel";

export function createDeck(): Card[] {
    const deck: Card[] = [];
    const cardsToUse = availablePokemons.slice(0, 8);

    cardsToUse.forEach(p => {
        const baseCard = { 
            pokemon: p.nome,
            imagem: p.imagem,
            flipped: false,
            matched: false
        };

        deck.push({ id: randomUUID(), ...baseCard });
        deck.push({ id: randomUUID(), ...baseCard });
    });

    return deck.sort(() => Math.random() - 0.5);
}
