// ARQUIVO: front.ts (FINAL, COMPLETO E CORRIGIDO)
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var API_URL = 'http://localhost:3000/api/scores';
// =========================
// REFERÊNCIAS DO DOM
// =========================
var gameGrid = document.getElementById("game");
var movesText = document.getElementById("moves");
var restartBtn = document.getElementById("restart");
var cards = [];
var revealedCards = [];
var moves = 0;
var lockBoard = false;
// =========================
// LISTA DE POKEMONS EXEMPLO
// =========================
var pokemons = [
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
function shuffleArray(array) {
    var _a;
    var arr = array.slice();
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [arr[j], arr[i]], arr[i] = _a[0], arr[j] = _a[1];
    }
    return arr;
}
function createCards() {
    var duplicated = __spreadArray(__spreadArray([], pokemons, true), pokemons, true);
    var shuffled = shuffleArray(duplicated);
    gameGrid.innerHTML = "";
    cards = [];
    shuffled.forEach(function (pokemon) {
        var card = document.createElement("div");
        card.classList.add("card");
        card.dataset.pokemonId = pokemon.id.toString();
        // CORREÇÃO ESTRUTURAL: Inclusão de .card-inner e .pokemon-name
        card.innerHTML = "\n            <div class=\"card-inner\">\n                <div class=\"card-face card-front\"></div> \n                <div class=\"card-face card-back\">\n                    <img src=\"".concat(pokemon.imagem, "\" alt=\"").concat(pokemon.nome, "\">\n                    <span class=\"pokemon-name\">").concat(pokemon.nome, "</span>\n                </div>\n            </div>\n        ");
        // CORREÇÃO LÓGICA: Passando revealCard diretamente
        card.addEventListener("click", revealCard);
        cards.push(card);
        gameGrid.appendChild(card);
    });
}
// =========================
// LÓGICA DE REVELAR CARTA
// =========================
function revealCard(event) {
    var card = event.currentTarget;
    if (lockBoard)
        return;
    if (card.classList.contains("revealed") || card.classList.contains("matched"))
        return;
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
    var card1 = revealedCards[0], card2 = revealedCards[1];
    if (!card1 || !card2 || !card1.dataset.pokemonId || !card2.dataset.pokemonId) {
        resetBoard(false);
        return;
    }
    var isMatch = card1.dataset.pokemonId === card2.dataset.pokemonId;
    if (isMatch) {
        card1.classList.add("matched");
        card2.classList.add("matched");
        // CORREÇÃO LÓGICA: Remove o listener usando a referência direta
        card1.removeEventListener("click", revealCard);
        card2.removeEventListener("click", revealCard);
        resetBoard(true);
        checkWin(); // Chama o verificador de vitória (que chama a API)
    }
    else {
        setTimeout(function () {
            card1.classList.remove("revealed");
            card2.classList.remove("revealed");
            resetBoard(false);
        }, 1200);
    }
}
// =========================
// RESETAR ESTADO DO TABULEIRO
// =========================
function resetBoard(isMatch) {
    revealedCards = [];
    lockBoard = false;
}
// =========================
// FUNÇÃO DE COMUNICAÇÃO COM O BACKEND
// =========================
function sendScoreToApi(finalMoves) {
    return __awaiter(this, void 0, void 0, function () {
        var response, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Tentando enviar score: ".concat(finalMoves, " para ").concat(API_URL));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(API_URL, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                moves: finalMoves,
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        console.error("Status HTTP: ".concat(response.status));
                        throw new Error("Erro ao salvar score: ".concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    console.log('Score salvo com sucesso na API:', result);
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('Falha na comunicação com a API (Verifique CORS/Backend):', error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// =========================
// VERIFICAR VITÓRIA (CHAMA A API)
// =========================
function checkWin() {
    var matchedCards = cards.filter(function (card) { return card.classList.contains('matched'); });
    if (matchedCards.length === cards.length) {
        // CHAMA A API PARA SALVAR A PONTUAÇÃO
        sendScoreToApi(moves);
        setTimeout(function () {
            alert("Parab\u00E9ns! Voc\u00EA completou o Pok\u00E9dex Memory Game em ".concat(moves, " movimentos!"));
        }, 500);
    }
}
// =========================
// REINICIAR JOGO
// =========================
restartBtn.addEventListener("click", function () {
    gameGrid.classList.add('hide');
    setTimeout(function () {
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
