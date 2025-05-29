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
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            Liar's Dice
        </h1>
        <div class="hidden sm:block">
            <span class="bg-gray-800 text-white py-1 px-3 rounded-full text-sm font-medium border border-gray-700">
                P2P Multiplayer
            </span>
        </div>
    </div>
  
    {#if gameState === 'lobby'}
      <div class="mb-4 bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
        <h2 class="text-xl font-bold mb-4 flex items-center">
          <i class="fas fa-dice mr-2 text-yellow-400"></i> Game Lobby
        </h2>
        
        <div class="space-y-5">
          <!-- Player Name Input -->
          <div class="mb-4">
            <label for="playerName" class="block text-sm font-medium mb-2">Your Name</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                <i class="fas fa-user text-gray-400"></i>
              </span>
              <input
                id="playerName"
                type="text"
                bind:value={playerName}
                placeholder="Enter your name (optional)"
                class="w-full border border-gray-600 bg-gray-700 p-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <!-- Connection Code -->
          <div class="bg-gray-900 p-4 rounded-lg border border-gray-700 mb-4">
            <label class="block text-sm font-medium mb-2">Your Connection Code</label>
            <div class="flex flex-wrap items-center gap-2">
              <span 
                id="peerId"
                class="font-mono bg-gray-700 text-gray-100 p-2 px-3 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors duration-200 flex-grow break-all relative"
                role="button"
                tabindex="0"
                on:click={() => copyToClipboard(peerId)}
                on:keydown={(e) => e.key === 'Enter' && copyToClipboard(peerId)}
              >
                <i class="fas fa-copy mr-2 text-sm text-blue-400"></i>
                {peerId}
                {#if showCopied}
                  <span class="copied-indicator bg-green-700 text-white text-xs py-1 px-2 rounded-md">Copied!</span>
                {/if}
              </span>
              <button
                class="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition duration-200 flex items-center"
                on:click={toggleQRCode}
                aria-label="Show QR Code"
              >
                <i class="fas fa-qrcode mr-1"></i>
                <span class="hidden sm:inline">QR Code</span>
              </button>
            </div>
          </div>
          
          <!-- Connect to Opponent -->
          <div class="mb-4">
            <label for="connectId" class="block text-sm font-medium mb-2">Connect to Opponent</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                <i class="fas fa-link text-gray-400"></i>
              </span>
              <input
                id="connectId"
                type="text"
                bind:value={connectId}
                placeholder="Paste your opponent's connection code"
                class="w-full border border-gray-600 bg-gray-700 p-2 pl-10 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              on:click={connectToPeer} 
              class="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-medium transition duration-200 flex items-center justify-center gap-2 shadow-md"
            >
              <i class="fas fa-gamepad"></i> Connect to Opponent
            </button>
          </div>
          
          <div class="text-sm text-gray-400 mt-4">
            <p><i class="fas fa-info-circle mr-1"></i> Share your connection code with an opponent or scan their QR code to begin.</p>
          </div>
        </div>
      </div>
    {:else if gameState === 'playing' || gameState === 'gameover'}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="bg-gray-800 p-5 rounded-lg shadow-lg border border-gray-700 space-y-4" class:transitioning={roundTransitionActive}>
          <!-- Game information header -->
          <div class="flex justify-between items-center mb-2">
            <div class="flex items-center">
              <span class="bg-gray-700 text-white py-1 px-3 rounded-full text-sm font-medium">
                Game with {opponentName}
              </span>
            </div>
            
            <!-- Turn indicator -->
            {#if gameState === 'playing'}
              <div class="flex items-center">
                <span class="relative flex h-3 w-3 mr-2">
                  <span class="{isMyTurn ? 'animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75' : 'animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'}"></span>
                  <span class="{isMyTurn ? 'relative inline-flex rounded-full h-3 w-3 bg-green-500' : 'relative inline-flex rounded-full h-3 w-3 bg-red-500'}"></span>
                </span>
                <span class="text-sm font-medium {isMyTurn ? 'text-green-400' : 'text-red-400'}">
                  {isMyTurn ? "Your Turn" : "Opponent's Turn"}
                </span>
              </div>
            {/if}
          </div>
          
          <!-- Dice Tray with animation -->
          <div class="relative transform hover:scale-105 transition-transform duration-200">
            <DiceTray {dice} {diceCount} label="Your Dice" />
          </div>
          
          <!-- Current and previous bids -->
          <div class="bg-gray-900 p-4 rounded-lg">
            <h2 class="text-lg sm:text-xl font-bold mb-2 flex items-center">
              <i class="fas fa-gavel mr-2 text-yellow-400"></i> Current Bid:
            </h2>
            <p class="text-base sm:text-xl mb-4 font-bold">
              {#if bid.quantity && bid.value}
                <span class="text-yellow-300">{bid.quantity}</span> × 
                <span class="text-white">
                  {#if bid.value === 1}<i class="fas fa-dice-one mr-1 text-blue-300"></i>{/if}
                  {#if bid.value === 2}<i class="fas fa-dice-two mr-1 text-blue-300"></i>{/if}
                  {#if bid.value === 3}<i class="fas fa-dice-three mr-1 text-blue-300"></i>{/if}
                  {#if bid.value === 4}<i class="fas fa-dice-four mr-1 text-blue-300"></i>{/if}
                  {#if bid.value === 5}<i class="fas fa-dice-five mr-1 text-blue-300"></i>{/if}
                  {#if bid.value === 6}<i class="fas fa-dice-six mr-1 text-blue-300"></i>{/if}
                  {bid.value}'s
                </span>
              {:else}
                <span class="text-gray-400">No bids yet</span>
              {/if}
            </p>
            
            <!-- Previous bid display with improved styling -->
            {#if previousBid && previousBid.quantity && previousBid.value}
              <div class="border-t border-gray-700 pt-3 mt-3">
                <h3 class="text-sm sm:text-base font-semibold text-gray-400 flex items-center">
                  <i class="fas fa-history mr-1"></i> Previous Bid:
                </h3>
                <p class="text-sm sm:text-base text-gray-400 mb-1">
                  {previousBid.quantity} × 
                  {#if previousBid.value === 1}<i class="fas fa-dice-one mr-1"></i>{/if}
                  {#if previousBid.value === 2}<i class="fas fa-dice-two mr-1"></i>{/if}
                  {#if previousBid.value === 3}<i class="fas fa-dice-three mr-1"></i>{/if}
                  {#if previousBid.value === 4}<i class="fas fa-dice-four mr-1"></i>{/if}
                  {#if previousBid.value === 5}<i class="fas fa-dice-five mr-1"></i>{/if}
                  {#if previousBid.value === 6}<i class="fas fa-dice-six mr-1"></i>{/if}
                  {previousBid.value}'s
                </p>
              </div>
            {/if}
          </div>
          
          {#if gameState === 'playing'}
            <div class="mb-4 text-base sm:text-lg font-bold text-center p-2 rounded {isMyTurn ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}">
              {isMyTurn ? "It's your turn to make a move!" : `Waiting for ${opponentName} to make a move...`}
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
          
          <!-- Game message with animation -->
          {#if message}
            <div class="bg-blue-900/30 border border-blue-700/50 p-3 rounded-lg shadow-inner">
              <p class="text-base sm:text-lg font-medium text-blue-200">{message}</p>
            </div>
          {/if}
        </div>
  
        <div class="space-y-4">
          <div class="bg-gray-900/50 p-3 rounded-lg flex items-center justify-between border-b border-gray-700">
            <h2 class="text-lg sm:text-xl font-bold flex items-center">
              <span class="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-800 mr-2">
                <i class="fas fa-user text-blue-400"></i>
              </span>
              {opponentName}
            </h2>
            <div class="flex items-center gap-2">
              <span class="bg-gray-800 text-white py-1 px-3 rounded-full text-sm font-medium flex items-center">
                <i class="fas fa-dice mr-1 text-yellow-400"></i> {opponentDiceCount}
              </span>
            </div>
          </div>
          
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
        font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
        min-height: 100vh;
    }

    /* Improve default focus styles for accessibility */
    :global(button:focus), :global(a:focus), :global(input:focus) {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
    }

    /* Nicer scrollbars */
    :global(::-webkit-scrollbar) {
        width: 8px;
        height: 8px;
    }

    :global(::-webkit-scrollbar-track) {
        background: #2d3748;
        border-radius: 8px;
    }

    :global(::-webkit-scrollbar-thumb) {
        background: #4a5568;
        border-radius: 8px;
    }

    :global(::-webkit-scrollbar-thumb:hover) {
        background: #718096;
    }

    /* Tooltip indicator styles */
    .copied-indicator {
        position: absolute;
        top: -30px;
        right: 0;
        animation: fadeInOut 1s ease-in-out;
        padding: 4px 8px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        font-size: 12px;
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
        50% { transform: scale(1.05); }
    }
    
    /* Page transition effects */
    h1 {
        position: relative;
        overflow: hidden;
    }
    
    h1::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(to right, #3b82f6, #10b981, #3b82f6);
        transform: scaleX(0);
        transform-origin: left;
        animation: underline-animation 2s ease-in-out forwards;
    }
    
    @keyframes underline-animation {
        to { transform: scaleX(1); }
    }
    
    .transitioning {
        opacity: 0.4;
        filter: blur(2px);
        transform: scale(0.98);
        transition: opacity 0.3s ease, filter 0.3s ease, transform 0.3s ease;
        pointer-events: none;
    }

    /* Make input fields more intuitive */
    :global(input[type="range"]::-webkit-slider-thumb) {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #4ade80;
        cursor: pointer;
        box-shadow: 0 0 5px rgba(74, 222, 128, 0.5);
    }

    :global(input[type="range"]:focus::-webkit-slider-thumb) {
        box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.5);
    }
  </style>