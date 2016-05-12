module.exports = {
  context: __dirname,
    entry: "./lib/entry.js",
    output: {
      path: "./lib",
    filename: "bundle.js"
  },
  devtool: 'source-map'
};
