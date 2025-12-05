import { Card, GameState, CheckPairResult } from './models';
import { checkPairApi } from './api';
import { showWinScreen, showError, hideLoading } from './ui';

const boardContainer = document.getElementById('board') as HTMLElement;
const movesDisplay = document.getElementById('moves') as HTMLElement;

let currentGameId: string = '';
let moves: number = 0;
let revealedCards: HTMLDivElement[] = [];
let lockBoard: boolean = false;

function createCardElement(card: Card): HTMLDivElement {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.dataset.id = card.id;

    if (card.matched) {
        cardElement.classList.add('matched');
        cardElement.classList.add('flipped');
    }

    cardElement.innerHTML = `
        <div class="card-inner">
            <div class="card-front">
                <img src="${card.imagem}" alt="${card.pokemon}">
            </div>
            <div class="card-back">?</div>
        </div>
    `;

    if (!card.matched) {
        cardElement.addEventListener('click', handleCardClick);
    }

    return cardElement;
}

function renderBoard(cards: Card[]): void {
    boardContainer.innerHTML = '';
    cards.forEach(card => {
        const cardElement = createCardElement(card);
        boardContainer.appendChild(cardElement);
    });
}

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

async function checkPair(): Promise<void> {
    const [card1Element, card2Element] = revealedCards;

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
            card1Element.classList.add('matched');
            card2Element.classList.add('matched');

            card1Element.removeEventListener('click', handleCardClick);
            card2Element.removeEventListener('click', handleCardClick);
        } else {
            await new Promise(resolve => setTimeout(resolve, 1000));

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

        card1Element?.classList.remove('flipped');
        card2Element?.classList.remove('flipped');

        revealedCards = [];
        lockBoard = false;
    }
}

export function initGameFromBackendState(gameState: GameState): void {
    currentGameId = gameState.id;
    moves = gameState.moves;
    movesDisplay.textContent = moves.toString();
    revealedCards = [];
    lockBoard = false;

    renderBoard(gameState.cards);
}


export function resetGameState(): void {
    currentGameId = '';
    moves = 0;
    movesDisplay.textContent = '0';
    revealedCards = [];
    lockBoard = false;
    boardContainer.innerHTML = '';
}

export function resetGame(): void {
    resetGameState();
}
