import { startNewGameApi } from './api';
import { Region, PokemonList, Pokemon } from './models';
import * as game from './game';

import { initGameFromBackendState } from './game'; 


const screenElements: Record<string, HTMLElement | null> = {
    selection: document.getElementById('region-selection'),
    custom: document.getElementById('custom-creation'),
    game: document.getElementById('game-board'),
    win: document.getElementById('win-screen'),
};
const panelElement = document.getElementById('panel') as HTMLElement;


const loadingOverlay = document.getElementById('loading-overlay') as HTMLDivElement;
const errorMessageDisplay = document.getElementById('error-message') as HTMLDivElement;
const errorText = errorMessageDisplay.querySelector('p') as HTMLParagraphElement;


const pokemonInputsContainer = document.getElementById('pokemon-inputs-container') as HTMLDivElement;
const startCustomButton = document.getElementById('start-custom-button') as HTMLButtonElement;
// ALTERAÇÃO CARTA 1: Mudar o nome para refletir que é o mínimo necessário.
const MIN_REQUIRED_POKEMON = 8;


// NOVOS ELEMENTOS DO MODO RÁPIDO
const timerCountdownDisplay = document.getElementById('timer-countdown') as HTMLElement;
const stageDisplayContainer = document.getElementById('stage-display') as HTMLElement;
const currentStageDisplay = document.getElementById('current-stage') as HTMLElement;

// CORRIGIDO: CONSTANTES DO MODO RÁPIDO COM APENAS 1 FASE
const QUICK_MATCH_STAGES: { pairs: number; timeLimitSeconds: number }[] = [
    { pairs: 4, timeLimitSeconds: 180 },   // Fase Única: 4 pares (8 cartas) com 180s (3 minutos)
];
const TOTAL_STAGES = QUICK_MATCH_STAGES.length; // Agora será 1

// VARIÁVEIS DE ESTADO DO MODO RÁPIDO
let isQuickMatch: boolean = false;
let currentStageIndex: number = 0;
let timer: number | null = null;
let countdownInterval: number | null = null;


let currentRegion: Region = 'kanto'; 
let customPokemonList: PokemonList = []; 


export function showScreen(screenName: 'selection' | 'custom' | 'game' | 'win'): void {

    Object.values(screenElements).forEach(element => {
        if (element) {
            element.classList.add('hidden');
        }
    });


    panelElement.classList.toggle('hidden', screenName !== 'game');

    const targetElement = screenElements[screenName];
    if (targetElement) {
        targetElement.classList.remove('hidden');
    }
}

export function showLoading(message: string = 'Carregando Pokémons...'): void {
    errorText.textContent = '';
    errorMessageDisplay.classList.add('hidden');
    loadingOverlay.classList.remove('hidden');
    document.getElementById('loading-message')!.textContent = message;
}

export function hideLoading(): void {
    loadingOverlay.classList.add('hidden');
}

export function showError(message: string): void {
    hideLoading();
    // Exibe a mensagem de erro sobre a tela de seleção
    showScreen('selection'); 
    errorText.textContent = `🚨 Erro: ${message}`;
    errorMessageDisplay.classList.remove('hidden');
}


