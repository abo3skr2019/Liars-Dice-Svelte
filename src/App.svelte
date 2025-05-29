<script>
  import LiarsDice from './lib/LiarsDice.svelte';
  import Footer from './components/Footer.svelte';
</script>

<div class="font-sans antialiased bg-[#1a1f2e] text-slate-200 dark:bg-[#1a1f2e] dark:text-slate-200 min-h-screen min-w-[320px] flex items-center justify-center">
  <div class="max-w-[1280px] mx-auto p-8 text-center">
    <main>
      <div class="p-8">
        <LiarsDice />
      </div>
    </main>
    <Footer />
  </div>
</div>
