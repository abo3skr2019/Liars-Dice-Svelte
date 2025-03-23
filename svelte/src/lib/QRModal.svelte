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

<div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] backdrop-blur-sm" 
     role="button" 
     tabindex="0" 
     transition:fade={{duration: 200}} 
     on:click={closeModal} 
     on:keydown={(e) => e.key === 'Enter' && closeModal()}>
    <div class="bg-gray-800 p-8 rounded-xl shadow-lg text-center relative border border-gray-600 flex flex-col items-center" 
         role="dialog" 
         transition:scale={{duration: 200, start: 0.95}} 
         on:click|stopPropagation>
        <button 
            class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white text-2xl font-bold rounded-full hover:bg-gray-700 transition-colors duration-200" 
            on:click={closeModal}>×</button>
        <h2 class="text-xl font-bold mb-4">Scan QR Code to Connect</h2>
        <canvas class="rounded-lg mx-auto" bind:this={qrCanvas}></canvas>
        <p class="mt-4 text-sm">Scan this code with your mobile device to connect</p>
    </div>
</div>
