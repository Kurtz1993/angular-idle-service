const path = require("path");
const webpackRxjsExternals = require("webpack-rxjs-externals");

module.exports = {
  entry: "./src/index.ts",
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    path: path.join(__dirname, "/dist"),
    filename: "angular-idle-service.js",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "awesome-typescript-loader",
      },
    ],
  },

  devtool: "source-map",

  externals: [
    webpackRxjsExternals(),
    "angular"
  ],
};
