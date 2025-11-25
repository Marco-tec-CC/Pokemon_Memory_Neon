// ARQUIVO: front.ts (FINAL, COMPLETO E CORRIGIDO)

interface Pokemon {
    id: number;
    nome: string;
    imagem: string;
}

const API_URL = 'http://localhost:3000/api/scores'; 

// =========================
// REFERÊNCIAS DO DOM
// =========================
const gameGrid = document.getElementById("game") as HTMLDivElement;
const movesText = document.getElementById("moves") as HTMLSpanElement;
const restartBtn = document.getElementById("restart") as HTMLButtonElement;

let cards: HTMLDivElement[] = [];
let revealedCards: HTMLDivElement[] = [];
let moves = 0;
let lockBoard = false;

// =========================
// LISTA DE POKEMONS EXEMPLO
// =========================
const pokemons: Pokemon[] = [
    { id: 1, nome: "Bulbasaur", imagem: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png" },
    { id: 4, nome: "Charmander", imagem: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png" },
    { id: 7, nome: "Squirtle", imagem: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png" },
    { id: 25, nome: "Pikachu", imagem: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" },
    { id: 39, nome: "Jigglypuff", imagem: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png" },
    { id: 52, nome: "Meowth", imagem: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png" },
];

// =========================
// DUPLICA E EMBARALHA
// =========================
function shuffleArray<T>(array: T[]): T[] {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function createCards() {
    const duplicated = [...pokemons, ...pokemons];
    const shuffled = shuffleArray(duplicated);

    gameGrid.innerHTML = "";
    cards = [];

    shuffled.forEach((pokemon) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.pokemonId = pokemon.id.toString(); 

        // CORREÇÃO ESTRUTURAL: Inclusão de .card-inner e .pokemon-name
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-face card-front"></div> 
                <div class="card-face card-back">
                    <img src="${pokemon.imagem}" alt="${pokemon.nome}">
                    <span class="pokemon-name">${pokemon.nome}</span>
                </div>
            </div>
        `;

        // CORREÇÃO LÓGICA: Passando revealCard diretamente
        card.addEventListener("click", revealCard);

        cards.push(card);
        gameGrid.appendChild(card);
    });
}

// =========================
// LÓGICA DE REVELAR CARTA
// =========================
function revealCard(event: Event) { // <-- Aceita o evento de clique
    const card = event.currentTarget as HTMLDivElement;
    
    if (lockBoard) return;
    if (card.classList.contains("revealed") || card.classList.contains("matched")) return;

    card.classList.add("revealed");
    revealedCards.push(card);

    if (revealedCards.length === 2) {
        lockBoard = true;
        moves++;
        movesText.textContent = moves.toString();
        
        checkMatch();
    }
}

// =========================
// VERIFICAR COMBINAÇÃO
// =========================
function checkMatch() {
    if (revealedCards.length < 2) {
        resetBoard(false);
        return;
    }
    
    const [card1, card2] = revealedCards;

    if (!card1 || !card2 || !card1.dataset.pokemonId || !card2.dataset.pokemonId) {
         resetBoard(false);
         return;
    }

    const isMatch = card1.dataset.pokemonId === card2.dataset.pokemonId;

    if (isMatch) {
        card1.classList.add("matched");
        card2.classList.add("matched");
        
        // CORREÇÃO LÓGICA: Remove o listener usando a referência direta
        card1.removeEventListener("click", revealCard);
        card2.removeEventListener("click", revealCard);
        
        resetBoard(true);
        checkWin(); // Chama o verificador de vitória (que chama a API)
    } else {
        setTimeout(() => {
            card1.classList.remove("revealed");
            card2.classList.remove("revealed");
            resetBoard(false);
        }, 1200);
    }
}

// =========================
// RESETAR ESTADO DO TABULEIRO
// =========================
function resetBoard(isMatch: boolean) {
    revealedCards = [];
    lockBoard = false;
}

// =========================
// FUNÇÃO DE COMUNICAÇÃO COM O BACKEND
// =========================
async function sendScoreToApi(finalMoves: number) {
    console.log(`Tentando enviar score: ${finalMoves} para ${API_URL}`);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                moves: finalMoves,
            }),
        });

        if (!response.ok) {
            console.error(`Status HTTP: ${response.status}`);
            throw new Error(`Erro ao salvar score: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Score salvo com sucesso na API:', result);

    } catch (error) {
        console.error('Falha na comunicação com a API (Verifique CORS/Backend):', error);
    }
}


// =========================
// VERIFICAR VITÓRIA (CHAMA A API)
// =========================
function checkWin() {
    const matchedCards = cards.filter(card => card.classList.contains('matched'));
    
    if (matchedCards.length === cards.length) {
        
        // CHAMA A API PARA SALVAR A PONTUAÇÃO
        sendScoreToApi(moves);
        
        setTimeout(() => {
            alert(`Parabéns! Você completou o Pokédex Memory Game em ${moves} movimentos!`);
        }, 500);
    }
}


// =========================
// REINICIAR JOGO
// =========================
restartBtn.addEventListener("click", () => {
    gameGrid.classList.add('hide'); 
    
    setTimeout(() => {
        moves = 0;
        movesText.textContent = "0";
        revealedCards = [];
        lockBoard = false;
        createCards();
        gameGrid.classList.remove('hide');
    }, 300); 
});


// =========================
// INICIAR JOGO
// =========================
createCards();