<script>
    import { onMount } from 'svelte';
    import Peer from 'peerjs';
    import '@fortawesome/fontawesome-free/css/all.css';
  import Chat from './Chat.svelte';
  import DiceTray from './DiceTray.svelte';
  import GameOverModal from './GameOverModal.svelte';
  import BidControls from './BidControls.svelte';
  
    let peer;
    let connection;
    let peerId = '';
    let connectId = '';
    let playerName = '';
    let opponentName = '';
    let dice = [];
    let diceCount = 5;
    let opponentDiceCount = 5;
    let bid = { quantity: 0, value: 0 };
    let gameState = 'lobby';
    let message = '';
    let isMyTurn = false;
    let chatMessages = [];
    let chatInput = '';
    let gameOverMessage = '';
    let isHost = false;
  
    function rollDice() {
      dice = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
    }
  
    function connectToPeer() {
      if (!playerName) {
        alert('Please enter your name before connecting.');
        return;
      }
      try {
        connection = peer.connect(connectId);
        isHost = false;  // Client connecting to host
        connection.on('error', (err) => {
          alert('Connection error: ' + err);
          gameState = 'lobby';
        });
        
        // Add timeout to handle cases where peer doesn't exist
        setTimeout(() => {
          if (connection.open === false) {
            alert('Could not connect to peer. Please check the Peer ID.');
            connection.close();
          }
        }, 5000);
        
        setupConnection(connection);
      } catch (err) {
        alert('Failed to connect: ' + err.message);
      }
    }
  
    function setupConnection(conn) {
      connection = conn;
      connection.on('open', () => {
        connection.send({ type: 'playerInfo', name: playerName });
      });
  
      connection.on('data', (data) => {
        switch (data.type) {
          case 'playerInfo':
            if (!data.name) {
              alert('Opponent has not set their name!');
              connection.close();
              gameState = 'lobby';
              return;
            }
            opponentName = data.name;
            startGame();
            break;
          case 'bid':
            bid = data.bid;
            isMyTurn = true;
            message = `${opponentName} bid ${bid.quantity} x ${bid.value}'s. Your turn.`;
            break;
          case 'challenge':
            handleChallenge(data.challengerDice);
            break;
          case 'chat':
            chatMessages = [...chatMessages, { sender: opponentName, message: data.message }];
            break;
          case 'playAgain':
            resetGame();
            break;
          case 'surrender':
            gameOverMessage = 'Game Over! You win by surrender!';
            gameState = 'gameover';
            break;
        }
      });
    }

    onMount(() => {
      peer = new Peer();
      peer.on('open', (id) => {
        peerId = id;
      });

      // Handle incoming connections
      peer.on('connection', (conn) => {
        isHost = true;  // We are the host
        setupConnection(conn);
      });
    });
  
    function startGame() {
      if (!playerName || !opponentName) {
        alert('Both players must set their names before starting the game.');
        connection.close();
        gameState = 'lobby';
        return;
      }
      gameState = 'playing';
      rollDice();
      // Host always goes first in the first round
      isMyTurn = isHost;
      message = isHost 
        ? "Game started! You're the host - make the first bid!"
        : `Game started! Waiting for ${opponentName}'s first bid...`;
    }
  
    function makeBid() {
      if (!isMyTurn) {
        alert("It's not your turn!");
        return;
      }
      if (!bid.quantity || !bid.value || bid.quantity < 1 || bid.value < 1 || bid.value > 6) {
        alert('Invalid bid! Quantity must be positive and value must be between 1 and 6.');
        return;
      }
      connection.send({ type: 'bid', bid });
      isMyTurn = false;
      message = `You bid ${bid.quantity} x ${bid.value}'s. Waiting for ${opponentName}'s move.`;
    }
  
    function challenge() {
      if (!isMyTurn) {
        alert("It's not your turn!");
        return;
      }
      if (!bid.quantity || !bid.value) {
        alert('Cannot challenge when there is no bid!');
        return;
      }
      connection.send({ type: 'challenge', challengerDice: dice });
      handleChallenge(dice);
    }
  
    function handleChallenge(challengerDice) {
      const totalDice = [...dice, ...challengerDice];
      const actualCount = totalDice.filter(d => d === bid.value || d === 1).length;
      const bidWasCorrect = actualCount >= bid.quantity;
      
      if (bidWasCorrect) {
          // Challenger loses
          if (isMyTurn) {
              diceCount--;
              message = `Challenge failed! You lose a die. Dice remaining: ${diceCount}`;
          } else {
              opponentDiceCount--;
              message = `Challenge failed! ${opponentName} loses a die. Dice remaining: ${opponentDiceCount}`;
          }
      } else {
          // Bidder loses
          if (isMyTurn) {
              opponentDiceCount--;
              message = `Challenge successful! ${opponentName} loses a die. Dice remaining: ${opponentDiceCount}`;
          } else {
              diceCount--;
              message = `Challenge successful! You lose a die. Dice remaining: ${diceCount}`;
          }
      }
  
      if (diceCount === 0 || opponentDiceCount === 0) {
          const winner = diceCount === 0 ? opponentName : playerName;
          if (winner === playerName) {
              gameOverMessage = `Game Over! You win!`;
          } else {
              gameOverMessage = `Game Over! ${winner} wins!`;
          }
          gameOverMessage = `Game Over! ${winner} wins!`;
          gameState = 'gameover';
      } else {
          // Continue game with new round
          setTimeout(() => {
              resetRound();
          }, 2000);
      }
    }
  
    function resetRound() {
      rollDice();
      bid = { quantity: 0, value: 0 };
      // After first round, alternate turns normally
      isMyTurn = !isMyTurn;
      message = isMyTurn 
        ? "New round started! It's your turn to make a bid."
        : `New round started! Waiting for ${opponentName}'s bid.`;
    }
  
    function resetGame() {
      diceCount = 5;
      opponentDiceCount = 5;
      gameState = 'playing';
      rollDice();
      bid = { quantity: 0, value: 0 };
      message = 'New game started!';
      isMyTurn = true;
      chatMessages = [];
    }
  
    function playAgain() {
      resetGame();
      connection.send({ type: 'playAgain' });
    }
  
    function sendChatMessage() {
      if (chatInput.trim()) {
        const newMessage = { sender: 'You', message: chatInput.trim() };
        chatMessages = [...chatMessages, newMessage];
        connection.send({ type: 'chat', message: chatInput.trim() });
        chatInput = '';
      }
    }
  
    function validateBidValue(event) {
      const value = parseInt(event.target.value);
      if (value > 6) {
        bid.value = 6;
      } else if (value < 1) {
        bid.value = 1;
      }
    }

    function surrender() {
      if (confirm('Are you sure you want to surrender?')) {
        connection.send({ type: 'surrender' });
        gameOverMessage = `Game Over! ${opponentName} wins by surrender!`;
        gameState = 'gameover';
      }
    }
  </script>
  
  <main class="container mx-auto p-4 relative">
    <h1 class="text-3xl font-bold mb-4">Liar's Dice</h1>
  
    {#if gameState === 'lobby'}
      <div class="mb-4">
        <input
          type="text"
          bind:value={playerName}
          placeholder="Enter your name"
          class="border p-2 mr-2 rounded"
        />
        <p class="my-2">Your Peer ID: <span class="font-mono bg-gray-100 p-1 rounded">{peerId}</span></p>
        <input
          type="text"
          bind:value={connectId}
          placeholder="Enter peer ID to connect"
          class="border p-2 mr-2 rounded"
        />
        <button on:click={connectToPeer} class="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition duration-200">
          Connect to Opponent
        </button>
      </div>
    {:else if gameState === 'playing' || gameState === 'gameover'}
      <div class="grid grid-cols-2 gap-4">
        <div>
          <DiceTray {dice} {diceCount} label="Your Dice" />  
          <h2 class="text-xl font-bold mb-2">Current Bid:</h2>
          <p class="text-lg mb-4">{bid.quantity} x {bid.value}'s</p>
  
          {#if gameState === 'playing'}
            <div class="mb-4 text-lg font-bold {isMyTurn ? 'text-green-600' : 'text-red-600'}">
              {isMyTurn ? "It's your turn!" : `Waiting for ${opponentName}'s move...`}
            </div>
            <BidControls bind:bid {makeBid} {challenge} {validateBidValue} />
          {/if}
  
          <p class="text-lg font-semibold">{message}</p>
  
        </div>
  
        <div>
          <h2 class="text-xl font-bold mb-2 text-center">Opponent's Dice: {opponentDiceCount}</h2>
          <Chat {chatMessages} {chatInput} {sendChatMessage} {surrender} />
        </div>
      </div>
    {/if}
  </main>
  
  {#if gameState === 'gameover'}
  <GameOverModal {gameOverMessage} {diceCount} {opponentName} {opponentDiceCount} {playAgain} />
  {/if}

  <style>
    :global(body) {
      background-color: #f0f4f8;
    }
        



    @keyframes modal-pop {
        from {
            transform: scale(0.8);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
  </style>