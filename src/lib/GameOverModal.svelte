<script>
    import { fade, scale } from 'svelte/transition';
    export let gameOverMessage;
    export let diceCount;
    export let opponentName;
    export let opponentDiceCount;
    export let rematch;
    export let returnToLobby;
</script>

<div class="modal-overlay" transition:fade={{duration: 200}}>
    <div class="modal-content" transition:scale={{duration: 200, start: 0.95}}>
        <h2 class="text-2xl font-bold mb-4">{gameOverMessage}</h2>
        <p class="mb-4">
            Final Score:<br>
            You: {diceCount} dice<br>
            {opponentName}: {opponentDiceCount} dice
        </p>
        <div class="flex gap-4 justify-center">
            <button
                on:click={rematch}
                class="bg-blue-500 hover:bg-blue-600 text-white p-2 px-6 rounded transition duration-200"
            >
                Rematch
            </button>
            <button
                on:click={returnToLobby}
                class="bg-gray-500 hover:bg-gray-600 text-white p-2 px-6 rounded transition duration-200"
            >
                Return to Lobby
            </button>
        </div>
    </div>
</div>

<style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(4px);
    }

    .modal-content {
        background-color: #2d3748;
        color: #e2e8f0;
        padding: 2rem;
        border-radius: 0.75rem;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        max-width: 90%;
        width: 400px;
        text-align: center;
        border: 1px solid #4a5568;
    }
</style>