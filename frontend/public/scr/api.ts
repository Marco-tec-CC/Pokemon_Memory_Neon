import { GameState, Region, PokemonList, CheckPairResult } from './models';

const BASE_URL = 'http://localhost:3000/game';


// MODIFICADO: Aceita numberOfPairs e o inclui no corpo da requisição
export async function startNewGameApi(region: Region, customPokemonList?: PokemonList, numberOfPairs?: number): Promise<GameState> {
    const response = await fetch(`${BASE_URL}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // AGORA INCLUI numberOfPairs para dizer ao backend quantos pares criar
        body: JSON.stringify({ region, customPokemonList, numberOfPairs }),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'Resposta não é JSON' }));
        throw new Error(`Erro ao iniciar jogo: ${response.status} - ${errorBody.error || response.statusText}`);
    }


    return response.json();
}


export async function checkPairApi(gameId: string, cardIds: string[]): Promise<CheckPairResult> {
    const response = await fetch(`${BASE_URL}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, cardIds }),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'Resposta não é JSON' }));
        throw new Error(`Erro na jogada: ${response.status} - ${errorBody.error || response.statusText}`);
    }

    return response.json();
}