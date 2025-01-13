<script>
    export let bid;
    export let makeBid;
    export let challenge;
    export let validateBidValue;
</script>

<div class="mb-4">
    <div class="flex justify-center mb-2">
      <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full max-w-[340px]">
        <input
          type="number"
          min="1"
          bind:value={bid.quantity}
          class="border p-2 rounded w-full sm:w-1/2 text-base"
          placeholder="Number of dice"
        />
        <input
          type="number"
          min="1"
          max="6"
          bind:value={bid.value}
          on:change={validateBidValue}
          class="border p-2 rounded w-full sm:w-1/2 text-base"
          placeholder="Dice face"
        />
      </div>
    </div>
    <div class="flex justify-center">
      <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full max-w-[340px]">
        <button 
          on:click={makeBid}
          class="w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded transition duration-200"
        >
          Make Bid
        </button>
        <button 
          on:click={challenge}
          class="w-full bg-red-500 hover:bg-red-600 text-white p-2 rounded transition duration-200"
          disabled={!bid.quantity || !bid.value}
        >
          Challenge
        </button>
      </div>
    </div>
</div>