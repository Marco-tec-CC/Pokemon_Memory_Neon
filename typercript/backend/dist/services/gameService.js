"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startGame = startGame;
exports.getGameState = getGameState;
exports.flipCard = flipCard;
exports.checkPair = checkPair;
exports.endGame = endGame;
const helpers_1 = require("../utils/helpers");
const crypto_1 = require("crypto");
const games = {};
function startGame() {
    const id = (0, crypto_1.randomUUID)();
    games[id] = { id, cards: (0, helpers_1.createDeck)(), moves: 0 };
    return { gameId: id };
}
function getGameState(id) {
    return games[id] || null;
}
function flipCard(gameId, cardId) {
    const game = games[gameId];
    if (!game)
        return { error: "Jogo não encontrado" };
    const card = game.cards.find(c => c.id === cardId);
    if (!card)
        return { error: "Carta não encontrada" };
    if (card.flipped || card.matched)
        return { error: "Carta já virada ou combinada" };
    card.flipped = true;
    game.moves++;
    return { message: "Carta virada", card };
}
function checkPair(gameId, cardIds) {
    const game = games[gameId];
    if (!game)
        return { error: "Jogo não encontrado" };
    const [card1, card2] = cardIds.map(id => game.cards.find(c => c.id === id));
    if (!card1 || !card2)
        return { error: "Cartas inválidas" };
    if (card1.pokemon === card2.pokemon) {
        card1.matched = true;
        card2.matched = true;
        return { match: true, message: "É um par!" };
    }
    else {
        card1.flipped = false;
        card2.flipped = false;
        return { match: false, message: "Não é par!" };
    }
}
function endGame(gameId) {
    const game = games[gameId];
    if (!game)
        return { error: "Jogo não encontrado" };
    const allMatched = game.cards.every(c => c.matched);
    return { finished: allMatched, moves: game.moves, message: allMatched ? "Parabéns, você terminou o jogo!" : "Ainda faltam pares!" };
}
