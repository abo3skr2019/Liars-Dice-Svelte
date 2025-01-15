<script>
    import { afterUpdate } from 'svelte';
    export let chatMessages = [];
    export let chatInput = '';
    export let sendChatMessage;
    export let surrender;

    let chatContainer;

    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    afterUpdate(scrollToBottom);

    function handleKeypress(event) {
        if (event.key === 'Enter' && chatInput.trim().length > 0) {
            event.preventDefault();
            sendChatMessage();
        }
    }

    function handleSendClick() {
        if (chatInput.trim().length > 0) {
            sendChatMessage();
        }
    }
</script>

<h2 class="text-xl font-bold mb-2">Chat</h2>
<div 
    bind:this={chatContainer}
    class="border rounded p-2 h-64 overflow-y-auto mb-2"
>
    {#each chatMessages as chat}
        <p><strong>{chat.sender}:</strong> {chat.message}</p>
    {/each}
</div>
<div class="flex gap-2">
    <input
        type="text"
        bind:value={chatInput}
        placeholder="Type a message..."
        class="border p-2 rounded flex-grow"
        on:keypress={handleKeypress}
    />
    <button 
        on:click={handleSendClick}
        disabled={!chatInput.trim()}
        class="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
        Send
    </button>
    <button 
        on:click={surrender}
        class="bg-white hover:bg-gray-100 text-gray-800 border border-gray-400 p-2 rounded transition duration-200"
        title="Surrender"
        aria-label="Surrender"
    >
        <i class="fas fa-flag"></i>
    </button>
</div>