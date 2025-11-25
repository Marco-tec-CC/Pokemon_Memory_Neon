"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeck = createDeck;
const crypto_1 = require("crypto");
const pokemons = [
    "pikachu", "bulbasaur", "charmander", "squirtle",
    "eevee", "jigglypuff", "snorlax", "mewtwo",
    "psyduck", "meowth", "chikorita", "totodile",
    "cyndaquil", "togepi", "machop", "geodude",
    "lapras", "vulpix", "abra", "gengar"
];
function createDeck() {
    const deck = [];
    pokemons.forEach(p => {
        deck.push({ id: (0, crypto_1.randomUUID)(), pokemon: p, flipped: false, matched: false });
        deck.push({ id: (0, crypto_1.randomUUID)(), pokemon: p, flipped: false, matched: false });
    });
    return deck.sort(() => Math.random() - 0.5);
}
