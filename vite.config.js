import { defineConfig } from 'vite';
export default defineConfig({build:{rollupOptions:{onwarn(warning,warn){if(warning.code==='MODULE_LEVEL_DIRECTIVE')return;warn(warning)},output:{manualChunks:{charts:['recharts'],motion:['framer-motion'],react:['react','react-dom']}}}}});
