<script>
    import { fade, fly } from 'svelte/transition';
    import { backOut } from 'svelte/easing';
    import { onMount } from 'svelte';
    
    export let dice = [];
    export let diceCount;
    export let label;
    export let behindOverlay = false; // New prop to control z-index
    
    let mounted = false;
    
    onMount(() => {
        mounted = true;
        return () => mounted = false;
    });

    function getStaggerDelay(index) {
        return index * 100; // Reduced from 150ms to 100ms
    }
</script>

<div class="dice-tray {behindOverlay ? 'behind-overlay' : ''}">
    <h2 class="text-xl font-bold mb-2 text-center">{label}: {diceCount}</h2>
    <div class="dice-container">
        {#each dice as roll, i (roll + '-' + i + '-' + Date.now())}
            <div class="dice-slot">
                <div 
                    class="dice" 
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
    .dice-container {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin: 0 auto;
        min-height: 3rem;
    }

    .dice-slot {
        flex: 0 0 auto;
        width: 2.5rem;
        height: 2.5rem;
        position: relative;
    }

    .dice {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #2d3748;
        color: #e2e8f0;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        transition: transform 0.2s;
        font-size: 1.5rem;
        cursor: pointer;
    }

    @media (min-width: 640px) {
        .dice-slot {
            width: 3rem;
            height: 3rem;
        }
        
        .dice {
            font-size: 2rem;
        }
    }

    .dice:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
    }

    .dice-tray {
        position: relative;
    }
    
    .behind-overlay {
        z-index: 1;
    }

    @keyframes appear {
        to {
            opacity: 1;
        }
    }
</style>