const { merge } = require("webpack-merge");

const common = require("./webpack.common.js");

module.exports = merge(common, {
  resolve: {
    fallback: {
      crypto: false,
    },
  },
  mode: "development",
  devtool: "inline-source-map",
  target: "web",
  devServer: {
    contentBase: "./dist",
  },
});
