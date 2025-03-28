<script>
    import { onMount } from 'svelte';
    import Peer from 'peerjs';
    import '@fortawesome/fontawesome-free/css/all.css';
    import Chat from './Chat.svelte';
    import DiceTray from './DiceTray.svelte';
    import GameOverModal from './GameOverModal.svelte';
    import BidControls from './BidControls.svelte';
    import QRModal from './QRModal.svelte';
    import { fade } from 'svelte/transition';
  
    // Simplified animation config
    const ANIMATION_CONFIG = {
        delayBetweenRounds: 800, // ms to wait before next round
    };
    
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
    let previousBid = { quantity: null, value: null }; // Add variable to track previous bid
    let gameState = 'lobby';
    let message = '';
    let isMyTurn = false;
    let chatMessages = [];
    let chatInput = '';
    let gameOverMessage = '';
    let isHost = false;
    let implicitName = '';
    let implicitOpponentName = '';  // New variable for opponent's implicit name
    let isReturningToLobby = false; 
    let showCopied = false;
    let showQRCode = false;
    let roundTransitionActive = false;

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
        // Hide QR code modal if it's open
        showQRCode = false;

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
            // Update previousBid with the received bid, not the local bid controls state
            previousBid = data.bid;
            bid = { ...data.bid }; // Use a copy to avoid reference issues
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

    function checkUrlForConnection() {
        const urlParams = new URLSearchParams(window.location.search);
        const connectToPeerId = urlParams.get('connect');
        
        if (connectToPeerId) {
            // Clear the URL parameter without refreshing the page
            window.history.replaceState({}, '', window.location.pathname);
            // Set the connection ID and connect
            connectId = connectToPeerId;
            setTimeout(() => {
                connectToPeer();
            }, 1000); // Small delay to ensure peer is initialized
        }
    }

    onMount(() => {
      try{
      peer = new Peer();
      peer.on('open', (id) => {
        peerId = id;
        checkUrlForConnection(); // Check for connection params after peer is initialized
      });
    }
    catch(err){
      console.error(err);
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
      chatMessages = []
      gameState = 'playing';
      rollDice();
      // Host always goes first in the first round
      isMyTurn = isHost;
      message = isHost 
        ? "Game started! You're the host - make the first bid!"
        : `Game started! Waiting for ${opponentName}'s first bid...`;
    }
  
    function validateBid(newBid) {
      // First bid of the game is always valid
      if (!previousBid || previousBid.quantity === null || previousBid.value === null) {
        return true;
      }
      
      // Validate against previous bid
      if (newBid.quantity > previousBid.quantity) {
        return true;
      } else if (newBid.quantity === previousBid.quantity && newBid.value > previousBid.value) {
        return true;
      }
      
      return false;
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
      
      // Validate bid against previous bid
      if (!validateBid(bid)) {
        alert('Invalid bid! You must bid a higher quantity, or the same quantity with a higher value.');
        return;
      }
      
      // Send a copy of the current bid
      const bidToSend = { ...bid };
      connection.send({ type: 'bid', bid: bidToSend });
      
      // This player's bid becomes the previous bid for the next round
      previousBid = { ...bid };
      
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
          startRoundTransition();
      }
    }
  
    function startRoundTransition() {
        roundTransitionActive = true;
        
        setTimeout(() => {
            roundTransitionActive = false;
            resetRound();
        }, ANIMATION_CONFIG.delayBetweenRounds);
    }

    function resetRound(shouldRollDice = true) {
        if (shouldRollDice) {
            rollDice();
        }
        previousBid = { quantity: null, value: null }; // Reset previous bid for new round
        bid = { quantity: null, value: null };
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
      previousBid = { quantity: null, value: null }; // Reset previous bid for new game
      bid = { quantity: null, value: null };
      message = 'New game started!';
    }
  
    function rematch() {
      resetGame();
      connection.send({ type: 'rematch' });
    }
  
    function sendChatMessage() {
      if (!connection) {
          console.error('No connection available');
          return;
      }
      
      if (chatInput && chatInput.trim().length > 0) {
          const newMessage = { sender: 'You', message: chatInput.trim() };
          chatMessages = [...chatMessages, newMessage];
          connection.send({ type: 'chat', message: chatInput.trim() });
          chatInput = '';
      } else {
          console.error('Empty message, not sending');
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
        if (navigator.clipboard && window.isSecureContext) {
            // Modern approach
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback for HTTP
            const textArea = document.createElement("textarea");
            textArea.value = text;
            // Prevent scrolling to bottom
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
            } finally {
                textArea.remove();
            }
        }

        // Keep existing UI feedback
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

    function toggleQRCode() {
        showQRCode = !showQRCode;
    }
  </script>
  
  <main class="container mx-auto p-2 sm:p-4 relative max-w-4xl">
    <h1 class="text-2xl sm:text-3xl font-bold mb-4">Liar's Dice</h1>
  
    {#if gameState === 'lobby'}
      <div class="mb-4 space-y-3">
        <input
          type="text"
          bind:value={playerName}
          placeholder="Enter name (optional)"
          class="w-full sm:w-auto border p-2 mr-2 rounded"
        />
        <p class="my-2 text-sm sm:text-base">Your Connection Code: 
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
            <button
                class="ml-2 text-sm bg-gray-700 hover:bg-gray-600 p-1 rounded"
                on:click={toggleQRCode}
                aria-label="Show QR Code"
            >
                <i class="fas fa-qrcode"></i>
            </button>
        </p>
        <input
          type="text"
          bind:value={connectId}
          placeholder="Enter Connection Code to connect"
          class="w-full sm:w-auto border p-2 mr-2 rounded"
        />
        <button on:click={connectToPeer} class="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition duration-200">
          Connect to Opponent
        </button>
      </div>
    {:else if gameState === 'playing' || gameState === 'gameover'}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="space-y-4" class:transitioning={roundTransitionActive}>
          <DiceTray {dice} {diceCount} label="Your Dice" />  
          <h2 class="text-lg sm:text-xl font-bold mb-2">Current Bid:</h2>
          <p class="text-base sm:text-lg mb-4">{bid.quantity} x {bid.value}'s</p>
          
          <!-- Add previous bid display -->
          {#if previousBid && previousBid.quantity && previousBid.value}
            <h3 class="text-sm sm:text-base font-semibold text-gray-400">Previous Bid:</h3>
            <p class="text-sm sm:text-base text-gray-400 mb-4">{previousBid.quantity} x {previousBid.value}'s</p>
          {/if}
  
          {#if gameState === 'playing'}
            <div class="mb-4 text-base sm:text-lg font-bold {isMyTurn ? 'text-green-600' : 'text-red-600'}">
              {isMyTurn ? "It's your turn!" : `Waiting for ${opponentName}'s move...`}
            </div>
            <BidControls 
              bind:bid 
              {makeBid} 
              {challenge} 
              {validateBidValue} 
              {diceCount}
              {opponentDiceCount}
              {previousBid}
              {validateBid}
            />
          {/if}
  
          <p class="text-base sm:text-lg font-semibold">{message}</p>
  
        </div>
  
        <div>
          <h2 class="text-lg sm:text-xl font-bold mb-2 text-center">Opponent's Dice: {opponentDiceCount}</h2>
          <Chat 
            {chatMessages} 
            bind:chatInput 
            {sendChatMessage} 
            {surrender} 
          />
        </div>
      </div>
    {/if}
  </main>
  
  {#if gameState === 'gameover'}
  <GameOverModal {gameOverMessage} {diceCount} {opponentName} {opponentDiceCount} {rematch} {returnToLobby} />
  {/if}

  {#if showQRCode}
    <QRModal {peerId} closeModal={toggleQRCode} />
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
        animation: fadeInOut 1s ease-in-out;
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

    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    
    .transitioning {
        opacity: 0.6;
        transition: opacity 0.3s ease;
    }
  </style>