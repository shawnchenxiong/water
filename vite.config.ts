import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())
  
  return {
    base: '/', // 明确设置基础路径
    plugins: [
    vue(),
    UnoCSS(),
    // 自动导入 Vue、Vue Router、Pinia 相关 API
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
      resolvers: [
        ElementPlusResolver({
          importStyle: false, // 禁用自动导入样式，使用自定义主题
        }),
      ],
      dts: 'src/auto-imports.d.ts',
    }),
    // 自动导入组件
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: false, // 禁用自动导入样式，使用自定义主题
        }),
      ],
      dts: 'src/components.d.ts',
    }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        // WebSocket 代理（需要放在 /jeecg-boot 之前，更精确匹配）
        '/jeecg-boot/websocket': {
          target: env.VITE_PROXY_WS_TARGET || 'wss://service.ccswkj.cn',
          changeOrigin: true,
          ws: true, // 启用 WebSocket 代理
        },
        // 代理真实后端API请求，解决跨域问题
        '/jeecg-boot': {
          target: env.VITE_PROXY_TARGET || 'https://service.ccswkj.cn',
          changeOrigin: true,
          // 不需要 rewrite，因为后端路径就包含 /jeecg-boot 前缀
        },
      },
    },
    build: {
      target: 'es2015',
      cssTarget: 'chrome79',
      chunkSizeWarningLimit: 2000,
      sourcemap: env.VITE_SOURCEMAP === 'true', // 根据环境变量控制 sourcemap
      rollupOptions: {
        output: {
          // 优化代码分割
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'element-plus': ['element-plus'],
            'echarts': ['echarts'],
          },
          // 确保资源文件名稳定
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler', // 使用现代 Sass API，消除 deprecation 警告
        },
      },
    },
  }
})

