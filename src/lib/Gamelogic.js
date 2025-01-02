import Peer from 'peerjs';
import { gameState } from '../Stores/GameState';

/**
 * @typedef {import('../Stores/GameState').GameState} GameState
 */

let peer;
let connections = [];

/**
 * Initialize PeerJS with the given ID.
 * @param {string} id
 */
export function initializePeer(id) {
  peer = new Peer(id);

  peer.on('connection', (conn) => {
    connections.push(conn);
    conn.on('data', (data) => {
      if (isValidGameState(data)) {
        gameState.set(data);
      }
    });
  });
}

/**
 * Connect to a peer with the given ID.
 * @param {string} peerId
 */
export function connectToPeer(peerId) {
  const conn = peer.connect(peerId);
  connections.push(conn);
  conn.on('data', (data) => {
    if (isValidGameState(data)) {
      gameState.set(data);
    }
  });
}

/**
 * Update the game state and send it to all connected peers.
 * @param {GameState} newState
 */
export function updateGameState(newState) {
  gameState.set(newState);
  connections.forEach((conn) => conn.send(newState));
}

/**
 * Validate if the received data is a valid game state.
 * @param {any} data
 * @returns {data is GameState}
 */
function isValidGameState(data) {
  return (
    data &&
    Array.isArray(data.players) &&
    'currentPlayer' in data &&
    Array.isArray(data.dice) &&
    Array.isArray(data.bids) &&
    typeof data.gameStarted === 'boolean'
  );
}