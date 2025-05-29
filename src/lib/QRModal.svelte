<script>
    import { onMount } from 'svelte';
    import QRCode from 'qrcode';
    import { fade, scale } from 'svelte/transition';
    
    export let peerId;
    export let closeModal;
    
    let qrCanvas;
    let showCopied = false;
    let modalElement;
    
    // Trap focus in modal when it opens
    const focusFirstElement = (node) => {
        setTimeout(() => {
            const focusableElements = Array.from(node.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        }, 50);
    };
    
    onMount(async () => {
        if (qrCanvas) {
            // Create a URL that includes the peer ID as a parameter
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('connect', peerId);
            
            await QRCode.toCanvas(qrCanvas, currentUrl.toString(), {
                width: 256,
                margin: 2,
                color: {
                    light: '#374151', // Darker background (gray-700)
                    dark: '#d1d5db'  // Slightly dimmer foreground (gray-300)
                }
            });
        }
    });
</script>

<div class="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] backdrop-blur-md" 
     transition:fade={{duration: 300}}>
    <div class="bg-gray-800 p-8 rounded-xl shadow-2xl text-center relative border border-gray-600 flex flex-col items-center max-w-[90%] w-[450px]" 
         role="dialog"
         aria-modal="true"
         aria-labelledby="modal-title"
         tabindex="-1"
         bind:this={modalElement}
         use:focusFirstElement
         transition:scale={{duration: 400, start: 0.95}} 
         on:keydown={(e) => {
             if (e.key === 'Escape') {
                 closeModal();
                 e.preventDefault();
             }
             if (e.key === 'Tab') {
                 // Keep focus trapped inside modal
                 const focusableElements = Array.from(e.currentTarget.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
                 if (focusableElements.length > 0) {
                     const firstElement = focusableElements[0];
                     const lastElement = focusableElements[focusableElements.length - 1];
                     
                     if (e.shiftKey && document.activeElement === firstElement) {
                         e.preventDefault();
                         lastElement.focus();
                     } else if (!e.shiftKey && document.activeElement === lastElement) {
                         e.preventDefault();
                         firstElement.focus();
                     }
                 }
             }
         }}>
        <!-- Overlay for click handling -->
        <div 
            class="absolute inset-0 -z-10" 
            on:click={closeModal}
            role="presentation"
            aria-hidden="true"
        ></div>
        <!-- Close button enhanced with animation -->
        <button 
            class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white text-xl rounded-full bg-gray-700 hover:bg-red-600 transition-all duration-200 shadow-lg" 
            on:click={closeModal}
            aria-label="Close"
        >
            <i class="fas fa-times"></i>
        </button>
        
        <!-- Title with icon -->
        <div class="flex items-center justify-center mb-6 gap-3">
            <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center" aria-hidden="true">
                <i class="fas fa-qrcode text-white"></i>
            </div>
            <h2 id="modal-title" class="text-xl font-bold">Scan QR Code</h2>
        </div>
        
        <!-- QR Canvas with dark mode styling -->
        <div class="p-3 rounded-lg shadow-inner mb-4">
            <canvas class="rounded-lg mx-auto" bind:this={qrCanvas} aria-label="QR code to connect with peer ID"></canvas>
        </div>
        
        <!-- Instructions -->
        <div class="text-center space-y-3 w-full">
            <p class="text-sm bg-gray-700 p-3 rounded-lg flex items-center justify-center">
                <i class="fas fa-info-circle mr-2 text-blue-400" aria-hidden="true"></i>
                <span>Scan this code with your mobile device to connect</span>
            </p>
            
            <div class="text-xs text-gray-400 flex flex-col items-center w-full">
                <p>OR</p>
                <p class="mt-2">Share this link with your opponent:</p>
                <div class="w-full overflow-hidden relative">
                    <code id="connection-link" class="bg-gray-900 p-2 pr-10 rounded mt-1 block w-full text-xs overflow-x-auto whitespace-nowrap">
                        {window.location.origin}?connect={peerId}
                    </code>
                    <button 
                        class="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-1 rounded w-8 h-8 flex items-center justify-center transition-colors duration-200"
                        on:click={() => {
                            navigator.clipboard.writeText(`${window.location.origin}?connect=${peerId}`);
                            showCopied = true;
                            setTimeout(() => showCopied = false, 2000);
                        }}
                        aria-label="Copy connection link"
                        aria-describedby="connection-link"
                    >
                        <i class="fas {showCopied ? 'fa-check' : 'fa-copy'}" aria-hidden="true"></i>
                    </button>
                </div>
                {#if showCopied}
                    <p class="text-xs text-green-400 mt-1" role="status" aria-live="polite">Copied to clipboard!</p>
                {/if}
            </div>
        </div>
    </div>
</div>
