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
    const stickers = Object.keys(stickerFiles).map(path => path.replace('/public', ''));
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

<div class="bg-gray-800 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
    <h2 class="text-xl font-bold p-3 bg-gray-900 border-b border-gray-700 flex items-center">
        <i class="fas fa-comments mr-2 text-blue-400"></i> Chat
    </h2>
    <div 
        bind:this={chatContainer}
        class="p-3 h-64 overflow-y-auto mb-0 space-y-2"
    >
        {#if chatMessages.length === 0}
            <p class="text-center text-gray-400 my-4">No messages yet.</p>
        {/if}
        {#each chatMessages as chat}
            <div class="py-1 {chat.sender === 'You' ? 'text-right' : 'text-left'}">
                {#if chat.message.startsWith('[sticker:')}
                    {@const stickerName = chat.message.slice(9, -1)}
                    <div class="{chat.sender === 'You' ? 'ml-auto' : 'mr-auto'} flex flex-col max-w-[80%]">
                        <span class="text-xs text-gray-400 mb-1">{chat.sender}</span>
                        <div class="inline-block">
                            <img src={`${stickerName}`} alt="sticker" class="w-24 h-24 object-contain rounded"/>
                        </div>
                    </div>
                {:else}
                    <div class="{chat.sender === 'You' ? 'ml-auto bg-blue-600' : 'mr-auto bg-gray-700'} inline-block px-3 py-2 rounded-lg max-w-[80%] shadow">
                        <span class="text-xs text-gray-300 block mb-1">{chat.sender}</span>
                        <span class="break-words">{chat.message}</span>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
    <div class="flex gap-2 p-3 bg-gray-900 border-t border-gray-700">
        <button 
            on:click={() => showStickers = !showStickers}
            class="shrink-0 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center transition duration-200"
            title="Add sticker"
            aria-label="Add sticker"
        >
            <i class="fas fa-smile"></i>
        </button>
        <input
            type="text"
            bind:value={chatInput}
            placeholder="Type a message..."
            class="border border-gray-700 bg-gray-800 text-white p-2 rounded-full w-0 flex-grow min-w-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
            on:keypress={handleKeypress}
            on:keydown={handleKeydown}
        />
        <button 
            on:click={handleSendClick}
            disabled={!chatInput.trim()}
            class="shrink-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
        >
            <i class="fas fa-paper-plane"></i>
        </button>
        <button 
            on:click={surrender}
            class="shrink-0 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center transition duration-200"
            title="Surrender"
            aria-label="Surrender"
        >
            <i class="fas fa-flag"></i>
        </button>
    </div>
    
    {#if showStickers}
        <div class="absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-3 z-50 max-h-[300px] overflow-y-auto w-full max-w-md">
            <div class="flex justify-between items-center mb-2 pb-2 border-b border-gray-700">
                <h3 class="font-bold text-sm">Choose a Sticker</h3>
                <button 
                    class="text-gray-400 hover:text-white"
                    on:click={() => showStickers = false}
                >
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {#each stickers as sticker}
                    <button
                        on:click={() => handleStickerClick(sticker)}
                        class="p-2 hover:bg-gray-700 rounded transition duration-200 border border-gray-700 hover:border-blue-500"
                    >
                        <img src={`${sticker}`} alt={sticker} class="w-12 h-12 object-contain hover:scale-110 transition-transform duration-200"/>
                    </button>
                {/each}
            </div>
        </div>
    {/if}
</div>