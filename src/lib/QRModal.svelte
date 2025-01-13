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

<div class="modal-overlay" role="button" tabindex="0" transition:fade={{duration: 200}} on:click={closeModal} on:keydown={(e) => e.key === 'Enter' && closeModal()}>
    <div class="modal-content" role="dialog" transition:scale={{duration: 200, start: 0.95}} on:click|stopPropagation>
        <button class="close-button" on:click={closeModal}>×</button>
        <h2 class="text-xl font-bold mb-4">Scan QR Code to Connect</h2>
        <canvas bind:this={qrCanvas}></canvas>
        <p class="mt-4 text-sm">Scan this code with your mobile device to connect</p>
    </div>
</div>

<style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(4px);
    }

    .modal-content {
        background-color: #2d3748;
        padding: 2rem;
        border-radius: 0.75rem;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        text-align: center;
        position: relative;
        border: 1px solid #4a5568;
    }

    .close-button {
        position: absolute;
        top: 0.5rem;
        right: 0.75rem;
        font-size: 1.5rem;
        cursor: pointer;
        background: none;
        border: none;
        color: #e2e8f0;
    }

    canvas {
        border-radius: 0.5rem;
    }
</style>
