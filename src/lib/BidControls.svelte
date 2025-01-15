<script>
    export let bid;
    export let makeBid;
    export let challenge;
    export let validateBidValue;
    export let diceCount;
    export let opponentDiceCount;

    $: totalDice = diceCount + opponentDiceCount;
</script>

<div class="mb-4">
    <div class="flex justify-center mb-2">
      <div class="flex flex-col w-full max-w-[340px] space-y-4">
        <div class="w-full">
          <div class="flex justify-between mb-1">
            <label for="quantity">Number of Dice: {bid.quantity || 1}</label>
            <span class="text-sm text-gray-400">Max: {totalDice}</span>
          </div>
          <input
            id="quantity"
            type="range"
            min="1"
            max={totalDice}
            bind:value={bid.quantity}
            class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500 "
          />
        </div>
        <div class="w-full">
          <div class="flex justify-between mb-1">
            <label for="value">Dice Face: {bid.value || 1}</label>
          </div>
          <input
            id="value"
            type="range"
            min="1"
            max="6"
            bind:value={bid.value}
            on:change={validateBidValue}
            class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500 "
          />
        </div>
      </div>
    </div>
    <div class="flex justify-center mt-4">
      <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full max-w-[340px]">
        <button 
          on:click={makeBid}
          class="w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded transition duration-200"
        >
          Make Bid
        </button>
        <button 
          on:click={challenge}
          class="w-full bg-red-500 hover:bg-red-600 text-white p-2 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!bid.quantity || !bid.value}
        >
          Challenge
        </button>
      </div>
    </div>
</div>