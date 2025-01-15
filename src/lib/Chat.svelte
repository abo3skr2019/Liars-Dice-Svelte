<script>
    
    import { afterUpdate } from 'svelte';
    export let chatMessages = [];
    export let chatInput = '';
    export let sendChatMessage;
    export let surrender;

    let chatContainer;
    let messageHistory = [];
    let historyIndex = -1;
    let showStickers = false;

    // Import all stickers from the public/stickers directory
    const stickerFiles = import.meta.glob('/public/stickers/**', {
  query: '?raw',
  import: 'default',
});
    console.log(stickerFiles)
    const stickers = Object.keys(stickerFiles).map(path => path.replace('/public', '/Liars-Dice-Svelte'));
    console.log(stickers)

    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    afterUpdate(scrollToBottom);

    function handleKeypress(event) {
        if (event.key === 'Enter' && chatInput.trim().length > 0) {
            event.preventDefault();
            // Only add to history if different from last message
            if (messageHistory.length === 0 || messageHistory[0] !== chatInput) {
                messageHistory.unshift(chatInput);
            }
            historyIndex = -1;
            sendChatMessage();
        }
    }

    function handleKeydown(event) {
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (historyIndex < messageHistory.length - 1) {
                historyIndex++;
                chatInput = messageHistory[historyIndex];
            }
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (historyIndex > -1) {
                historyIndex--;
                chatInput = historyIndex === -1 ? '' : messageHistory[historyIndex];
            }
        }
    }

    function handleSendClick() {
        if (chatInput.trim().length > 0) {
            sendChatMessage();
        }
    }

    function handleStickerClick(sticker) {
        chatInput = `[sticker:${sticker}]`;
        showStickers = false;
        sendChatMessage();
    }
</script>

<h2 class="text-xl font-bold mb-2">Chat</h2>
<div 
    bind:this={chatContainer}
    class="border rounded p-2 h-64 overflow-y-auto mb-2"
>
    {#each chatMessages as chat}
        {#if chat.message.startsWith('[sticker:')}
            {@const stickerName = chat.message.slice(9, -1)}
            <p class="flex items-center gap-2">
                <strong>{chat.sender}:</strong>
                <img src={`${stickerName}`} alt="sticker" class="w-24 h-24 object-contain"/>
            </p>
        {:else}
            <p><strong>{chat.sender}:</strong> {chat.message}</p>
        {/if}
    {/each}
</div>
<div class="flex gap-2 relative">
    <button 
        on:click={() => showStickers = !showStickers}
        class="shrink-0 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 p-2 rounded transition duration-200"
        title="Add sticker"
        aria-label="Add sticker"
    >
        <i class="fas fa-smile"></i>
    </button>
    <input
        type="text"
        bind:value={chatInput}
        placeholder="Type a message..."
        class="border p-2 rounded w-0 flex-grow min-w-0"
        on:keypress={handleKeypress}
        on:keydown={handleKeydown}
    />
    <button 
        on:click={handleSendClick}
        disabled={!chatInput.trim()}
        class="shrink-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
        Send
    </button>
    <button 
        on:click={surrender}
        class="shrink-0 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 p-2 rounded transition duration-200"
        title="Surrender"
        aria-label="Surrender"
    >
        <i class="fas fa-flag"></i>
    </button>
    
    {#if showStickers}
        <div class="absolute bottom-full mb-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-2 grid grid-cols-3 gap-2">
            {#each stickers as sticker}
                <button
                    on:click={() => handleStickerClick(sticker)}
                    class="p-2 hover:bg-gray-700 rounded transition duration-200"
                >
                    <img src={`${sticker}`} alt={sticker} class="w-12 h-12 object-contain"/>
                </button>
            {/each}
        </div>
    {/if}
</div>