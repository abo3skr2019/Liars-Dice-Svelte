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
    let bid = { quantity: null, value: null };
    let gameState = 'lobby';
    let message = '';
    let isMyTurn = false;
    let chatMessages = [];
    let chatInput = '';
    let gameOverMessage = '';
    let isHost = false;
    let implicitName = '';
    let implicitOpponentName = '';  // New variable for opponent's implicit name
    let isReturningToLobby = false; // Add this at the top with other state variables
    let showCopied = false;

    function extractNameFromPeerId(id) {
      const firstPart = id.split('-')[0];
      return firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
    }
  
    function rollDice() {
      dice = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
    }
  
    function connectToPeer() {
      // Use implicit name if no explicit name is provided
      if (!playerName && connectId) {
        implicitOpponentName = extractNameFromPeerId(peerId); // Use our ID for our name
        implicitName = extractNameFromPeerId(connectId); // Use target ID for opponent name
      }
      
      if (!playerName && !implicitOpponentName) {
        alert('Unable to extract name from Connection Code.');
        return;
      }
      
      try {
        connection = peer.connect(connectId);
        isHost = false;  // Client connecting to host
        connection.on('error', (err) => {
          alert('Connection error: ' + err);
          gameState = 'lobby';
        });
        
        setupConnection(connection);
      } catch (err) {
        alert('Failed to connect: ' + err.message);
      }
    }
  
    function setupConnection(conn) {
      connection = conn;
      connection.on('open', () => {
        if (isHost) {
          // If we're the host, use our peer ID for name
          implicitName = extractNameFromPeerId(peerId);
        } else {
          // If we're the client, use what we set in connectToPeer
          implicitName = implicitOpponentName;
        }
        
        // Send either explicit or implicit name
        playerName = playerName || implicitName;
        connection.send({ 
          type: 'playerInfo', 
          name: playerName
        });
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
          case 'rematch':
            resetGame();
            break;
          case 'surrender':
            gameOverMessage = 'You Win by Surrender!';
            gameState = 'gameover';
            break;
          case 'returnToLobby':
            if (!isReturningToLobby) {
              returnToLobby(false);
            }
            break;
        }
      });

      // Simplified connection close handler
      connection.on('close', () => {
        if (gameState !== 'lobby' && !isReturningToLobby) {
          returnToLobby(false);
        }
      });
    }

    onMount(() => {
      try{
      peer = new Peer();
      peer.on('open', (id) => {
        peerId = id;
      });
    }
    catch(err){
      console.log(err);
    }

      // Handle incoming connections
      peer.on('connection', (conn) => {
        isHost = true;  // We are the host
        implicitName = extractNameFromPeerId(peerId); // Host uses their own ID for name
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
              gameOverMessage = `Congratulations You win!`;
          } else {
              gameOverMessage = `You lose!`;
          }
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
      bid = { quantity: null, value: null };
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
      bid = { quantity: null, value: null };
      message = 'New game started!';
      chatMessages = [];
    }
  
    function rematch() {
      resetGame();
      connection.send({ type: 'rematch' });
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
        gameOverMessage = `you Concede!`;
        gameState = 'gameover';
      }
    }

    function returnToLobby(initiatedByUser = true) {
        isReturningToLobby = initiatedByUser;
        
        if (connection && connection.open) {
            if (initiatedByUser) {
                connection.send({ type: 'returnToLobby' });
                connection.close();
            }
        }
        cleanupAndReturnToLobby();
    }

    function cleanupAndReturnToLobby() {
        gameState = 'lobby';
        opponentName = '';
        connectId = '';
        bid = { quantity: null, value: null };
        isReturningToLobby = false;
    }

    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            const element = document.getElementById('peerId');
            element.classList.add('copied');
            showCopied = true;
            setTimeout(() => {
                element.classList.remove('copied');
                showCopied = false;
            }, 1000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
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
          placeholder="Enter name (optional)"
          class="border p-2 mr-2 rounded"
        />
        <p class="my-2">Your Connection Code: 
            <span 
                id="peerId"
                class="font-mono bg-gray-700 text-gray-100 p-1 rounded cursor-pointer hover:bg-gray-600 transition-colors duration-200 relative"
                role="button"
                tabindex="0"
                on:click={() => copyToClipboard(peerId)}
                on:keydown={(e) => e.key === 'Enter' && copyToClipboard(peerId)}
            >
                {peerId}
                {#if showCopied}
                    <span class="copied-indicator">Copied!</span>
                {/if}
            </span>
        </p>
        <input
          type="text"
          bind:value={connectId}
          placeholder="Enter Connection Code to connect"
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
  <GameOverModal {gameOverMessage} {diceCount} {opponentName} {opponentDiceCount} {rematch} {returnToLobby} />
  {/if}

  <style>
    :global(body) {
        background-color: #1a1f2e;
        color: #e2e8f0;
    }

    .copied-indicator {
        position: absolute;
        top: -20px;
        right: 0;
        background-color: #4a5568;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.75rem;
        animation: fadeInOut 1s ease-in-out;
        white-space: nowrap;
    }

    @keyframes fadeInOut {
        0% {
            opacity: 0;
            transform: translateY(5px);
        }
        20% {
            opacity: 1;
            transform: translateY(0);
        }
        80% {
            opacity: 1;
            transform: translateY(0);
        }
        100% {
            opacity: 0;
            transform: translateY(-5px);
        }
    }
  </style>