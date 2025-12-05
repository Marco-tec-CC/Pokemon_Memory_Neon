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


// IDs CRÍTICOS
const pokemonInputsContainer = document.getElementById('pokemon-inputs-container') as HTMLDivElement;
const startCustomButton = document.getElementById('start-custom-button') as HTMLButtonElement;
const addPokemonButton = document.getElementById('btn-add-pokemon') as HTMLButtonElement;
const MIN_REQUIRED_POKEMON = 8;


const timerCountdownDisplay = document.getElementById('timer-countdown') as HTMLElement;
const stageDisplayContainer = document.getElementById('stage-display') as HTMLElement;
const currentStageDisplay = document.getElementById('current-stage') as HTMLElement;

const QUICK_MATCH_STAGES: { pairs: number; timeLimitSeconds: number }[] = [
    { pairs: 8, timeLimitSeconds: 180 },   
];
const TOTAL_STAGES = QUICK_MATCH_STAGES.length; 

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

    const pokedex = document.getElementById('pokedex');
    if (pokedex) {
        pokedex.classList.toggle('expanded-game', screenName === 'game');
    }

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
    const currentScreen = currentRegion === 'custom' ? 'custom' : 'selection';
    showScreen(currentScreen);
    errorText.textContent = `🚨 Erro: ${message}`;
    errorMessageDisplay.classList.remove('hidden');
}


function formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function stopTimer(): void {
    if (countdownInterval !== null) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

function handleTimeOut(): void {
    stopTimer();
    showError('Tempo Esgotado! O Desafio Rápido Terminou.');
    resetGame(); 
}


function startTimer(numberOfPairs: number): void {
    const stage = QUICK_MATCH_STAGES.find(s => s.pairs === numberOfPairs) || QUICK_MATCH_STAGES[0];
    if (!stage) return; 

    stageDisplayContainer?.classList.remove('hidden');
    if (currentStageDisplay) {
        currentStageDisplay.textContent = `${currentStageIndex + 1}/${TOTAL_STAGES} (${numberOfPairs} Pares)`;
    }

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


function startQuickMatchStage(): void {
    const stage = QUICK_MATCH_STAGES[currentStageIndex];
    startGame('kanto', undefined, stage.pairs); 
}

function startQuickMatch(): void {
    isQuickMatch = true;
    currentStageIndex = 0; 
    startQuickMatchStage();
}

export function advanceQuickMatchStage(): void {
    stopTimer(); 
    currentStageIndex++; 
    
    if (currentStageIndex < TOTAL_STAGES) {
        startQuickMatchStage(); 
    } else {
        showWinScreen(0); 
    }
}


export function showWinScreen(finalMoves: number): void {
    
    stopTimer(); 

    const winScreen = screenElements.win as HTMLElement;
    const finalMovesDisplay = document.getElementById('final-moves') as HTMLElement;
    
    const isQuickMatchWin = isQuickMatch; 
    
    if (finalMovesDisplay) {
        if (isQuickMatchWin && finalMoves === 0) {
             finalMovesDisplay.textContent = 'Desafio Concluído!';
        } else {
             finalMovesDisplay.textContent = finalMoves.toString();
        }
    }
        
    const winMessage = winScreen.querySelector('h2') as HTMLHeadingElement;
    if (winMessage) {
        winMessage.textContent = isQuickMatchWin
            ? `🎉 Partida Rápida Concluída! 🎉`
            : `🎉 Parabéns, Vencedor! 🎉`;
    }

    showScreen('win');
    
    if (isQuickMatch) {
        isQuickMatch = false; 
        currentStageIndex = 0;
    }
}


export async function startGame(region: Region, customList?: PokemonList, numberOfPairs?: number): Promise<void> {
 
    try {
        showLoading(region === 'custom' ? 'Criando jogo personalizado...' : `Buscando Pokémons de ${region}...`);
        
        const pairsToUse = numberOfPairs || (region === 'custom' ? MIN_REQUIRED_POKEMON : undefined);
        
        const gameState = await startNewGameApi(region, customList, pairsToUse);

     
        currentRegion = region; 
        customPokemonList = customList || [];

       
        game.initGameFromBackendState(gameState); 

       
        showScreen('game');

        if (isQuickMatch && pairsToUse) {
            startTimer(pairsToUse); 
        } else {
            isQuickMatch = false;
            stageDisplayContainer?.classList.add('hidden'); 
            if (timerCountdownDisplay) timerCountdownDisplay.textContent = '--:--';
        }


    } catch (error) {
        console.error('Erro ao iniciar o jogo:', error);
        // O erro 'Failed to fetch' tem uma mensagem vazia ou genérica, 
        // então verificamos se a falha é na comunicação.
        const errorMessage = (error as Error).message.includes('Failed to fetch') || (error as Error).message.includes('network') 
            ? 'Falha na comunicação com o servidor. Verifique se o back-end está rodando (Node.js).'
            : (error as Error).message || 'Erro desconhecido ao iniciar o jogo.';
            
        showScreen(region === 'custom' ? 'custom' : 'selection');
        showError(errorMessage);

    } finally {
        hideLoading();
    }
}

export function restartCurrentGame(): void {
    game.resetGameState(); 
    if (isQuickMatch) {
        startQuickMatchStage();
    } else {
        startGame(currentRegion, customPokemonList.length > 0 && currentRegion === 'custom' ? customPokemonList : undefined);
    }
}

export function resetGame(): void {
    game.resetGameState();
    stopTimer(); 
    isQuickMatch = false; 
    currentStageIndex = 0;
    customPokemonList = []; 
    
    // CRÍTICO: ESCONDE A MENSAGEM DE ERRO AO VOLTAR PARA O MENU
    errorMessageDisplay.classList.add('hidden');
    errorText.textContent = ''; 
    
    showScreen('selection');
}


// ------------------------------------
// Funções de Criação Personalizada
// ------------------------------------

function renderCustomInput(pokemon: Pokemon, index: number): string {
    const canRemove = customPokemonList.length > MIN_REQUIRED_POKEMON;

    return `
        <div class="pokemon-input-group">
            <span>#${index + 1}</span>
            <input type="text" placeholder="Nome do Pokémon" data-index="${index}" data-field="nome" value="${pokemon.nome}">
            <input type="url" placeholder="URL da Imagem (HTTPS)" data-index="${index}" data-field="imagem" value="${pokemon.imagem}">
            <button class="remove-button" data-index="${index}" ${canRemove ? '' : 'disabled'}>X</button>
        </div>
    `;
}

export function addPokemonInput(): void {
    
    if (customPokemonList.length >= 10) {
        return; 
    }
    
    const newPokemon: Pokemon = {
        id: customPokemonList.length + 1,
        nome: '',
        imagem: '',
    };
    customPokemonList.push(newPokemon);

    renderCustomInputs(); 
}

export function removePokemonInput(index: number): void {
    
    if (customPokemonList.length > MIN_REQUIRED_POKEMON) {
        customPokemonList.splice(index, 1);
        customPokemonList.forEach((p, i) => p.id = i + 1); 
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

// VALIDAÇÃO MAIS PERMISSIVA (Para aceitar URLs sem http/https)
function isValidUrl(url: string): boolean {
    if (!url || url.trim() === '') return false;
    
    let sanitizedUrl = url.trim();

    // Tenta adicionar 'https://' se nenhum protocolo for encontrado
    if (!sanitizedUrl.startsWith('http://') && !sanitizedUrl.startsWith('https://')) {
        sanitizedUrl = 'https://' + sanitizedUrl;
    }

    try {
        const u = new URL(sanitizedUrl);
        // Garante que o protocolo seja web (http/https)
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch (e) {
        return false;
    }
}

function checkCustomInputs(): number {
    let validCount = 0;
    // Verifica APENAS os 8 Pokémons mínimos
    const requiredPokemons = customPokemonList.slice(0, MIN_REQUIRED_POKEMON);
    
    requiredPokemons.forEach(p => {
        // Valida se nome e URL são válidos
        if (p.nome.trim() !== '' && p.imagem.trim() !== '' && isValidUrl(p.imagem.trim())) {
            validCount++;
        }
    });
    return validCount;
}

function updateCustomButtonState(): void {
    
    const currentValidCount = checkCustomInputs();
    
    const isReady = currentValidCount === MIN_REQUIRED_POKEMON;
    
    // Habilita o botão somente se 8/8 Pokémons forem válidos
    startCustomButton.disabled = !isReady;
    
    startCustomButton.textContent = isReady 
        ? 'Iniciar Jogo Personalizado' 
        : `Iniciar Jogo Personalizado (${currentValidCount}/${MIN_REQUIRED_POKEMON} Mínimo)`; 

    addPokemonButton.disabled = customPokemonList.length >= 10;
}

export function renderCustomInputs(): void {
    pokemonInputsContainer.innerHTML = '';
    
    if (customPokemonList.length === 0) {
        for (let i = 0; i < MIN_REQUIRED_POKEMON; i++) {
             customPokemonList.push({
                id: i + 1,
                nome: '',
                imagem: '',
            }); 
        }
    }

    customPokemonList.forEach((p, i) => {
        pokemonInputsContainer.innerHTML += renderCustomInput(p, i);
    });
    
    updateCustomButtonState();
}

function startCustomGame(): void {
    const validCount = checkCustomInputs();

    if (validCount < MIN_REQUIRED_POKEMON) {
        showError(`O Jogo Personalizado requer exatamente ${MIN_REQUIRED_POKEMON} Pokémons válidos.`);
        return;
    }
    
    const listToSend = customPokemonList.slice(0, MIN_REQUIRED_POKEMON);
    
    startGame('custom', listToSend, listToSend.length); 
}

// ------------------------------------
// Funções de Tema e Listeners
// ------------------------------------

function updateThemeIcons(isLightMode: boolean): void {
    const lightIcon = document.querySelector('.icon-light');
    const darkIcon = document.querySelector('.icon-dark');
    
    if (lightIcon && darkIcon) {
        lightIcon.classList.toggle('hidden', !isLightMode);
        darkIcon.classList.toggle('hidden', isLightMode);
    }
}

function toggleTheme(): void {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateThemeIcons(isLight);
}

export function loadTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        updateThemeIcons(true);
    } else {
        updateThemeIcons(false);
    }
}

// 🚨 CRÍTICO: DELEGAÇÃO DE EVENTOS para inputs dinâmicos
const customInputContainerHandler = (e: Event) => {
    const target = e.target as HTMLElement;

    // Lógica para Inputs (Nome e URL)
    if (target.tagName === 'INPUT') {
        const input = target as HTMLInputElement;
        const index = Number(input.dataset.index);
        const field = input.dataset.field as keyof Pokemon;
        updateCustomPokemon(index, field, input.value);
        return; 
    }

    // Lógica para Botão de Exclusão
    if (target.classList.contains('remove-button')) {
        const button = target as HTMLButtonElement;
        if (button.disabled) return; 
        
        const index = Number(button.dataset.index);
        removePokemonInput(index);
    }
};


function attachEventListeners(): void {
    
    const regionButtons = document.querySelectorAll('.options-container button[data-region]');
    regionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const region = button.getAttribute('data-region') as Region;
            startGame(region, undefined, 8); 
        });
    });

    const quickMatchButton = document.getElementById('btn-quick-match');
    quickMatchButton?.addEventListener('click', startQuickMatch);

    const customModeButton = document.getElementById('btn-custom-mode');
    customModeButton?.addEventListener('click', () => {
        renderCustomInputs(); 
        showScreen('custom');
    });
    
    document.getElementById('btn-custom-back')?.addEventListener('click', resetGame);
    document.getElementById('btn-game-back')?.addEventListener('click', resetGame);
    document.getElementById('btn-win-return')?.addEventListener('click', resetGame);
    
    // CRÍTICO: Este listener chama resetGame, que agora esconde o erro
    document.getElementById('btn-error-return')?.addEventListener('click', resetGame);
    
    document.getElementById('restart')?.addEventListener('click', restartCurrentGame); 

    addPokemonButton.addEventListener('click', () => addPokemonInput());
    startCustomButton.addEventListener('click', startCustomGame);

    const themeToggle = document.getElementById('theme-toggle');
    themeToggle?.addEventListener('click', toggleTheme);
    
    // CRÍTICO: Listeners de delegação
    pokemonInputsContainer.addEventListener('input', customInputContainerHandler);
    pokemonInputsContainer.addEventListener('click', customInputContainerHandler);
}


export function initializeUI(): void {
    showScreen('selection');
    attachEventListeners(); 
    loadTheme();
}