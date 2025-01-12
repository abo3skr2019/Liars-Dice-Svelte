<script>
  export let dice = [];
  export let diceCount;
  export let label;
</script>

<h2 class="text-xl font-bold mb-2 text-center">{label}: {diceCount}</h2>
<ul class="flex justify-center space-x-2 mb-4">
  {#each dice as roll}
    <li class="dice">
      {#if roll === 1} <i class="fas fa-dice-one"></i> {/if}
      {#if roll === 2} <i class="fas fa-dice-two"></i> {/if}
      {#if roll === 3} <i class="fas fa-dice-three"></i> {/if}
      {#if roll === 4} <i class="fas fa-dice-four"></i> {/if}
      {#if roll === 5} <i class="fas fa-dice-five"></i> {/if}
      {#if roll === 6} <i class="fas fa-dice-six"></i> {/if}
    </li>
  {/each}
</ul>

<style>
    .dice {
        font-size: 2rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 3rem;
        height: 3rem;
        background-color: #2d3748;
        color: #e2e8f0;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        transition: all 0.2s;
    }
    
    .dice:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
    }
</style>