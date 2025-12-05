"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.startGame = startGame;
exports.getGameState = getGameState;
exports.flipCard = flipCard;
exports.checkPair = checkPair;
exports.endGame = endGame;
const gameService = __importStar(require("../services/gameService"));
function startGame(req, res) {
    const game = gameService.startGame();
    res.json(game);
}
function getGameState(req, res) {
    const game = gameService.getGameState(req.params.id);
    if (!game)
        return res.status(404).json({ error: "Jogo não encontrado" });
    res.json(game);
}
function flipCard(req, res) {
    const { gameId, cardId } = req.body;
    const result = gameService.flipCard(gameId, cardId);
    if ("error" in result)
        return res.status(400).json(result);
    res.json(result);
}
function checkPair(req, res) {
    const { gameId, cardIds } = req.body;
    const result = gameService.checkPair(gameId, cardIds);
    res.json(result);
}
function endGame(req, res) {
    const { gameId } = req.body;
    const result = gameService.endGame(gameId);
    res.json(result);
}
