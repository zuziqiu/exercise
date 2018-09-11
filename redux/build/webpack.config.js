var path = require('path');
var uglify = require('uglifyjs-webpack-plugin');
module.exports = {
  // mode: 'production',
  // mode: 'development',
  entry: '../src/main.js',
  watch: true,
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'whiteboard.pack.js',
    libraryTarget: 'umd',
    library: 'whiteBoard'
  },
  module: {
    rules:[
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
      },
    ]
  },
  plugins: [
    new uglify()
  ]
};
