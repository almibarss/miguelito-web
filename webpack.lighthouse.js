const { mergeWithRules } = require("webpack-merge");

const pro = require("./webpack.pro.js");
const path = require("path");

const lighthouse = {
  resolve: {
    alias: {
      awsconfig: path.resolve(__dirname, "aws-config.dev.js"),
    },
  },
};

module.exports = mergeWithRules({
  module: {
    rules: {
      test: "match",
      use: "prepend",
    },
  },
})(pro, lighthouse);
