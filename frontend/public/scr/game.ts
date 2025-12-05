import { Card, GameState, CheckPairResult } from './models';
import { checkPairApi } from './api';
import { showWinScreen, showError, hideLoading, stopTimer } from './ui'; // stopTimer incluído

const boardContainer = document.getElementById('board') as HTMLElement;
const movesDisplay = document.getElementById('moves') as HTMLElement;

let currentGameId: string = '';
let moves: number = 0;
let revealedCards: HTMLDivElement[] = [];
let lockBoard: boolean = false;

/**
 * Cria o elemento HTML para uma carta.
 * @param card O objeto Card com dados do Pokémon.
 * @returns O elemento div representando a carta no tabuleiro.
 */
function createCardElement(card: Card): HTMLDivElement {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.dataset.id = card.id;

    // Garante que cartas já combinadas ou viradas por estado de backend sejam renderizadas corretamente
    if (card.matched) {
        cardElement.classList.add('matched');
        cardElement.classList.add('flipped');
    } else if (card.flipped) {
        cardElement.classList.add('flipped');
    }

    cardElement.innerHTML = `
        <div class="card-inner">
            <div class="card-front">
                <img src="${card.imagem}" alt="${card.pokemon}">
            </div>
            <div class="card-back"><span class="pokemon-logo">?</span></div>
        </div>
    `;

    cardElement.addEventListener('click', handleCardClick);
    return cardElement;
}

/**
 * Renderiza o tabuleiro do jogo com base na lista de cartas.
 * @param cards A lista de cartas a serem exibidas.
 */
function renderBoard(cards: Card[]): void {
    boardContainer.innerHTML = '';
    
    // MODIFICADO: Lógica de layout dinâmico para os novos tamanhos (8, 16, 32, 72, 144 cartas)
    const totalCards = cards.length;
    let columns = 4; // Padrão

    if (totalCards === 8) { // 4 pares
        columns = 4; // 4x2
    } else if (totalCards === 16) { // 8 pares
        columns = 4; // 4x4
    } else if (totalCards === 32) { // 16 pares
        columns = 8; // 8x4
    } else if (totalCards === 72) { // 36 pares
        columns = 9; // 9x8 (ou 8x9, dependendo do CSS)
    } else if (totalCards === 144) { // 72 pares
        columns = 12; // 12x12
    }

    boardContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    // FIM MODIFICADO

    cards.forEach(card => {
        boardContainer.appendChild(createCardElement(card));
    });
}


/**
 * Manipula o clique em uma carta.
 * @param event O evento de clique.
 */
function handleCardClick(event: Event): void {
    const cardElement = event.currentTarget as HTMLDivElement;

    if (lockBoard || cardElement.classList.contains('matched') || cardElement.classList.contains('flipped')) {
        return;
    }

    cardElement.classList.add('flipped');
    revealedCards.push(cardElement);

    if (revealedCards.length === 2) {
        lockBoard = true;
        checkMatch();
    }
}

/**
 * Verifica se as duas cartas reveladas correspondem.
 */
async function checkMatch(): Promise<void> {
    const [card1Element, card2Element] = revealedCards;
    const cardIds = [card1Element.dataset.id!, card2Element.dataset.id!];

    try {
        const result: CheckPairResult = await checkPairApi(currentGameId, cardIds);
        
        moves = result.moves;
        movesDisplay.textContent = moves.toString();

        if (result.match) {
            // Se for um acerto, adiciona a classe 'matched'
            card1Element.classList.add('matched');
            card2Element.classList.add('matched');
            
            // Remove as classes de feedback temporário se houver (opcional)
            card1Element.classList.remove('mismatch');
            card2Element.classList.remove('mismatch');
        } else {
            // Se for erro, adiciona classe 'mismatch' e depois desvira
            card1Element.classList.add('mismatch');
            card2Element.classList.add('mismatch');
            
            // Espera um momento para o usuário ver o erro
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            card1Element.classList.remove('mismatch');
            card2Element.classList.remove('mismatch');
            
            card1Element.classList.remove('flipped');
            card2Element.classList.remove('flipped');
        }

        revealedCards = [];
        lockBoard = false;

        if (result.isGameOver) {
            stopTimer(); // NOVO: Para o timer quando o jogo é ganho (match final)
            showWinScreen(moves);
        }

    } catch (error) {
        console.error("Erro na jogada:", error);
        showError('Erro de comunicação com o servidor durante a jogada.');

        // Garante que as cartas desvirem em caso de erro de API
        card1Element?.classList.remove('flipped');
        card2Element?.classList.remove('flipped');

        revealedCards = [];
        lockBoard = false;
    }
}

/**
 * Inicializa o estado do frontend com o estado recebido do backend.
 * @param gameState O estado inicial do jogo.
 */
export function initGameFromBackendState(gameState: GameState): void {
    currentGameId = gameState.id;
    moves = gameState.moves;
    movesDisplay.textContent = moves.toString();
    revealedCards = [];
    lockBoard = false;

    renderBoard(gameState.cards);
}

/**
 * Reinicia as variáveis de estado do frontend.
 */
export function resetGameState(): void {
    currentGameId = '';
    moves = 0;
    movesDisplay.textContent = '0';
    revealedCards = [];
    lockBoard = false;
    boardContainer.innerHTML = '';
}