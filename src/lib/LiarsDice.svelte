<script>
    import { onMount } from 'svelte';
    import Peer from 'peerjs';
    import '@fortawesome/fontawesome-free/css/all.css';
  
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
        
        setupConnection();
      } catch (err) {
        alert('Failed to connect: ' + err.message);
      }
    }
  
    function setupConnection() {
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
        }
      });
    }
  
    function startGame() {
      if (!playerName || !opponentName) {
        alert('Both players must set their names before starting the game.');
        connection.close();
        gameState = 'lobby';
        return;
      }
      gameState = 'playing';
      rollDice();
      isMyTurn = true;
      message = "Game started! It's your turn to make a bid.";
    }
  
    function makeBid() {
      if (!bid.quantity || !bid.value || bid.quantity < 1 || bid.value < 1 || bid.value > 6) {
        alert('Invalid bid! Quantity must be positive and value must be between 1 and 6.');
        return;
      }
      connection.send({ type: 'bid', bid });
      isMyTurn = false;
      message = `You bid ${bid.quantity} x ${bid.value}'s. Waiting for ${opponentName}'s move.`;
    }
  
    function challenge() {
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
      isMyTurn = true;
      message = "New round started! It's your turn to make a bid.";
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
  
    onMount(() => {
      peer = new Peer();
      peer.on('open', (id) => {
        peerId = id;
      });
  
      peer.on('connection', (conn) => {
        connection = conn;
        setupConnection();
      });
    });
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
          <h2 class="text-xl font-bold mb-2 text-center">Your Dice: {diceCount}</h2>
          <ul class="flex justify-center space-x-2 mb-4">
            {#each dice as roll}
              <li class="dice">
                {#if roll === 1} <i class="fas fa-dice-one"></i> {/if}
                {#if roll === 2} <i class="fas fa-dice-two"></i> {/if}
                {#if roll === 3} <i class="fas fa-dice-three"></i> {/if}
                {#if roll === 4} <i class="fas fa-dice-four"></i> {/if}
                {#if roll === 5} <i class="fas fa-dice-five"></i> {/if}
                {#if roll === 6} <i class="fas fa-dice-six"></i> {/if}
              </li>
            {/each}
          </ul>
  
          <h2 class="text-xl font-bold mb-2">Current Bid:</h2>
          <p class="text-lg mb-4">{bid.quantity} x {bid.value}'s</p>
  
          {#if gameState === 'playing' && isMyTurn}
            <div class="mb-4 justify-center">
              <div class="flex mb-2">
                <input
                  type="number"
                  min="1"
                  class="border p-2 mr-2 rounded w-40"
                  placeholder="Number of dice"
                />
                <input
                  type="number"
                  min="1"
                  max="6"
                  on:change={validateBidValue}
                  class="border p-2 mr-2 rounded w-40"
                  placeholder="Dice face"
                />
              </div>
              <div class="flex justify-center">
                <button 
                  on:click={makeBid} 
                  class="bg-green-500 hover:bg-green-600 text-white p-2 rounded mr-4 transition duration-200"
                >
                  Make Bid
                </button>
                <button 
                  on:click={challenge} 
                  class="bg-red-500 hover:bg-red-600 text-white p-2 rounded mr-4  transition duration-200 {!bid.quantity || !bid.value ? 'opacity-50 cursor-not-allowed' : ''}"
                  disabled={!bid.quantity || !bid.value}
                >
                  Challenge
                </button>
              </div>
            </div>
          {/if}
  
          <p class="text-lg font-semibold">{message}</p>
  
        </div>
  
        <div>
          <h2 class="text-xl font-bold mb-2 text-center">Opponent's Dice: {opponentDiceCount}</h2>
          <h2 class="text-xl font-bold mb-2">Chat</h2>
          <div class="border rounded p-2 h-64 overflow-y-auto mb-2">
            {#each chatMessages as chat}
              <p><strong>{chat.sender}:</strong> {chat.message}</p>
            {/each}
          </div>
          <div class="flex">
            <input
              type="text"
              bind:value={chatInput}
              placeholder="Type a message..."
              class="border p-2 mr-2 rounded flex-grow"
              on:keypress={(e) => e.key === 'Enter' && sendChatMessage()}
            />
            <button on:click={sendChatMessage} class="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition duration-200">
              Send
            </button>
          </div>
        </div>
      </div>
    {/if}
  </main>
  
  {#if gameState === 'gameover'}
    <div class="modal-overlay">
        <div class="modal-content">
            <h2 class="text-2xl font-bold mb-4">{gameOverMessage}</h2>
            <p class="mb-4">
                Final Score:<br>
                You: {diceCount} dice<br>
                {opponentName}: {opponentDiceCount} dice
            </p>
            <button
                on:click={playAgain}
                class="bg-blue-500 hover:bg-blue-600 text-white p-2 px-6 rounded transition duration-200"
            >
                Play Again
            </button>
        </div>
    </div>
  {/if}

  <style>
    :global(body) {
      background-color: #f0f4f8;
    }
    
    .dice {
      font-size: 2rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3rem;
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  
    ul.flex {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      margin: 1rem auto;
      padding: 0;
      list-style: none;
      gap: 1rem;
    }
    


    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(2px);
    }

    .modal-content {
        background-color: white;
        padding: 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-width: 90%;
        width: 400px;
        text-align: center;
        animation: modal-pop 0.3s ease-out;
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