<script>
    
    import { fade, scale } from 'svelte/transition';
    export let gameOverMessage;
    export let diceCount;
    export let opponentName;
    export let opponentDiceCount;
    export let rematch;
    export let returnToLobby;
</script>

<div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" transition:fade={{duration: 200}}>
    <div class="bg-gray-800 text-gray-200 p-8 rounded-xl shadow-xl max-w-[90%] w-[400px] text-center border border-gray-600" transition:scale={{duration: 200, start: 0.95}}>
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

