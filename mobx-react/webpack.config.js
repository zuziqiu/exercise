var path = require('path');
var uglify = require('uglifyjs-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  entry: './src/main.jsx',
  watch: true,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "main.js"//打包后输出文件的文件名 
  },
  resolve: {
    alias: {
    },
  },
  module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              "presets": [
                [
                  "@babel/preset-env",
                  {
                    "useBuiltIns": "entry"
                  }
                ],
                "@babel/preset-react"
              ],
              "plugins": [
                ["@babel/plugin-proposal-decorators", { "legacy": true }],
                ["@babel/plugin-proposal-class-properties", { "loose" : true }]
              ]
            }
          }
        },
      // {
      //   test: /\.jsx?$/,
      //   exclude: /node_modules/,
      //   use: 'babel-loader'
      // },
    ]
  },
  plugins: [
    // new uglify(),
    new HtmlWebpackPlugin({
      filename: 'mobx-react.html',
      template: './src/mobx-react.html',
      inject: 'body',
      xhtml: true,
      chunks:['main'],
      minify: {
          keepClosingSlash: true,
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: false
      }
    }),
  ]
};