export type Region = 'kanto' | 'johto' | 'hoenn' | 'sinnoh' | 'custom';

export interface Pokemon {
    id: number;
    nome: string;
    imagem: string;
}


export type PokemonList = Pokemon[];

export interface Card {
    id: string; 
    pokemon: string; 
    imagem: string; 
    flipped: boolean;
    matched: boolean;
}


export interface GameState {
    id: string;
    cards: Card[];
    moves: number;
}


export interface CheckPairResult {
    match: boolean;
    moves: number;
    message: string;
    isGameOver: boolean;
    cards: Card[]; 
}