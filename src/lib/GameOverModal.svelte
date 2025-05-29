<script>
    
    import { fade, scale } from 'svelte/transition';
    export let gameOverMessage;
    export let diceCount;
    export let opponentName;
    export let opponentDiceCount;
    export let rematch;
    export let returnToLobby;
</script>

<div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm" transition:fade={{duration: 300}}>
    <div class="bg-gray-800 text-gray-200 p-8 rounded-xl shadow-2xl max-w-[90%] w-[450px] text-center border border-gray-600 relative overflow-hidden" transition:scale={{duration: 400, start: 0.9, opacity: 0, easing: (t) => {
        const bounceOut = --t * t * ((2.5 + 1) * t + 2.5) + 1;
        return Math.min(1, bounceOut);
    }}}>
        <!-- Background decorative elements -->
        <div class="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 opacity-10 rounded-full blur-xl"></div>
        <div class="absolute -bottom-20 -left-20 w-40 h-40 bg-yellow-500 opacity-10 rounded-full blur-xl"></div>
        
        <!-- Game over message with icon -->
        <div class="mb-6">
            {#if gameOverMessage.includes('Win') || gameOverMessage.includes('Congratulations')}
                <div class="w-20 h-20 bg-yellow-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl animate-bounce">
                    <i class="fas fa-trophy text-yellow-200"></i>
                </div>
                <h2 class="text-2xl font-bold text-yellow-300">{gameOverMessage}</h2>
            {:else if gameOverMessage.includes('lose')}
                <div class="w-20 h-20 bg-red-800 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                    <i class="fas fa-dizzy text-red-200"></i>
                </div>
                <h2 class="text-2xl font-bold text-red-300">{gameOverMessage}</h2>
            {:else if gameOverMessage.includes('Concede')}
                <div class="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                    <i class="fas fa-flag text-white"></i>
                </div>
                <h2 class="text-2xl font-bold">{gameOverMessage}</h2>
            {/if}
        </div>
        
        <!-- Final score with better visualization -->
        <div class="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
            <h3 class="text-lg mb-3 text-gray-300">Final Score</h3>
            <div class="grid grid-cols-2 gap-4">
                <div class="text-center">
                    <div class="text-xl font-bold mb-1">You</div>
                    <div class="flex justify-center">
                        {#each Array(diceCount) as _, i}
                            <i class="fas fa-dice text-blue-400 mx-0.5"></i>
                        {/each}
                        {#each Array(5 - diceCount) as _, i}
                            <i class="fas fa-dice text-gray-600 mx-0.5"></i>
                        {/each}
                    </div>
                    <div class="mt-1 text-lg font-bold">{diceCount} dice</div>
                </div>
                <div class="text-center">
                    <div class="text-xl font-bold mb-1">{opponentName}</div>
                    <div class="flex justify-center">
                        {#each Array(opponentDiceCount) as _, i}
                            <i class="fas fa-dice text-red-400 mx-0.5"></i>
                        {/each}
                        {#each Array(5 - opponentDiceCount) as _, i}
                            <i class="fas fa-dice text-gray-600 mx-0.5"></i>
                        {/each}
                    </div>
                    <div class="mt-1 text-lg font-bold">{opponentDiceCount} dice</div>
                </div>
            </div>
        </div>
        
        <!-- Action buttons -->
        <div class="flex gap-4 justify-center">
            <button
                on:click={rematch}
                class="bg-blue-600 hover:bg-blue-700 text-white p-3 px-6 rounded-lg transition duration-200 font-medium flex items-center shadow-lg hover:shadow-blue-800/20"
            >
                <i class="fas fa-redo mr-2"></i> Rematch
            </button>
            <button
                on:click={returnToLobby}
                class="bg-gray-600 hover:bg-gray-700 text-white p-3 px-6 rounded-lg transition duration-200 font-medium flex items-center shadow-lg"
            >
                <i class="fas fa-home mr-2"></i> Return to Lobby
            </button>
        </div>
    </div>
</div>

