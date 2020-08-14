const path = require("path");

module.exports = {
  entry: {
    types: path.resolve(__dirname, "..", "types.js"),
  },
  output: {
    path: path.resolve(__dirname, "..", "dist"),
    filename: "totea-[name].js",
    libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        // js
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
    ],
  },
  plugins: [],
};
