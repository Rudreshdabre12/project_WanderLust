
// postcss.config.mjs - CORRECTED VERSION
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}, // ← This was missing!
  },
};

export default config;