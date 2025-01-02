<script>
  import '@fortawesome/fontawesome-free/css/all.css';

  let numberOfDice = 1;
  let rolls = [];
  const maxDice = 5;

  function rollDice() {
    if (numberOfDice > maxDice) {
      numberOfDice = maxDice;
    }
    rolls = Array.from({ length: numberOfDice }, () => Math.floor(Math.random() * 6) + 1);
  }
</script>

<style>
  .dice {
    font-size: 2rem;
    cursor: pointer;
    display: inline-block;
    margin: 0.5rem;
  }
</style>

<div>
  <label for="diceCount">Number of Dice:</label>
  <input id="diceCount" type="number" bind:value={numberOfDice} max="5" />
  <button on:click={rollDice}>Roll</button>
</div>

<ul>
  {#each rolls as roll}
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