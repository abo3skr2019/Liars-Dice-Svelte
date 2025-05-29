<script>
    import { onMount } from 'svelte';
    import QRCode from 'qrcode';
    import { fade, scale } from 'svelte/transition';
    
    export let peerId;
    export let closeModal;
    
    let qrCanvas;
    
    onMount(async () => {
        if (qrCanvas) {
            // Create a URL that includes the peer ID as a parameter
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('connect', peerId);
            
            await QRCode.toCanvas(qrCanvas, currentUrl.toString(), {
                width: 256,
                margin: 2,
                color: {
                    light: '#2d3748',
                    dark: '#e2e8f0'
                }
            });
        }
    });
</script>

<div class="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] backdrop-blur-md" 
     role="button" 
     tabindex="0" 
     transition:fade={{duration: 300}} 
     on:click={closeModal} 
     on:keydown={(e) => e.key === 'Enter' && closeModal()}>
    <div class="bg-gray-800 p-8 rounded-xl shadow-2xl text-center relative border border-gray-600 flex flex-col items-center max-w-[90%] w-[380px]" 
         role="dialog" 
         transition:scale={{duration: 400, start: 0.95}} 
         on:click|stopPropagation>
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
            <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <i class="fas fa-qrcode text-white"></i>
            </div>
            <h2 class="text-xl font-bold">Scan QR Code</h2>
        </div>
        
        <!-- QR Canvas with better styling -->
        <div class="bg-white p-3 rounded-lg shadow-inner mb-4">
            <canvas class="rounded-lg mx-auto" bind:this={qrCanvas}></canvas>
        </div>
        
        <!-- Instructions -->
        <div class="text-center space-y-3">
            <p class="text-sm bg-gray-700 p-2 rounded-lg flex items-center">
                <i class="fas fa-info-circle mr-2 text-blue-400"></i>
                Scan this code with your mobile device to connect
            </p>
            
            <div class="text-xs text-gray-400 flex flex-col items-center">
                <p>OR</p>
                <p class="mt-2">Share this link with your opponent:</p>
                <code class="bg-gray-900 p-2 rounded mt-1 block truncate w-full text-xs">
                    {window.location.origin}?connect={peerId}
                </code>
            </div>
        </div>
    </div>
</div>
