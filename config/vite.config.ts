//Vite configuration for a React app.
/*
configures dev server to listen on all interfaces listed 
enables componentTagger() from the lovable-tagger package 
adds a path alias that resolves to the src directory 
*/

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
}));
