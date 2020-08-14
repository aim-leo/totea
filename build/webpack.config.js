const path = require("path");

function formatEntry(list) {
  const entry = {}

  for (const item of list) {
    entry['totea' + item.substr(0, 1).toUpperCase() + item.substr(1)] = path.resolve(__dirname, "..", item + ".js")
  }

  return entry
}

module.exports = {
  entry: formatEntry([
    'types'
  ]),
  output: {
    path: path.resolve(__dirname, "..", "dist"),
    filename: context => {
      const resource = context.chunk.entryModule.resource
      return 'totea-' + resource.split('/').reverse()[0]
    },
    libraryTarget: "umd",
    library: "[name]"
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
