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
    <h2 class="text-xl font-bold mb-2 text-center">{label}: {diceCount}</h2>
    <div class="flex justify-center gap-2 mx-auto min-h-12">
        {#each dice as roll, i (roll + '-' + i + '-' + Date.now())}
            <div class="relative w-10 h-10 sm:w-12 sm:h-12">
                <div 
                    class="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-200 rounded-lg shadow-md transition-transform hover:translate-y-[-2px] hover:shadow-lg cursor-pointer text-xl sm:text-2xl"
                    in:fly={{ 
                        y: 50,
                        duration: 500,
                        delay: getStaggerDelay(i),
                        easing: backOut
                    }}
                >
                    {#if roll === 1} <i class="fas fa-dice-one"></i> {/if}
                    {#if roll === 2} <i class="fas fa-dice-two"></i> {/if}
                    {#if roll === 3} <i class="fas fa-dice-three"></i> {/if}
                    {#if roll === 4} <i class="fas fa-dice-four"></i> {/if}
                    {#if roll === 5} <i class="fas fa-dice-five"></i> {/if}
                    {#if roll === 6} <i class="fas fa-dice-six"></i> {/if}
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    @keyframes appear {
        to {
            opacity: 1;
        }
    }
</style>