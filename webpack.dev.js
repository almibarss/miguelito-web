const { mergeWithRules } = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const common = require("./webpack.common.js");
const path = require("path");

const dev = {
  resolve: {
    fallback: {
      crypto: false,
    },
    alias: {
      awsconfig: path.resolve(__dirname, "aws-config.dev.js"),
    },
  },
  mode: "development",
  devtool: "inline-source-map",
  target: "web",
  devServer: {
    contentBase: "./dist",
  },
  plugins: [
    new MiniCssExtractPlugin({}),
  ],
  module: {
    rules: [
      {
        test: /\.(c|sc|sa)ss$/,
        use: [MiniCssExtractPlugin.loader],
      },

    ],
  },
};

// https://stackoverflow.com/a/73249173/13166837
module.exports = mergeWithRules({
  module: {
    rules: {
      test: "match",
      use: "prepend",
    },
  },
})(common, dev);
