import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import Components from 'unplugin-vue-components/vite'
import RekaResolver from 'reka-ui/resolver'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    Components({
      collapseSamePrefixes: true,
      deep: true,
      prefix: 'App',
      extensions: ['vue', 'ts'],
      directives: true,
      resolvers: [
        RekaResolver({
          prefix: 'Reka',
        }),
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
