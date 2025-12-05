import { Card, GameState, CheckPairResult } from './models';
import { checkPairApi } from './api';
import { showWinScreen, showError, hideLoading } from './ui';

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

    if (!card.matched) {
        cardElement.addEventListener('click', handleCardClick);
    }

    return cardElement;
}

/**
 * Renderiza todas as cartas no tabuleiro com base no estado do jogo.
 * @param cards A lista de cartas a serem renderizadas.
 */
function renderBoard(cards: Card[]): void {
    boardContainer.innerHTML = '';
    
    // Calcula a classe de layout para garantir responsividade, embora o CSS trate 6x6
    const numCards = cards.length;
    let gridClass = 'board-6x6'; // Padrão
    if (numCards === 16) gridClass = 'board-4x4';
    if (numCards === 20) gridClass = 'board-4x5';
    if (numCards === 24) gridClass = 'board-4x6';
    // Você precisaria adicionar estilos no style.css para essas outras classes de board

    boardContainer.className = ''; // Limpa classes antigas
    boardContainer.classList.add('board');
    // boardContainer.classList.add(gridClass); // Descomente se for adicionar layouts dinâmicos no CSS

    cards.forEach(card => {
        const cardElement = createCardElement(card);
        boardContainer.appendChild(cardElement);
    });
}

/**
 * Manipula o clique em uma carta.
 * @param event O evento de clique.
 */
function handleCardClick(event: Event): void {
    if (lockBoard) return;

    const clickedCard = event.currentTarget as HTMLDivElement;

    if (clickedCard.classList.contains('flipped') || clickedCard.classList.contains('matched')) {
        return;
    }

    clickedCard.classList.add('flipped');
    revealedCards.push(clickedCard);

    if (revealedCards.length === 2) {
        lockBoard = true;
        checkPair();
    }
}

/**
 * Envia o par de cartas viradas para o backend e processa o resultado.
 */
async function checkPair(): Promise<void> {
    const [card1Element, card2Element] = revealedCards;

    // Checagem de segurança, caso algo inesperado aconteça
    if (!card1Element || !card2Element) {
        revealedCards = [];
        lockBoard = false;
        return;
    }

    const cardIds = [card1Element.dataset.id!, card2Element.dataset.id!];

    try {
        const result: CheckPairResult = await checkPairApi(currentGameId, cardIds);

        moves = result.moves;
        movesDisplay.textContent = moves.toString();

        if (result.match) {
            // Se houver acerto (Match)
            card1Element.classList.add('matched');
            card2Element.classList.add('matched');

            // Remove o listener para que não possam ser clicadas novamente
            card1Element.removeEventListener('click', handleCardClick);
            card2Element.removeEventListener('click', handleCardClick);
            
        } else {
            // Se não houver acerto (Mismatch)
            
            // 💡 NOVO: Adiciona a classe visual de erro (mismatch)
            card1Element.classList.add('mismatch');
            card2Element.classList.add('mismatch');
            
            // Espera 1 segundo com a animação de erro
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Remove a classe visual de erro e desvira as cartas
            card1Element.classList.remove('mismatch');
            card2Element.classList.remove('mismatch');
            
            card1Element.classList.remove('flipped');
            card2Element.classList.remove('flipped');
        }

        revealedCards = [];
        lockBoard = false;

        if (result.isGameOver) {
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

/**
 * Função exportada para resetar o jogo, mantida para compatibilidade com o ui.ts
 */
export function resetGame(): void {
    resetGameState();
}