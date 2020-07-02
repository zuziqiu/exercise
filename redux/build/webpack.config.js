var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var uglify = require('uglifyjs-webpack-plugin');
module.exports = {
  // mode: 'production',
  mode: 'development',
  entry: '../src/main.js',
  watch: true,
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'privateRedux.js',
    libraryTarget: 'umd',
    library: 'privateRedux'
  },
  resolve: {
    alias: {
      'redux': require.resolve('redux'),
      'vconsole': require.resolve('vconsole'),
      'preact': require.resolve('preact'),
      'preact-redux': require.resolve('preact-redux')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new uglify(),
    new HtmlWebpackPlugin({
      filename: 'redux.html',
      template: './../src/redux.html',
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
