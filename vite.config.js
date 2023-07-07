export default {
  root: "src",

  server: {
    host: "0.0.0.0",
    port: 3000,
  },

  build: {
    outDir: "../dist",
    assetsDir: "",
    emptyOutDir: true,
    minify: "terser",
    terserOptions: {
      format: {
        comments: false,
      },
    },
  },

  preview: {
    host: "0.0.0.0",
    port: 3000,
  },

  plugins: [
    {
      name: "minify-index-html",
      transformIndexHtml: (html) => HTMLCollapseWhitespace(html),
    },
  ],
};

function HTMLCollapseWhitespace(html) {
  return html
    .replace(/(^|>)\s+(<|$)/g, "$1$2")
    .replace(/\s+(\/)?>/g, "$1>")
    .replace(/\s+/g, " ")
    .trim();
}
