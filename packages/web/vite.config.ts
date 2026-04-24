// packages/web/vite.config.ts
// Vite 构建配置 —— Web 应用的打包、开发和插件配置

import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // 插件：React JSX 转换 + Tailwind CSS
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // 路径别名：@ 指向 src 目录
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    // 开发服务器端口
    port: 3000,
  },
})