// NOVO: Função para formatar o tempo em MM:SS
function formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// NOVO: Função para parar o timer (EXPORTADA para ser usada por game.ts)
export function stopTimer(): void {
    if (countdownInterval !== null) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

// NOVO: Lida com o tempo esgotado na Partida Rápida
function handleTimeOut(): void {
    stopTimer();
    showError('Tempo Esgotado! O Desafio Rápido Terminou.');
    resetGame(); 
}


// NOVO: Função para iniciar o contador regressivo
function startTimer(numberOfPairs: number): void {
    const stage = QUICK_MATCH_STAGES.find(s => s.pairs === numberOfPairs);
    if (!stage) return;

    // Garante que a exibição da fase e do timer estão visíveis
    stageDisplayContainer?.classList.remove('hidden');
    if (currentStageDisplay) {
        // Exibe 1/1 para indicar fase única
        currentStageDisplay.textContent = `${currentStageIndex + 1}/${TOTAL_STAGES} (${numberOfPairs} Pares)`;
    }

    // Reinicia o timer
    stopTimer();
    timer = stage.timeLimitSeconds;
    if (timerCountdownDisplay) {
        timerCountdownDisplay.textContent = formatTime(timer);
    }

    countdownInterval = setInterval(() => {
        if (timer !== null) {
            timer--;
            if (timerCountdownDisplay) {
                timerCountdownDisplay.textContent = formatTime(timer);
            }

            if (timer <= 0) {
                clearInterval(countdownInterval as number);
                countdownInterval = null;
                timer = null;
                handleTimeOut();
            }
        }
    }, 1000) as unknown as number; 
}


// NOVO: Inicia a fase única da Partida Rápida
function startQuickMatchStage(): void {
    const stage = QUICK_MATCH_STAGES[currentStageIndex];
    // O stage.pairs será 4
    startGame('kanto', undefined, stage.pairs); 
}

// NOVO: Inicia a Partida Rápida
function startQuickMatch(): void {
    isQuickMatch = true;
    currentStageIndex = 0; // Sempre começa na Fase 1 (e única)
    startQuickMatchStage();
}

// NOVO: Função para avançar para a próxima fase (Mantida, mas levará diretamente para a vitória)
export function advanceQuickMatchStage(): void {
    stopTimer(); // Para o timer da fase atual
    currentStageIndex++; // Tenta avançar
    
    // Como TOTAL_STAGES é 1, esta condição será falsa, e o jogo terminará.
    if (currentStageIndex < TOTAL_STAGES) {
        startQuickMatchStage(); 
    } else {
        // Fim do Desafio Rápido - chama a tela de vitória final
        showWinScreen(0); 
    }
}


// MODIFICADO: showWinScreen para lidar com o modo rápido
export function showWinScreen(finalMoves: number): void {
    
    stopTimer(); // Garante que o timer pare.

    // A lógica de transição intermediária é desativada, pois só há uma fase.
    // O finalMoves > 0 será o indicador de vitória para a fase única
    
    const winScreen = screenElements.win as HTMLElement;
    const finalMovesDisplay = document.getElementById('final-moves') as HTMLElement;
    
    // O isFinalQuickMatchWin será verdadeiro se isQuickMatch for verdadeiro (após a fase única) ou se finalMoves for 0 (chamado por advanceQuickMatchStage)
    const isQuickMatchWin = isQuickMatch; 
    
    if (finalMovesDisplay) {
        // Para a vitória final do Quick Match ou Jogo Normal
        finalMovesDisplay.textContent = finalMoves.toString();
        if (isQuickMatchWin && finalMoves === 0) {
             finalMovesDisplay.textContent = 'Desafio Concluído!';
        }
    }
        
    const winMessage = winScreen.querySelector('h2') as HTMLHeadingElement;
    if (winMessage) {
        winMessage.textContent = isQuickMatchWin
            ? `🎉 Partida Rápida Concluída! 🎉`
            : `🎉 Parabéns, Vencedor! 🎉`;
    }

    showScreen('win');
    
    // Reinicia o estado após o término da Partida Rápida
    if (isQuickMatch) {
        isQuickMatch = false; 
        currentStageIndex = 0;
    }
}


// MODIFICADO: Adiciona numberOfPairs opcional
export async function startGame(region: Region, customList?: PokemonList, numberOfPairs?: number): Promise<void> {
 
    try {
        showLoading(region === 'custom' ? 'Criando jogo personalizado...' : `Buscando Pokémons de ${region}...`);
        
        // ADICIONADO: Passa numberOfPairs para o backend
        const gameState = await startNewGameApi(region, customList, numberOfPairs);

     
        currentRegion = region; 
        customPokemonList = customList || [];

       
        game.initGameFromBackendState(gameState); 

       
        showScreen('game');

        // NOVO: Lógica do Timer e Fase Rápida
        if (isQuickMatch && numberOfPairs) {
            startTimer(numberOfPairs); 
        } else {
             // Limpa o estado da Partida Rápida se não estiver nela.
            isQuickMatch = false;
            stageDisplayContainer?.classList.add('hidden'); // Oculta a info da fase
            if (timerCountdownDisplay) timerCountdownDisplay.textContent = '--:--';
        }


    } catch (error) {
        console.error('Erro ao iniciar o jogo:', error);
     
        showError((error as Error).message || 'Falha na comunicação com o servidor. Verifique se o back-end está rodando.');
    } finally {
        hideLoading();
    }
}



export function restartCurrentGame(): void {

    game.resetGameState();
    
    // Se for partida rápida, inicia a fase atual novamente. Caso contrário, jogo normal.
    if (isQuickMatch) {
         startQuickMatchStage();
    } else {
        startGame(currentRegion, customPokemonList.length > 0 ? customPokemonList : undefined);
    }
}


// MODIFICADO: Inclui stopTimer e reset de estado do modo rápido
export function resetGame(): void {
 
    game.resetGameState();
    
    stopTimer(); // NOVO: Para o timer
    isQuickMatch = false; // NOVO: Reseta o estado
    currentStageIndex = 0; // NOVO: Reseta o estado

    showScreen('selection');

    currentRegion = 'kanto'; 
    customPokemonList = [];
    renderCustomInputs();
    hideLoading();
}


export function showCreateScreen(): void {
    showScreen('custom');
    if (customPokemonList.length === 0) {
        // ALTERAÇÃO CARTA 2: Usa MIN_REQUIRED_POKEMON para criar o mínimo de inputs
        for (let i = 0; i < MIN_REQUIRED_POKEMON; i++) {
            addPokemonInput(false); 
        }
    }
    renderCustomInputs();
}

export function startCustomGame(): void {
    // ALTERAÇÃO CARTA 3: Muda de '==' para '>=' (maior ou igual ao mínimo)
    if (customPokemonList.length >= MIN_REQUIRED_POKEMON && checkCustomInputs()) {
        startGame('custom', customPokemonList);
    }
}


export function addPokemonInput(updateListState: boolean = true): void {
    // ALTERAÇÃO CARTA 4: A condição de limite superior foi removida para permitir adições ilimitadas.
    // if (customPokemonList.length < MAX_CUSTOM_POKEMON) {
    const newPokemon: Pokemon = {
        id: customPokemonList.length + 1,
        nome: '',
        imagem: '',
    };
    customPokemonList.push(newPokemon);
    if (updateListState) {
        renderCustomInputs();
    }
}

export function removePokemonInput(index: number): void {
    // ALTERAÇÃO CARTA 5: Permite remover apenas se o total for maior que o mínimo exigido
    if (customPokemonList.length > MIN_REQUIRED_POKEMON) {
        customPokemonList.splice(index, 1);
        customPokemonList.forEach((p, i) => p.id = i + 1); // Reajusta IDs
        renderCustomInputs();
    }
}

export function updateCustomPokemon(index: number, field: keyof Pokemon, value: string): void {
    const pokemon = customPokemonList[index];
    if (pokemon) {
        (pokemon[field] as string) = value; 
        updateCustomButtonState();
    }
}

function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

function checkCustomInputs(): boolean {
    const isValid = customPokemonList.every(p => 
        p.nome.trim() !== '' && 
        p.imagem.trim() !== '' && 
        isValidUrl(p.imagem.trim())
    );
    return isValid;
}

function updateCustomButtonState(): void {
    const validCount = customPokemonList.length;
    // ALTERAÇÃO CARTA 6: Usa '>=' e MIN_REQUIRED_POKEMON na verificação de isReady
    const isReady = validCount >= MIN_REQUIRED_POKEMON && checkCustomInputs();
    
    startCustomButton.disabled = !isReady;
    startCustomButton.textContent = isReady 
        ? 'Iniciar Jogo Personalizado' 
        // ALTERAÇÃO CARTA 7: Atualiza o texto para refletir o mínimo
        : `Iniciar Jogo Personalizado (${validCount}/${MIN_REQUIRED_POKEMON} Mínimo)`;
}

export function renderCustomInputs(): void {
    pokemonInputsContainer.innerHTML = '';
    
    customPokemonList.forEach((p, i) => {
        const htmlGroup = document.createElement('div');
        htmlGroup.classList.add('pokemon-input-group');
        htmlGroup.innerHTML = `
            <input 
                type="text" 
                placeholder="Nome do Pokémon ${i + 1}" 
                value="${p.nome}"
                data-index="${i}"
                data-field="nome"
            >
            <input 
                type="url" 
                placeholder="URL da Imagem PNG/JPG" 
                value="${p.imagem}"
                data-index="${i}"
                data-field="imagem"
            >
            <button class="remove-button" data-index="${i}">
                ${customPokemonList.length <= MIN_REQUIRED_POKEMON ? '🚫' : '➖'}
            </button>
        `;
        
        const removeButton = htmlGroup.querySelector('.remove-button') as HTMLButtonElement;
        // ALTERAÇÃO CARTA 9: Desabilita o botão se atingir o mínimo
        removeButton.disabled = customPokemonList.length <= MIN_REQUIRED_POKEMON;

        pokemonInputsContainer.appendChild(htmlGroup);
    });

    updateCustomButtonState();
 
    attachCustomInputListeners(); 
}

// --- FUNÇÕES DE CONTROLE DE TEMA ---

const themeToggle = document.getElementById('theme-toggle') as HTMLButtonElement;

/**
 * Atualiza os ícones do botão de tema com base no tema atual.
 * @param isLight Indica se o tema atual é claro.
 */
function updateThemeIcons(isLight: boolean): void {
    const lightIcon = themeToggle?.querySelector('.icon-light') as HTMLElement;
    const darkIcon = themeToggle?.querySelector('.icon-dark') as HTMLElement;

    if (lightIcon && darkIcon) {
        // Se for tema claro (isLight=true), esconde o Dark (Master Ball) e mostra o Light (Pokébola)
        lightIcon.classList.toggle('hidden', !isLight);
        darkIcon.classList.toggle('hidden', isLight);
    }
}

/**
 * Alterna entre os temas claro/escuro e salva a preferência no localStorage.
 */
function toggleTheme(): void {
    // A classe 'light-mode' é usada para indicar o tema claro (ver style.css)
    const isLight = document.body.classList.toggle('light-mode');
    
    // Salva a preferência
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    // Atualiza os ícones visíveis
    updateThemeIcons(isLight);
}

/**
 * Carrega a preferência de tema do localStorage na inicialização.
 */
function loadTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    
    // O tema padrão do CSS é escuro. Se o tema salvo for 'light', ativamos.
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        updateThemeIcons(true);
    } else {
        // Garante que o ícone correto (Dark) seja mostrado para o tema padrão
        updateThemeIcons(false);
    }
}
// ------------------------------------


