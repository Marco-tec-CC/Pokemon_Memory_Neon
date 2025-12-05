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
const MAX_CUSTOM_POKEMON = 8;


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

export function showWinScreen(moves: number): void {
    const finalMovesDisplay = document.getElementById('final-moves');
    if (finalMovesDisplay) {
        finalMovesDisplay.textContent = moves.toString();
    }
    showScreen('win');
}



export async function startGame(region: Region, customList?: PokemonList): Promise<void> {
 
    try {
        showLoading(region === 'custom' ? 'Criando jogo personalizado...' : `Buscando Pokémons de ${region}...`);
        
    
        const gameState = await startNewGameApi(region, customList);

     
        currentRegion = region; 
        customPokemonList = customList || [];

       
        game.initGameFromBackendState(gameState); 

       
        showScreen('game');

    } catch (error) {
        console.error('Erro ao iniciar o jogo:', error);
     
        showError((error as Error).message || 'Falha na comunicação com o servidor. Verifique se o back-end está rodando.');
    } finally {
        hideLoading();
    }
}



export function restartCurrentGame(): void {

    game.resetGameState();
    

    startGame(currentRegion, customPokemonList.length > 0 ? customPokemonList : undefined);
}


export function resetGame(): void {
 
    game.resetGameState();
    
    showScreen('selection');

    currentRegion = 'kanto'; 
    customPokemonList = [];
    renderCustomInputs();
    hideLoading();
}


export function showCreateScreen(): void {
    showScreen('custom');
    if (customPokemonList.length === 0) {
        for (let i = 0; i < MAX_CUSTOM_POKEMON; i++) {
            addPokemonInput(false); 
        }
    }
    renderCustomInputs();
}

export function startCustomGame(): void {
    if (customPokemonList.length === MAX_CUSTOM_POKEMON && checkCustomInputs()) {
        startGame('custom', customPokemonList);
    }
}


export function addPokemonInput(updateListState: boolean = true): void {
    if (customPokemonList.length < MAX_CUSTOM_POKEMON) {
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
}

export function removePokemonInput(index: number): void {
    if (customPokemonList.length > 1) {
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
    const isReady = validCount === MAX_CUSTOM_POKEMON && checkCustomInputs();
    
    startCustomButton.disabled = !isReady;
    startCustomButton.textContent = isReady 
        ? 'Iniciar Jogo Personalizado' 
        : `Iniciar Jogo Personalizado (${validCount}/${MAX_CUSTOM_POKEMON})`;
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
                ${customPokemonList.length === 1 ? '🚫' : '➖'}
            </button>
        `;
        
        const removeButton = htmlGroup.querySelector('.remove-button') as HTMLButtonElement;
        removeButton.disabled = customPokemonList.length === 1;

        pokemonInputsContainer.appendChild(htmlGroup);
    });

    updateCustomButtonState();
 
    attachCustomInputListeners(); 
}

function attachEventListeners(): void {
    document.querySelectorAll('.options-container button[data-region]').forEach(button => {
        button.addEventListener('click', (e) => {
            const region = (e.currentTarget as HTMLButtonElement).dataset.region as Region;
            if (region) {
                startGame(region); 
            }
        });
    });

    document.getElementById('btn-show-custom')?.addEventListener('click', showCreateScreen);
    document.getElementById('btn-custom-back')?.addEventListener('click', resetGame);
    document.getElementById('btn-game-back')?.addEventListener('click', resetGame);
    document.getElementById('btn-error-return')?.addEventListener('click', resetGame);
    document.getElementById('btn-win-return')?.addEventListener('click', resetGame);

    document.getElementById('btn-add-pokemon')?.addEventListener('click', () => addPokemonInput());
    startCustomButton.addEventListener('click', startCustomGame);


    document.getElementById('restart')?.addEventListener('click', restartCurrentGame); 
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
}