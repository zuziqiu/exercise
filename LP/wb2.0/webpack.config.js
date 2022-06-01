var path = require('path')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
console.log('###path==>', __dirname)
var wpConf = {
  mode: 'production',
  // mode: 'development',
  // devtool: 'eval',
  entry: './main.js',
  watch: false,
  optimization: {
    minimizer: []
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'whiteboard.pack.js',
    libraryTarget: 'umd',
    library: ''
  },
  resolve: {
    alias: {
      // _emittery: require.resolve("emittery")
    }
  },
  module: {
    rules: [
      // {
      //   test: /\.jsx?$/,
      //   exclude: /node_modules/,
      //   use: 'babel-loader'
      // },
      // {
      //   test: /\.js$/,
      //   exclude: /node_modules/,
      //   use: {
      //     loader: 'babel-loader',
      //     options: {
      //       presets: ['@babel/preset-env'],
      //       // presets: ['es2015'],
      //       plugins: [
      //         // "@babel/plugin-transform-async-to-generator",
      //         'transform-runtime',
      //         "syntax-async-functions",
      //       ]
      //     }
      //   }
      // },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  corejs: '3',
                  useBuiltIns: 'usage'
                }
              ]
            ],
            plugins: [
              // ["@babel/plugin-proposal-decorators", { "legacy": true }],
              ['@babel/plugin-proposal-class-properties', { loose: false }] // loose=false时，是使用Object.defineProperty定义属性，loose=ture，则使用赋值法直接定义
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
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    edge: '17',
                    firefox: '60',
                    chrome: '67',
                    safari: '11.1',
                    ie: '11'
                  },
                  corejs: '3',
                  useBuiltIns: 'usage'
                }
              ],
              'preact'
            ],
            plugins: [
              // ["@babel/plugin-proposal-decorators", { "legacy": true }],
              ['@babel/plugin-syntax-jsx']
              // ["@babel/plugin-proposal-class-properties", { "loose": true }]
            ]
          }
        }
      }
    ]
  },
  plugins: []
}
module.exports = (content, params, meta) => {
  wpConf.mode = params.mode
  // 差异化配置
  if (params.mode === 'development') {
    console.log('输出测试版')
    wpConf.watch = true
    wpConf.devtool = 'source-map'
    wpConf.plugins = []
  }
  // 正式版
  else {
    console.log('输出正式版')
    wpConf.optimization.minimizer.push(
      // new uglify({
      //   uglifyOptions: {
      //     mangle: {
      //       safari10: true
      //     },
      //     safari10: true
      //   }
      // })
      new TerserPlugin({
        terserOptions: {
          mangle: {
            safari10: true
          }
        }
      }),
      new OptimizeCSSAssetsPlugin({})
    )
  }
  return wpConf
}
