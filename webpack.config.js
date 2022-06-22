const webpack = require("webpack");
const { resolve: resolvePath } = require("path");

module.exports = {
  entry: "./src/index.js",
  mode: "development",
  devtool: "source-map",
  output: {
    filename: "[name].js",
    path: `${__dirname}/dist`,
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
  devServer: {
    port: 9000,
    static: {
      directory: resolvePath(__dirname),
    },
  },
};
