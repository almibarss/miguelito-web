const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const config = require("./metadata.json");

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      metadata: config,
      template: "index.html",
    }),
  ],
  resolve: {
    alias: {
      "~styles": path.resolve(__dirname, "styles"),
    },
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        exclude: /index.html/,
        loader: "html-loader",
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.(c|sc|sa)ss$/,
        use: [
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              sassOptions: {
                includePaths: [path.resolve(__dirname, "css")],
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/,
        type: "asset",
      },
      {
        test: /\.(svg|eot|woff|woff2|ttf)$/,
        use: ["file-loader"],
      },
    ],
  },
};
