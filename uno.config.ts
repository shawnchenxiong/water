import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'Inter:400,600,800',
        mono: 'DM Mono:400,600',
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  shortcuts: [
    {
      // 常用快捷类
      'flex-center': 'flex items-center justify-center',
      'flex-col-center': 'flex flex-col items-center justify-center',
      'absolute-center': 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      'text-ellipsis': 'truncate overflow-hidden whitespace-nowrap',
      
      // 科技感边框
      'tech-border': 'border-2 border-cyan-400 shadow-[0_0_10px_rgba(0,212,255,0.5)]',
      'tech-border-glow': 'border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,212,255,0.8)]',
    },
  ],
  theme: {
    colors: {
      primary: '#00D4FF',
      'primary-dark': '#0099CC',
      'bg-dark': '#0A1628',
      'bg-darker': '#060D1A',
      'text-light': '#E5E7EB',
      'text-dim': '#9CA3AF',
    },
  },
})

