var path = require('path');
var uglify = require('uglifyjs-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  entry: './src/main.jsx',
  watch: true,
  devtool: 'eval',
  mode: 'development',
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
        test: /\.js$/,
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
              ]
            ],
            "plugins": [
              ["@babel/plugin-proposal-decorators", { "legacy": true }],
              ["@babel/plugin-proposal-class-properties", { "loose": true }]
            ]
          }
        }
      },
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
              ["@babel/plugin-proposal-class-properties", { "loose": true }]
            ]
          }
        }
      },
    ]
  },
  plugins: [
    // new uglify(),
    new HtmlWebpackPlugin({
      filename: 'mobx.html',
      template: './src/mobx.html',
      inject: 'head',
      xhtml: true,
      chunks: ['main'],
      minify: {
        keepClosingSlash: true,
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: false
      }
    }),
  ]
};