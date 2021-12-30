const path = require('path');
// let HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  mode: 'development',
  entry: {
    app: ['./index.js']
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: '/dist',
    filename: 'index.js'
  },
  devServer: {
    static: {
      directory: path.join(__dirname, '/'),
    },
    compress: true,
    port: 9000,
  },
}