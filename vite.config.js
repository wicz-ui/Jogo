import { defineConfig } from "vite";

export default defineConfig({
  // Phaser é um bundle único grande por natureza; o limite evita um aviso
  // não acionável durante este protótipo, sem alterar o código do jogo.
  build: {
    chunkSizeWarningLimit: 1500
  }
});
