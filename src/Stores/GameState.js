import { writable } from 'svelte/store';

export const gameState = writable({
  players: [],
  currentPlayer: null,
  dice: [],
  bids: [],
  gameStarted: false,
  round: 1,
  currentBid: null,
  playerTurn: 0,
});

/**
 * @typedef {Object} GameState
 * @property {Array} players
 * @property {any} currentPlayer
 * @property {Array} dice
 * @property {Array} bids
 * @property {boolean} gameStarted
 * @property {number} round
 * @property {any} currentBid
 * @property {number} playerTurn
 */