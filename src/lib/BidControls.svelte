<script>
  export let bid;
  export let makeBid;
  export let challenge;
  export let validateBidValue;
  export let diceCount;
  export let opponentDiceCount;
  export let previousBid;
  export let validateBid;
  $: totalDice = diceCount + opponentDiceCount;
  $: isValidBid = validateBid(bid);
    
    // Automatically adjust bid to be valid when previousBid changes
    $: if (previousBid && bid.quantity && bid.value) {
        if (!validateBid(bid)) {
            // If current bid is invalid, make it valid by incrementing
            if (previousBid.value < 6) {
                // Can increase the value
                bid.quantity = previousBid.quantity;
                bid.value = previousBid.value + 1;
            } else {
                // Must increase the quantity
                bid.quantity = previousBid.quantity + 1;
                bid.value = 1;
            }
        }
    }
    let minimumBid = calculateMinimumBid(previousBid,totalDice);

function calculateMinimumBid(previousBid, totalDice)
{
  if (previousBid && previousBid.quantity && previousBid.value) {
    // If previousBid.value < 6 and we only need to increase value
    if (previousBid.quantity < totalDice && previousBid.value < 6) {
      return { quantity: previousBid.quantity, value: previousBid.value + 1 };
    }
    // Otherwise increase quantity
    if (previousBid.quantity < totalDice) {
      return { quantity: previousBid.quantity + 1, value: previousBid.value };
    }
  }
  return { quantity: 1, value: 1 };
}

$: bidRequirementText = previousBid && previousBid.quantity && previousBid.value ? `You must bid at least ${minimumBid.quantity} ${minimumBid.value}s` : '';

</script>
<div class="mb-4">
    {#if previousBid && previousBid.quantity && previousBid.value}
        <div class="text-sm mb-3 text-gray-400">
            {bidRequirementText}
        </div>
    {/if}
    
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
            min="{minimumBid.quantity}"
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
            min={previousBid && bid.quantity === previousBid.quantity ? Math.max(minimumBid.value, previousBid.value + 1) : 1}
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
          class="w-full {isValidBid ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 cursor-not-allowed'} text-white p-2 rounded transition duration-200"
          disabled={!isValidBid}
          title={!isValidBid ? 'This bid is not higher than the previous bid' : 'Make this bid'}
        >
          Make Bid
        </button>
        <button 
          on:click={challenge}
          class="w-full bg-red-500 hover:bg-red-600 text-white p-2 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!previousBid}
          title={!previousBid ? 'Cannot challenge when there is no previous bid' : 'Challenge the last bid'}
        >
          Challenge
        </button>
      </div>
    </div>
</div>