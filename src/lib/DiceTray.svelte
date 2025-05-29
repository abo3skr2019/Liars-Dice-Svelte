<script>
    import { fade, fly } from 'svelte/transition';
    import { backOut } from 'svelte/easing';
    import { onMount } from 'svelte';
    
    export let dice = [];
    export let diceCount;
    export let label;
    
    let mounted = false;
    
    onMount(() => {
        mounted = true;
        return () => mounted = false;
    });

    function getStaggerDelay(index) {
        return index * 100;
    }
</script>

<div class="relative">
    <div class="bg-gray-900/60 rounded-lg p-4 pb-6 shadow-inner border-t border-gray-800">
        <h2 class="text-xl font-bold mb-4 text-center flex items-center justify-center">
            <span class="bg-blue-600/20 border border-blue-500/30 rounded-full px-3 py-1">
                {label}: <span class="text-blue-300">{diceCount}</span>
            </span>
        </h2>
        <div class="flex justify-center gap-3 mx-auto min-h-16 mb-2">
            {#each dice as roll, i (roll + '-' + i + '-' + Date.now())}
                <div class="relative w-12 h-12 sm:w-14 sm:h-14">
                    <div 
                        class="absolute inset-0 flex items-center justify-center dice-3d text-gray-200 rounded-lg shadow-lg cursor-pointer text-xl sm:text-2xl transform-gpu"
                        in:fly={{ 
                            y: 80,
                            duration: 600,
                            delay: getStaggerDelay(i),
                            easing: backOut
                        }}
                    >
                        {#if roll === 1}
                            <i class="fas fa-dice-one text-blue-300"></i>
                        {:else if roll === 2}
                            <i class="fas fa-dice-two text-green-300"></i>
                        {:else if roll === 3}
                            <i class="fas fa-dice-three text-yellow-300"></i>
                        {:else if roll === 4}
                            <i class="fas fa-dice-four text-red-300"></i>
                        {:else if roll === 5}
                            <i class="fas fa-dice-five text-purple-300"></i>
                        {:else if roll === 6}
                            <i class="fas fa-dice-six text-orange-300"></i>
                        {/if}
                    </div>
                </div>
            {/each}
            
            {#if dice.length < diceCount}
                {#each Array(diceCount - dice.length) as _, i}
                    <div class="relative w-12 h-12 sm:w-14 sm:h-14">
                        <div class="absolute inset-0 flex items-center justify-center bg-gray-700/50 text-gray-500 rounded-lg border border-gray-700">
                            <i class="fas fa-dice"></i>
                        </div>
                    </div>
                {/each}
            {/if}
        </div>
    </div>
</div>

<style>
    @keyframes appear {
        to {
            opacity: 1;
        }
    }
    
    .dice-3d {
        background: linear-gradient(145deg, #2d3748, #1a202c);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3),
                   -2px -2px 10px rgba(255, 255, 255, 0.05);
        transition: all 0.2s ease;
    }
    
    .dice-3d:hover {
        transform: translateY(-4px) rotate(5deg);
        box-shadow: 8px 8px 20px rgba(0, 0, 0, 0.4),
                   -2px -2px 10px rgba(255, 255, 255, 0.05);
    }
</style>