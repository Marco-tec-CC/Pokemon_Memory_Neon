import { startNewGameApi } from '../frontend/public/scr/api'; 
import { Region, PokemonList, GameState } from '../frontend/public/scr/models'; 
import * as game from '../frontend/public/scr/game'; 

const screenElements: Record<string, HTMLElement> = {
    selection: document.getElementById('region-selection') as HTMLElement,
    custom: document.getElementById('custom-creation') as HTMLElement,
    game: document.getElementById('game-board') as HTMLElement,
};
const panelElement = document.getElementById('panel') as HTMLElement;

const pokemonInputsContainer = document.getElementById('pokemon-inputs-container') as HTMLDivElement;
const startCustomButton = document.getElementById('start-custom-button') as HTMLButtonElement;

const MAX_CUSTOM_POKEMON = 8; 

let customPokemonList: PokemonList = []; 


/**
 * Alterna a exibição entre as telas da aplicação.
 * @param screenName O nome da tela ('selection', 'custom', 'game').
 */
export function showScreen(screenName: 'selection' | 'custom' | 'game') {
    Object.keys(screenElements).forEach(key => {
        const element = screenElements[key];
        element.classList.toggle('active', key === screenName);
        element.classList.toggle('hidden', key !== screenName);
    });

    panelElement?.classList.toggle('hidden', screenName !== 'game');
}


export function showCreateScreen() {
    showScreen('custom');
 
    customPokemonList = [];
    pokemonInputsContainer.innerHTML = ''; 
    updateCustomButtonState();
 
    if (customPokemonList.length === 0) {
        addPokemonInput();
    }
}

export async function startGame(region: Region, customPokemonList?: PokemonList) {
    try {
        // 1. Chama a API (POST /game/start) para obter o GameState completo.
        const gameState: GameState = await startNewGameApi(region, customPokemonList);
        
        if (gameState && gameState.cards.length > 0) {
            // 2. Inicializa o jogo com o estado do Backend
            game.initGameFromBackendState(gameState); 
            
            // 3. Muda para a tela do jogo APÓS carregar os dados
            showScreen('game');
        } else {
            alert("Não foi possível carregar os Pokémons. O baralho retornado está vazio.");
        }
    } catch (error) {
        console.error('Falha ao iniciar jogo:', error);
        alert('Falha na comunicação com o servidor ou ao carregar dados. Verifique o console.');
        showScreen('selection'); // Volta para seleção em caso de falha
    }
}

export function startCustomGame() {
    if (customPokemonList.length === MAX_CUSTOM_POKEMON && checkCustomInputs()) {
        // Chama a função principal de início, passando a lista de Pokémons e a região 'custom'
        startGame('custom', customPokemonList);
    } else {
        alert(`Você deve selecionar e preencher corretamente ${MAX_CUSTOM_POKEMON} Pokémons.`);
    }
}

export function addPokemonInput() {
    if (customPokemonList.length >= MAX_CUSTOM_POKEMON) {
        alert(`O máximo de ${MAX_CUSTOM_POKEMON} Pokémons foi atingido.`);
        return;
    }

    const index = customPokemonList.length;
    
    const newPokemon: PokemonList[number] = {
        id: index + 1, // ID temporário
        nome: '',
        imagem: '',
    };
    customPokemonList.push(newPokemon);

    const inputGroup = document.createElement('div');
    inputGroup.classList.add('pokemon-input-group');
    inputGroup.dataset.index = String(index);

    inputGroup.innerHTML = `
        <label>Pokémon ${index + 1}:</label>
        <input type="text" placeholder="Nome (Ex: Pikachu)" oninput="updateCustomPokemon(${index}, 'nome', this.value)" required>
        <input type="url" placeholder="URL da Imagem" oninput="updateCustomPokemon(${index}, 'imagem', this.value)" required>
        <button class="remove-button" onclick="removePokemonInput(${index})" ${index < 1 ? 'disabled' : ''}>Remover</button>
    `;

    pokemonInputsContainer.appendChild(inputGroup);
    updateCustomButtonState();
}

export function removePokemonInput(index: number) {
    if (customPokemonList.length === 1) return; 

    customPokemonList.splice(index, 1);

    const inputGroup = document.querySelector(`.pokemon-input-group[data-index="${index}"]`);
    if (inputGroup) {
        pokemonInputsContainer.removeChild(inputGroup);
    }

    reindexCustomInputs();
    updateCustomButtonState();
}

export function updateCustomPokemon(index: number, field: keyof PokemonList[number], value: string) {
    if (customPokemonList[index]) {
        (customPokemonList[index] as any)[field] = value;
    }
    updateCustomButtonState();
}

function reindexCustomInputs() {
    const groups = pokemonInputsContainer.querySelectorAll('.pokemon-input-group');
    
    groups.forEach((group, i) => {
        const p = customPokemonList[i];
        
        if (p) p.id = i + 1;

        const htmlGroup = group as HTMLDivElement;
        htmlGroup.dataset.index = String(i);
        
        const label = htmlGroup.querySelector('label');
        if (label) label.textContent = `Pokémon ${i + 1}:`;
        
        // 💡 MELHORIA: Usa o atributo 'type' para garantir a atualização do campo
        htmlGroup.querySelectorAll('input').forEach(input => {
            const fieldName = input.type === 'text' ? 'nome' : 'imagem';
            input.setAttribute('oninput', `updateCustomPokemon(${i}, '${fieldName}', this.value)`);
        });
        
        const removeButton = htmlGroup.querySelector('.remove-button') as HTMLButtonElement;
        if (removeButton) {
            removeButton.setAttribute('onclick', `removePokemonInput(${i})`);
            removeButton.disabled = customPokemonList.length === 1; 
        }
    });
}

export function checkCustomInputs(): boolean {
    return customPokemonList.every((p: { nome: string; imagem: string; }) => p.nome.trim() !== '' && p.imagem.trim() !== '');
}

function updateCustomButtonState() {
    const validCount = customPokemonList.length;
    const isReady = validCount === MAX_CUSTOM_POKEMON && checkCustomInputs();
    
    startCustomButton.disabled = !isReady;
    startCustomButton.textContent = `Iniciar Jogo Personalizado (${validCount}/${MAX_CUSTOM_POKEMON})`;
}

export function initializeUI() {

    showScreen('selection'); 

    const restartButton = document.getElementById('restart');
    if (restartButton) {
        restartButton.addEventListener('click', () => game.resetGame());
    }
}