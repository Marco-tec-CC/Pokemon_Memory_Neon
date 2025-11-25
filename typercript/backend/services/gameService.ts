// gameService.ts

import { randomUUID } from "crypto";
// Certifique-se de que os caminhos para o Model e Helpers estão corretos
import { Card, Game } from "../models/gameModel"; 
import { createDeck } from "../utils/helpers"; 

// ===========================================
// 1. PERSISTÊNCIA: Armazenamento em memória
// ===========================================
// O objeto 'games' armazena o estado de todos os jogos ativos por ID.
const games: Record<string, Game> = {};


// ===========================================
// 2. INÍCIO DE JOGO (POST /game/start)
// ===========================================
/**
 * Inicia um novo jogo e retorna o estado inicial COMPLETO.
 * @returns {Game} O estado inicial do jogo (ID, cartas e movimentos).
 */
export function startGame(): Game { 
  const id = randomUUID();
  
  // createDeck() deve selecionar, duplicar, tipar e embaralhar as cartas.
  const shuffledCards = createDeck();
  
  const newGame: Game = { 
      id, 
      cards: shuffledCards,
      moves: 0 
  };
  
  games[id] = newGame;
  
  // Retorna o objeto Game COMPLETO para o Frontend renderizar.
  return newGame; 
}


// ===========================================
// 3. BUSCAR ESTADO (GET /game/state/:id)
// ===========================================
/**
 * Busca o estado de um jogo pelo seu ID.
 */
export function getGameState(id: string): Game | null {
  return games[id] || null;
}


// ===========================================
// 4. LÓGICA DE MOVIMENTO (POST /game/check)
// ===========================================
/**
 * Processa a tentativa de virar um par de cartas.
 * @param gameId O ID do jogo.
 * @param cardIds Array contendo os IDs das duas cartas viradas.
 * @returns {object} O resultado do movimento.
 */
export function checkPair(gameId: string, cardIds: string[]): { match: boolean; moves: number; message: string; isGameOver: boolean; } | { error: string } {
  const game = games[gameId];
  if (!game) return { error: "Jogo não encontrado" };
  
  const [cardId1, cardId2] = cardIds;
  const card1 = game.cards.find(c => c.id === cardId1);
  const card2 = game.cards.find(c => c.id === cardId2);

  // Verificação de validade básica
  if (!card1 || !card2 || card1.id === card2.id || card1.matched || card2.matched) {
      return { error: "Cartas inválidas, idênticas ou já combinadas" };
  }
  
  // 1. Incrementa o movimento e marca como viradas no estado do Back-end
  game.moves++; 
  card1.flipped = true;
  card2.flipped = true;
  
  const match = card1.pokemon === card2.pokemon;

  if (match) {
      // 2. Se for par: Marca como combinadas (permanente)
      card1.matched = true;
      card2.matched = true;
  } else {
      // 3. Se NÃO for par: Vira de volta no estado do Back-end
      // O Frontend lida com o tempo de visualização, mas o Back-end define o estado final.
      card1.flipped = false; 
      card2.flipped = false; 
  }

  // 4. Verifica o fim de jogo
  const totalCards = game.cards.length;
  const matchedCount = game.cards.filter(c => c.matched).length;
  const isGameOver = matchedCount === totalCards;
  
  return { 
      match, 
      moves: game.moves, 
      message: match ? "É um par!" : "Não é um par, tente novamente.",
      isGameOver
  };
}

// Nota: A função 'flipCard' do seu código original foi removida, 
// pois sua lógica foi integrada diretamente no 'checkPair' para simplificar a API.