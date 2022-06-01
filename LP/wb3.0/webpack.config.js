const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
// const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

console.log('###path==>', __dirname)
var wpConf = {
  // mode: 'production',
  mode: 'development',
  devtool: 'false',
  entry: './src/main.js',
  watch: false,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'dist/whiteboard.pack.js',
    publicPath: '',
    libraryTarget: 'umd',
    library: '',
    jsonpFunction: 'whiteboardWebpackJsonp' // 画板内有异步加载包，画板作为外部引入的时候，webpackJsonp变量（webpack导出文件的时候会用到此变量）可能已经被占用，导致自身无法加载异步报而出错，这里定义一个画板自己的webpackJsonp
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: {
            safari10: true,
          },
        }
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
    splitChunks: {
      chunks: 'async', // 表示从哪些chunks里面抽取代码，除了三个可选字符串值 initial、async、all 之外，还可以通过函数来过滤所需的 chunks；
      minSize: 0, // 表示抽取出来的文件在压缩前的最小大小，默认为 30000；
      maxSize: 0, // 表示抽取出来的文件在压缩前的最大大小，默认为 0，表示不限制最大大小；
      minChunks: 1, // 表示被引用次数，默认为1；
      maxAsyncRequests: 5, //最大的按需(异步)加载次数，默认为 5；
      maxInitialRequests: 3, // 最大的初始化加载次数，默认为 3；
      // automaticNameDelimiter: '~', // 抽取出来的文件的自动生成名字的分割符，默认为 ~；
      name: false, // 抽取出来文件的名字，默认为 true，表示自动生成文件名；
      cacheGroups: { // 缓存组,可以继承/覆盖上面 splitChunks 中所有的参数值，除此之外还额外提供了三个配置，分别为：test, priority 和 reuseExistingChunk。
        // vendors: {
        //   test: /[\\/]node_modules[\\/]/, //表示要过滤 modules，默认为所有的 modules，可匹配模块路径或 chunk 名字，当匹配的是 chunk 名字的时候，其里面的所有 modules 都会选中；
        //   priority: -10 //表示抽取权重，数字越大表示优先级越高。因为一个 module 可能会满足多个 cacheGroups 的条件，那么抽取到哪个就由权重最高的说了算；
        // },
        // vendors: {
        //   // 拆分依赖，避免单文件过大拖慢页面展示
        //   name(module) {
        //     // 拆包
        //     const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
        //     // 进一步将Ant组件拆分出来,请根据情况来
        //     // const packageName = module.context.match(/[\\/]node_modules[\\/](?:ant-design-vue[\\/]es[\\/])?(.*?)([\\/]|$)/)[1]
        //     return `wb-${packageName.replace('@', '')}` // 部分服务器不允许URL带@
        //   },
        //   test: /[\\/]node_modules[\\/]/,
        //   priority: -10,
        //   chunks: 'async'
        // },
        vconsole: {
          // 拆分依赖，避免单文件过大拖慢页面展示
          name: 'vconsole',
          // name(module) {
          //   // 拆包
          //   const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
          //   // 进一步将Ant组件拆分出来,请根据情况来
          //   console.log('module.context===========> ',module.context)
          //   // const packageName = module.context.match(/[\\/]node_modules[\\/](?:ant-design-vue[\\/]es[\\/])?(.*?)([\\/]|$)/)[1]
          //   return `wb-${packageName.replace('@', '')}` // 部分服务器不允许URL带@
          // },
          test: /[\\/]node_modules[\\/]_?vconsole/,
          priority: 50,
          chunks: 'async'
        },
        axios: {
          // 拆分依赖，避免单文件过大拖慢页面展示
          name: 'axios',
          test: /[\\/]node_modules[\\/]_?axios/,
          priority: 50,
          chunks: 'async'
        },
        // default: {
        //   minChunks: 2,
        //   priority: -20,
        //   reuseExistingChunk: true // 表示是否使用已有的 chunk，如果为 true 则表示如果当前的 chunk 包含的模块已经被抽取出去了，那么将不会重新生成新的。
        // }
      }
    }
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
                  "corejs": "3",
                  "useBuiltIns": "usage"
                }
              ]
            ],
            "plugins": [
              ["@babel/plugin-proposal-decorators", { "legacy": true }],
              ["@babel/plugin-proposal-class-properties", { "loose": false }] // loose=false时，是使用Object.defineProperty定义属性，loose=ture，则使用赋值法直接定义
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
                  "corejs": "3",
                  "useBuiltIns": "usage" //usage 会根据配置的浏览器兼容，以及你代码中用到的 API 来进行 polyfill，实现了按需添加。
                }
              ],
              "@babel/preset-react"
            ],
            "plugins": [
              ["@babel/plugin-proposal-decorators", { "legacy": true }],
              ["@babel/plugin-proposal-class-properties", { "loose": false }]
            ]
          }
        }
      },
      {
        test: /\.less$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './dist',
            },
          },
          {
            loader: 'css-loader',
            // options: { url: false }
          },
          'less-loader'
        ]
      },
      {
        test: /\.(gif|jpg|png|woff|svg|eot|ttf|swf)\??.*$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            }
          },
          {
            loader: 'image-webpack-loader',
          }
        ]
      },
    ]
  },
  plugins: [
    // new uglify(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html',
      inject: 'body',
      xhtml: true,
      chunks: ['main'],
      minify: {
        keepClosingSlash: true,
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: false
      }
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css"
    }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*'], // 清空目录
      cleanAfterEveryBuildPatterns: ['!index.html'], // 保留不删除html
    })
  ]
};
module.exports = (content, params, meta) => {
  wpConf.mode = params.mode
  // 差异化配置
  if (params.mode === 'development') {
    console.log('输出测试版')
    wpConf.watch = true
    wpConf.devtool = 'source-map'
    if (params.remote) {
      wpConf.output.publicPath = 'https://static-1.talk-fun.com/open/maituo_v2/dist/client-whiteboard/v3.0.5/'
    }
  }
  // 正式版
  else {
    // 默认配置的具体配置项
    // new BundleAnalyzerPlugin({
    //   analyzerMode: 'server',
    //   analyzerHost: '127.0.0.1',
    //   analyzerPort: '8888',
    //   reportFilename: 'report.html',
    //   defaultSizes: 'parsed',
    //   openAnalyzer: true,
    //   generateStatsFile: false,
    //   statsFilename: 'stats.json',
    //   statsOptions: null,
    //   excludeAssets: null,
    //   logLevel: info
    // })
    wpConf.plugins.push(new BundleAnalyzerPlugin())
    wpConf.output.chunkFilename = `dist/whiteboard-[name].js`
    if (params.local) {
      console.log('输出本地正式版')
    } else {
      wpConf.output.publicPath = 'https://static-1.talk-fun.com/open/maituo_v2/dist/client-whiteboard/v3.0.5/'
      console.log('输出线上正式版')
    }
  }
  return wpConf
}