function attachEventListeners(): void {
    // MODIFICADO: Listeners de região para resetar o estado rápido
    document.querySelectorAll('.options-container button[data-region]').forEach(button => {
        button.addEventListener('click', (e) => {
            const region = (e.currentTarget as HTMLButtonElement).dataset.region as Region;
            if (region) {
                isQuickMatch = false; // Garante que o estado rápido é redefinido para jogos normais
                currentStageIndex = 0;
                startGame(region); 
            }
        });
    });

    // NOVO LISTENER: Partida Rápida
    document.getElementById('btn-start-quick-match')?.addEventListener('click', startQuickMatch);

    document.getElementById('btn-show-custom')?.addEventListener('click', showCreateScreen);
    document.getElementById('btn-custom-back')?.addEventListener('click', resetGame);
    document.getElementById('btn-game-back')?.addEventListener('click', resetGame);
    document.getElementById('btn-error-return')?.addEventListener('click', resetGame);
    document.getElementById('btn-win-return')?.addEventListener('click', resetGame);

    document.getElementById('btn-add-pokemon')?.addEventListener('click', () => addPokemonInput());
    startCustomButton.addEventListener('click', startCustomGame);


    document.getElementById('restart')?.addEventListener('click', restartCurrentGame); 
    
    // ALTERAÇÃO TEMA 1: Listener para o botão de tema
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
}

function attachCustomInputListeners(): void {
    pokemonInputsContainer.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            const index = Number(target.dataset.index);
            const field = target.dataset.field as keyof Pokemon;
            updateCustomPokemon(index, field, target.value);
        });
    });

    pokemonInputsContainer.querySelectorAll('.remove-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = Number((e.currentTarget as HTMLButtonElement).dataset.index);
            removePokemonInput(index);
        });
    });
}

export function initializeUI(): void {
    showScreen('selection');
    attachEventListeners(); 
    renderCustomInputs(); 
    // ALTERAÇÃO TEMA 2: Carrega o tema salvo na inicialização
    loadTheme();
}