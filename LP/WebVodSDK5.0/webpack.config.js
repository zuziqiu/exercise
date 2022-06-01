/**
 * vod => 点播配置文件
 */
var webpack = require('webpack')
var path = require('path')
var childProcess = require('child_process')
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const importRetry = require('./importRetry.js')

// resolve fn.
const resolve = (dir) => path.resolve(__dirname, dir)
const getBranch = childProcess.execSync('git name-rev --name-only HEAD', { encoding: 'utf8' }).replace(/\n|\s/, '')
const getComitId = childProcess.execSync('git rev-parse HEAD', { encoding: 'utf8' }).replace(/\n|\s/, '')
let gitBranchName = getBranch + ' / ' + getComitId

// var appender = require('webpack-loader-append-prepend')
// const SDK_VERSION = '4.0
var vcode = {
  version: 'test' // 版本号
}

// 配置
var baseConf = {
  mode: 'production',
  entry: './src/main.js',
  watch: false,
  target: 'web',
  resolve: {
    alias: {
      '@' : path.resolve(__dirname,'./src')
      // '@common': path.resolve(__dirname, './src/common/'), //common
      // '@Request': path.resolve(__dirname, './src/common/utils/request'), // request
      // '@Store': path.resolve(__dirname, './src/core/store'), // store
      // '@Static': path.resolve(__dirname, './src/core/mt.static')
    }
  },
  module: {
    rules: [
      // 兼容处理
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components|vendor)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  corejs: '3',
                  useBuiltIns: 'usage' //usage 会根据配置的浏览器兼容，以及你代码中用到的 API 来进行 polyfill，实现了按需添加。
                }
              ]
            ],
            plugins: [
              ['@babel/plugin-transform-runtime'],
              ['@babel/plugin-proposal-decorators', { legacy: true }],
              ['@babel/plugin-proposal-class-properties', { loose: false }] // loose=false时，是使用Object.defineProperty定义属性，loose-ture，则使用赋值法直接定义
              // [
              // 笔者为了兼容IE8才用了这个插件，代价是不能tree shaking
              // 没有IE8兼容需求的同学可以把这个插件去掉
              // '@babel/plugin-transform-modules-commonjs'
              // ]
            ]
          }
        }
      },      {
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
          'style-loader',
          {
            loader: 'css-loader'
            // options: { url: false }
          },
          'less-loader'
        ]
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader'
            // options: { url: false }
          }
        ]
      },
      {
        test: /\.(gif|jpg|png|woff|svg|eot|ttf|swf)\??.*$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192
            }
          },
          {
            loader: 'image-webpack-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*'] // 清空目录
      // cleanAfterEveryBuildPatterns: ['!index.html'], // 保留不删除html
    }),
    // build正式包时需要分析包拆分和大小
    new BundleAnalyzerPlugin(),
    // importRetry webpack分包处理资源重试的plugins
    new importRetry({
      cdnDosdkClass: 'static-1.talk-fun.com',
      fmtRequireUrlFuncStr: function (htmlNode, chunkId, __webpack_require__, options) {
        var nodeName = htmlNode.nodeName
        if (nodeName == 'LINK') {
          // linkKey = 'href';
          return
        }
        var modifyReloadQry = function (url, reloadTimes) {
          if (/reloadAssets=(\d+)&?/.test(url)) {
            return url.replace('reloadAssets=' + reloadTimes, 'reloadAssets=' + (1 + reloadTimes))
          }
          return url + (url.indexOf('?') != -1 ? '&' : '?') + 'reloadAssets=' + (reloadTimes + 1)
        }
        options = options || {
          // LINK: 0,
          SCRIPT: 0
        }
        var reloadTimes = options[nodeName] || 0
        var linkKey = 'src'

        if (!htmlNode[linkKey]) return
        if (reloadTimes == 0 || reloadTimes > 1) return
        var replaceUrl = modifyReloadQry(htmlNode[linkKey], reloadTimes - 1)
        replaceUrl = replaceUrl.replace('static-1.talk-fun.com', 'static-2.talk-fun.com')
        htmlNode[linkKey] = replaceUrl
      }
    })
  ],
  output: {
    // filename: null,
    // path: path.resolve(__dirname, 'dist'),
    // libraryExport: 'default',
    // library: 'MT'
    path: path.resolve(__dirname, 'dist'),
    filename: 'sdk.js',
    publicPath: '',
    libraryTarget: 'umd',
    library: '',
    jsonpFunction: 'vodSdkWebpackJsonp'
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: {
            safari10: true
          }
        }
      })
    ],
    splitChunks: {
      chunks: 'async',
      minSize: 0,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
}
// ## 暴露 ##
module.exports = function (content, params, meta) {
  baseConf.mode = params.mode
  // console.log(`meta ==> ${meta}`)
  let watch = true
  if (params.sdkVersion === 'test') {
    watch = true
    baseConf.devtool = 'eval'
  } else {
    watch = false
  }
  if (baseConf.mode == 'development') {
    watch = true
    baseConf.devtool = 'eval-source-map'
  }
  // watch
  baseConf.watch = watch
  baseConf.devtool = 'eval-source-map'
  if (params.sdkVersion) {
    vcode.version = Number(params.sdkVersion) ? params.sdkVersion.toFixed(1) : params.sdkVersion
  }
  console.log('#SDK云课堂[点播] ==> 打包版本', vcode.version)
  // 环境变量
  let o = new webpack.DefinePlugin({
    'process.env.SDK_VERSION': `"${params.sdkVersion}"`,
    'process.env.APP_BASE_API': "'https://open.talk-fun.com/'",
    'process.env.GIT_PACK': `"${gitBranchName}"`
  })
  baseConf.plugins.push(o)

  // output => file
  baseConf.output.publicPath = '//static-1.talk-fun.com/open/maituo_v2/dist/vod/chunk-pack/'
  baseConf.output.chunkFilename = `v_${vcode.version}/sdk-[name][hash:8].min.js`
  baseConf.output.filename = `sdk-vod.${vcode.version}.min.js`
  return baseConf
}
