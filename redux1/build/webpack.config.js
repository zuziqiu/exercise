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
    filename: 'whiteboard.pack.js',
    libraryTarget: 'umd',
    library: 'whiteBoard'
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
      // {
      //   test: /.js/,
      //   enforce: 'pre',
      //   exclude: /node_modules/,
      //   use: {
      //     loader: `jshint-loader`
      //   }
      //   // use: 'jshint-loader'
      // },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
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
