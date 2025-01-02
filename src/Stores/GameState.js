import { writable } from 'svelte/store';

export const gameState = writable({
  players: [],
  currentPlayer: null,
  dice: [],
  bids: [],
  gameStarted: false,
});

/**
 * @typedef {Object} GameState
 * @property {Array} players
 * @property {any} currentPlayer
 * @property {Array} dice
 * @property {Array} bids
 * @property {boolean} gameStarted
 */