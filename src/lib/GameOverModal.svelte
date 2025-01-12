<script>
    export let gameOverMessage;
    export let diceCount;
    export let opponentName;
    export let opponentDiceCount;
    export let playAgain;
  </script>
  
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

<style>
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

</style>