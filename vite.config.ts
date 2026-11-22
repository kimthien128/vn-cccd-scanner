import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // dist/ chỉ chứa library; demo lấy assets từ public/ qua Vite dev server.
    copyPublicDir: false,
    lib: {
      entry: 'src/index.ts',
      name: 'VnCccdScanner',
      formats: ['es', 'cjs'],
      fileName: (format) => `vn-cccd-scanner.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      // Không đóng gói ZXing: consumer nhận qua dependencies (npm tự cài).
      external: ['@zxing/browser'],
    },
  },
});
